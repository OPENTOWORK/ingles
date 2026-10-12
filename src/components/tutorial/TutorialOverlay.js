'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { resolveTutorialSteps } from '@/components/tutorial/tutorialSteps';
import {
  chooseCardSide,
  clampRectToViewport,
  easeInOutCubic,
  lerpPoint,
  lerpRect,
  padRect,
  placeCardAtSide,
  unionRects,
} from '@/lib/tutorialGeometry';
import { sitePublicPath } from '@/utils/sitePublicPath';
import styles from './TutorialOverlay.module.css';

const MOVE_MS = 560;
const CLOSE_MS = 240;
const POLL_MS = 70;
const TARGET_TIMEOUT_MS = 12000;
const DEFAULT_PADDING = 10;
const SHEET_MQ = '(max-width: 639px)';
/** Cabecera y menú lateral están fijos: lo que hay dentro nunca necesita scroll. */
const FIXED_AREAS = '.site-header, .app-side-menu';
const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
const MASCOTS = {
  clap: '/tutorial/dralo-clap.webp',
  cheer: '/tutorial/dralo-cheer.webp',
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readRect(el) {
  const box = el.getBoundingClientRect();
  return { x: box.left, y: box.top, w: box.width, h: box.height };
}

function isVisible(el) {
  const box = el.getBoundingClientRect();
  return box.width > 2 && box.height > 2;
}

function sameRect(a, b) {
  return (
    Boolean(a && b) &&
    Math.abs(a.x - b.x) < 0.5 &&
    Math.abs(a.y - b.y) < 0.5 &&
    Math.abs(a.w - b.w) < 0.5 &&
    Math.abs(a.h - b.h) < 0.5
  );
}

function findTarget(selectors) {
  for (const selector of selectors) {
    for (const el of document.querySelectorAll(selector)) {
      if (isVisible(el)) return el;
    }
  }
  return null;
}

function normalizePath(path = '') {
  return path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
}

function isOnRoute(route) {
  return !route || normalizePath(window.location.pathname) === normalizePath(route);
}

function focusRadius(el, pad) {
  const radius = parseFloat(window.getComputedStyle(el).borderTopLeftRadius) || 0;
  return Math.min(radius + pad, 28);
}

/** Alto final de la tarjeta, sin esperar a que termine la animación de altura. */
function measureCard(card, body, content) {
  return {
    w: card.offsetWidth,
    h: card.offsetHeight - (body?.offsetHeight || 0) + (content?.offsetHeight || 0),
  };
}

function scrollParentOf(el) {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight + 1) return node;
  }
  return null;
}

function headerBottom() {
  const header = document.querySelector('.site-header');
  return header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
}

/**
 * Desplaza lo justo para ver el destacado y devuelve dónde quedará al terminar.
 * Deja sitio a la tarjeta arriba o abajo solo si caben los dos a la vez.
 */
function bringIntoView(el, { reserveTop = 0, reserveBottom = 0, smooth }) {
  const rect = readRect(el);
  if (el.closest(FIXED_AREAS)) return rect;
  let top = headerBottom() + 16;
  let bottom = window.innerHeight - 16;
  if (rect.h + reserveTop + reserveBottom <= bottom - top) {
    top += reserveTop;
    bottom -= reserveBottom;
  }
  if (rect.y >= top && rect.y + rect.h <= bottom) return rect;

  const behavior = smooth ? 'smooth' : 'auto';
  if (scrollParentOf(el)) {
    el.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
    return { ...rect, y: top + Math.max(0, (bottom - top - rect.h) / 2) };
  }
  const room = bottom - top;
  const offset = rect.h > room ? top : top + (room - rect.h) / 2;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const nextScroll = Math.min(maxScroll, Math.max(0, window.scrollY + rect.y - offset));
  window.scrollTo({ top: nextScroll, behavior });
  return { ...rect, y: rect.y - (nextScroll - window.scrollY) };
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TutorialOverlay({ onClose }) {
  const router = useRouter();
  const [steps] = useState(resolveTutorialSteps);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [locating, setLocating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const spotRef = useRef(null);
  const cardRef = useRef(null);
  const nudgeRef = useRef(null);
  const bodyRef = useRef(null);
  const contentRef = useRef(null);
  const primaryRef = useRef(null);
  /** Elemento destacado ahora mismo; lo lee el bucle de animación en cada frame. */
  const targetRef = useRef(null);
  const motionRef = useRef({ start: 0, spotFrom: null, cardFrom: null, spot: null, card: null, side: null });
  const closedRef = useRef(false);
  const keysRef = useRef({});

  const step = steps[index];
  const total = steps.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  /** El foco y la tarjeta salen desde donde estén hacia el siguiente destino. */
  const startMove = useCallback((side = null) => {
    const motion = motionRef.current;
    motion.start = performance.now();
    motion.spotFrom = motion.spot;
    motion.cardFrom = motion.card;
    motion.side = side;
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return undefined;
    const sheetQuery = window.matchMedia(SHEET_MQ);
    const reduceMotion = prefersReducedMotion();
    let raf = 0;

    const frame = (now) => {
      const card = cardRef.current;
      const spot = spotRef.current;
      if (!card || !spot) return;
      const motion = motionRef.current;
      const viewport = { w: window.innerWidth, h: window.innerHeight };
      const sheet = sheetQuery.matches;
      const size = measureCard(card, bodyRef.current, contentRef.current);
      const target = targetRef.current;
      if (target && !target.el.isConnected) {
        // React puede volver a montar el destacado al actualizar la página.
        target.el = findTarget(target.selectors) || target.el;
      }

      let focus = null;
      if (target?.el.isConnected) {
        const rects = [target.el, ...target.extras(target.el)]
          .map(readRect)
          .filter((rect) => rect.w > 0 && rect.h > 0);
        if (rects.length) focus = padRect(unionRects(rects), target.pad);
      }
      const anchor = focus ? clampRectToViewport(focus, viewport) || focus : null;
      if (anchor && !motion.side) {
        motion.side = chooseCardSide({
          target: anchor,
          card: size,
          viewport,
          sheet,
          preferred: target.placement,
        });
      }

      const cardGoal = placeCardAtSide({
        side: anchor ? motion.side : 'center',
        target: anchor,
        card: size,
        viewport,
        sheet,
      });
      const spotGoal = anchor
        ? { ...anchor, r: target.radius }
        : { x: cardGoal.x + size.w / 2, y: cardGoal.y + size.h / 2, w: 0, h: 0, r: 0 };

      const progress =
        reduceMotion || !motion.spotFrom ? 1 : Math.min(1, (now - motion.start) / MOVE_MS);
      const eased = easeInOutCubic(progress);
      const nextSpot = progress < 1 ? lerpRect(motion.spotFrom, spotGoal, eased) : spotGoal;
      const nextCard =
        progress < 1 && motion.cardFrom ? lerpPoint(motion.cardFrom, cardGoal, eased) : cardGoal;

      if (!sameRect(nextSpot, motion.spot) || nextSpot.r !== motion.spot?.r) {
        spot.style.transform = `translate3d(${nextSpot.x}px, ${nextSpot.y}px, 0)`;
        spot.style.width = `${nextSpot.w}px`;
        spot.style.height = `${nextSpot.h}px`;
        spot.style.borderRadius = `${nextSpot.r}px`;
      }
      if (
        !motion.card ||
        Math.abs(nextCard.x - motion.card.x) > 0.25 ||
        Math.abs(nextCard.y - motion.card.y) > 0.25
      ) {
        card.style.transform = `translate3d(${nextCard.x}px, ${nextCard.y}px, 0)`;
      }
      motion.spot = nextSpot;
      motion.card = nextCard;
    };

    const loop = (now) => {
      frame(now);
      raf = window.requestAnimationFrame(loop);
    };
    frame(performance.now());
    raf = window.requestAnimationFrame(loop);

    const onResize = () => {
      motionRef.current.side = null;
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !step) return undefined;
    let cancelled = false;
    let timer = 0;
    const restore = [];
    const selectors = step.target ? [].concat(step.target) : [];
    const needsRoute = !isOnRoute(step.route);

    // En la misma página el foco viaja directo al siguiente destacado; si cambia
    // de página o no hay destacado, se recoge en la tarjeta mientras tanto.
    if (!selectors.length || needsRoute) {
      targetRef.current = null;
      startMove();
    }
    if (needsRoute) router.push(step.route);
    if (!selectors.length) {
      setLocating(false);
      return undefined;
    }
    setLocating(true);

    const started = performance.now();
    let lastRect = null;

    const reveal = (el) => {
      if (step.reveal) {
        // Si se vuelve a este paso antes de cerrarlo, el nuevo marcador lo mantiene abierto.
        const token = String(performance.now());
        el.setAttribute('data-tutorial-open', token);
        restore.push(() => {
          if (el.getAttribute('data-tutorial-open') === token) el.removeAttribute('data-tutorial-open');
        });
      }
      const extras = (node) =>
        step.include ? Array.from(node.querySelectorAll(step.include)).filter(isVisible) : [];
      const pad = step.padding ?? DEFAULT_PADDING;
      const sheet = window.matchMedia(SHEET_MQ).matches;
      const viewport = { w: window.innerWidth, h: window.innerHeight };
      const size = measureCard(cardRef.current, bodyRef.current, contentRef.current);
      const before = readRect(el);
      const landing = bringIntoView(el, {
        reserveTop: !sheet && step.placement === 'top' ? size.h + pad + 16 : 0,
        reserveBottom: sheet ? size.h + 24 : 0,
        smooth: !prefersReducedMotion(),
      });
      const shift = landing.y - before.y;
      const extraRects = extras(el).map((child) => {
        const rect = readRect(child);
        return { ...rect, y: rect.y + shift };
      });
      const predicted = padRect(unionRects([landing, ...extraRects]), pad);
      const side = chooseCardSide({
        target: clampRectToViewport(predicted, viewport) || predicted,
        card: size,
        viewport,
        sheet,
        preferred: step.placement,
      });
      targetRef.current = {
        el,
        selectors,
        extras,
        pad,
        radius: focusRadius(el, pad),
        placement: step.placement || null,
      };
      startMove(side);
      setLocating(false);
    };

    const poll = () => {
      if (cancelled) return;
      const el = isOnRoute(step.route) ? findTarget(selectors) : null;
      if (el) {
        const rect = readRect(el);
        // Tras cambiar de página se espera a que el destacado deje de moverse.
        if (!needsRoute || sameRect(rect, lastRect)) {
          reveal(el);
          return;
        }
        lastRect = rect;
      }
      if (performance.now() - started > TARGET_TIMEOUT_MS) {
        targetRef.current = null;
        startMove();
        setLocating(false);
        return;
      }
      timer = window.setTimeout(poll, POLL_MS);
    };
    timer = window.setTimeout(poll, needsRoute ? 120 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (restore.length) {
        // El desplegable se cierra cuando el foco ya se ha recogido, no de golpe.
        window.setTimeout(() => restore.forEach((fn) => fn()), MOVE_MS / 2);
      }
    };
  }, [mounted, step, router, startMove]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return undefined;
    const sync = () => {
      body.style.height = `${content.offsetHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(content);
    return () => observer.disconnect();
  }, [mounted, index]);

  const finish = useCallback(
    (href = null) => {
      if (closedRef.current) return;
      closedRef.current = true;
      setClosing(true);
      if (href) router.push(href);
      window.setTimeout(onClose, prefersReducedMotion() ? 0 : CLOSE_MS);
    },
    [onClose, router],
  );

  const goNext = useCallback(() => {
    if (isLast) {
      finish(step.cta?.href);
      return;
    }
    setDirection('next');
    setIndex((current) => Math.min(current + 1, total - 1));
  }, [finish, isLast, step, total]);

  const goBack = useCallback(() => {
    setDirection('back');
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const nudge = useCallback(() => {
    const el = nudgeRef.current;
    if (!el) return;
    el.classList.remove(styles.nudge);
    void el.offsetWidth;
    el.classList.add(styles.nudge);
  }, []);

  keysRef.current = { goNext, goBack, finish, isLast };

  useEffect(() => {
    if (!mounted) return undefined;
    const onKeyDown = (event) => {
      const keys = keysRef.current;
      if (event.key === 'Escape') {
        event.preventDefault();
        keys.finish();
      } else if (event.key === 'ArrowRight' && !keys.isLast) {
        event.preventDefault();
        keys.goNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        keys.goBack();
      } else if (event.key === 'Tab') {
        const focusable = Array.from(cardRef.current?.querySelectorAll(FOCUSABLE) || []).filter(
          (el) => isVisible(el) && window.getComputedStyle(el).visibility !== 'hidden',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const inside = cardRef.current.contains(document.activeElement);
        if (event.shiftKey && (document.activeElement === first || !inside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return undefined;
    const previous = document.activeElement;
    const timer = window.setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 80);
    return () => {
      window.clearTimeout(timer);
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [mounted]);

  if (!mounted || !step) return null;

  const primaryLabel = isLast ? step.cta?.label || 'Terminar' : step.nextLabel || 'Siguiente';
  const secondaryLabel = step.skipLabel || 'Saltar';

  return createPortal(
    <div
      className={styles.root}
      data-closing={closing ? 'true' : undefined}
      data-locating={locating ? 'true' : undefined}
    >
      <div className={styles.shield} onClick={nudge} aria-hidden />
      <div ref={spotRef} className={styles.spot} aria-hidden />
      <div
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-text"
      >
        <div ref={nudgeRef}>
          <div className={styles.cardInner}>
            <div className={styles.progress} aria-hidden>
              <span className={styles.progressFill} style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
            <div className={styles.head}>
              <span className={styles.eyebrow}>{step.eyebrow}</span>
              <span className={styles.count}>
                Paso {index + 1} de {total}
              </span>
              <button
                type="button"
                className={styles.close}
                onClick={() => finish()}
                aria-label="Cerrar el tutorial"
              >
                <CloseIcon />
              </button>
            </div>
            <div ref={bodyRef} className={styles.body} aria-live="polite">
              <div
                key={step.id}
                ref={contentRef}
                className={`${styles.content}${step.mascot ? ` ${styles.contentCentered}` : ''}`}
                data-dir={direction}
              >
                {step.mascot ? (
                  <img
                    className={styles.mascot}
                    src={sitePublicPath(MASCOTS[step.mascot])}
                    alt=""
                    width={96}
                    height={96}
                  />
                ) : null}
                <h2 id="tutorial-title" className={styles.title}>
                  {step.title}
                </h2>
                <p id="tutorial-text" className={styles.text}>
                  {step.body}
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}${isFirst ? ` ${styles.hidden}` : ''}`}
                onClick={goBack}
                tabIndex={isFirst ? -1 : undefined}
                aria-hidden={isFirst || undefined}
              >
                Atrás
              </button>
              <div className={styles.actionsEnd}>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => finish()}>
                  {secondaryLabel}
                </button>
                <button
                  ref={primaryRef}
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={goNext}
                >
                  {primaryLabel}
                  <ArrowIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
