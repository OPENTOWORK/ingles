'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getGuidedTourSteps } from '@/components/home/homeHowItWorksData';
import { useUserRole } from '@/context/UserRoleContext';
import {
  markTutorialCompleted,
  markTutorialDismissed,
  markTutorialShownThisSession,
} from '@/lib/homeTutorialStorage';

const MOBILE_NAV_MQ = '(max-width: 900px)';
const TARGET_WAIT_MS = 4000;
const TARGET_POLL_MS = 80;
const SPOTLIGHT_PAD = 10;

function parseRoute(route) {
  if (!route) return { path: null, hash: null, query: null };
  const [beforeHash, hash = ''] = route.split('#');
  const [path, query = ''] = beforeHash.split('?');
  return {
    path: path || null,
    hash: hash || null,
    query: query || null,
  };
}

function pathMatches(pathname, routePath, searchParams, routeQuery) {
  if (!routePath) return true;
  const norm = pathname?.replace(/\/$/, '') || '';
  const want = routePath.replace(/\/$/, '');
  if (norm !== want) return false;
  if (!routeQuery) return true;
  const expected = new URLSearchParams(routeQuery);
  for (const [key, value] of expected.entries()) {
    if (searchParams?.get(key) !== value) return false;
  }
  return true;
}

function findVisibleTarget(selector) {
  if (!selector || typeof document === 'undefined') return null;
  const nodes = document.querySelectorAll(selector);
  for (const el of nodes) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 2 && rect.height > 2) return el;
  }
  return nodes[0] ?? null;
}

function openMobileNavIfNeeded() {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia(MOBILE_NAV_MQ).matches) return;
  const drawer = document.querySelector('.app-nav__drawer.is-open');
  if (drawer) return;
  const toggle = document.querySelector('.app-nav__toggle');
  if (toggle) toggle.click();
}

function closeMobileNavIfOpen() {
  if (typeof window === 'undefined') return;
  const drawer = document.querySelector('.app-nav__drawer.is-open');
  if (!drawer) return;
  document.querySelector('.app-nav__toggle')?.click();
}

function scrollTargetIntoView(el, step) {
  el?.scrollIntoView?.({
    behavior: 'smooth',
    block: step?.cardPlacement === 'center' ? 'start' : 'center',
    inline: 'nearest',
  });
}

const CARD_EST_HEIGHT = 300;
const CARD_EST_HALF_WIDTH = 200;
const VIEWPORT_MARGIN = 16;
const TOOLTIP_GAP = 14;

function computeTooltipStyle(rect, step) {
  if (!rect || step?.cardPlacement === 'center') return undefined;

  const spaceBelow = window.innerHeight - (rect.top + rect.height + TOOLTIP_GAP);
  const spaceAbove = rect.top - TOOLTIP_GAP;
  let placeBelow = spaceBelow >= CARD_EST_HEIGHT;

  if (!placeBelow && spaceAbove < CARD_EST_HEIGHT) {
    const top = Math.max(
      VIEWPORT_MARGIN,
      (window.innerHeight - CARD_EST_HEIGHT) / 2,
    );
    return {
      top: `${top}px`,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  let top = placeBelow ? rect.top + rect.height + TOOLTIP_GAP : rect.top - TOOLTIP_GAP;
  const transform = placeBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)';

  if (placeBelow) {
    top = Math.min(top, window.innerHeight - CARD_EST_HEIGHT - VIEWPORT_MARGIN);
  } else {
    const visualTop = top - CARD_EST_HEIGHT;
    if (visualTop < VIEWPORT_MARGIN) {
      top = VIEWPORT_MARGIN + CARD_EST_HEIGHT;
    }
  }
  top = Math.max(VIEWPORT_MARGIN, top);

  const left = Math.min(
    Math.max(VIEWPORT_MARGIN + CARD_EST_HALF_WIDTH, rect.left + rect.width / 2),
    window.innerWidth - VIEWPORT_MARGIN - CARD_EST_HALF_WIDTH,
  );

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform,
  };
}

export default function GuidedTourOverlay({ stepIndex, onStepIndexChange, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userRole } = useUserRole();
  const steps = useMemo(() => getGuidedTourSteps(userRole), [userRole]);
  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;
  const [rect, setRect] = useState(null);
  const [targetReady, setTargetReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(
    (completed) => {
      if (completed) markTutorialCompleted();
      else markTutorialDismissed();
      onClose();
    },
    [onClose],
  );

  const measureTarget = useCallback(() => {
    if (!step?.target) {
      setRect(null);
      setTargetReady(true);
      return;
    }
    const el = findVisibleTarget(step.target);
    if (!el) {
      setRect(null);
      setTargetReady(false);
      return;
    }
    const box = el.getBoundingClientRect();
    setRect({
      top: box.top - SPOTLIGHT_PAD,
      left: box.left - SPOTLIGHT_PAD,
      width: box.width + SPOTLIGHT_PAD * 2,
      height: box.height + SPOTLIGHT_PAD * 2,
    });
    setTargetReady(true);
  }, [step]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !step) return undefined;
    markTutorialShownThisSession();
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, step, close]);

  useEffect(() => {
    if (!step) return;
    setTargetReady(!step.target);
    setRect(null);

    if (step.openNavOnMobile) {
      openMobileNavIfNeeded();
    } else {
      closeMobileNavIfOpen();
    }

    const { path, hash, query } = parseRoute(step.route);
    if (path && !pathMatches(pathname, path, searchParams, query)) {
      const base = query ? `${path}?${query}` : path;
      const url = hash ? `${base}#${hash}` : base;
      router.push(url);
      return;
    }
    if (hash && pathMatches(pathname, path, searchParams, query)) {
      const applyHash = () => {
        if (window.location.hash !== `#${hash}`) {
          window.location.hash = hash;
        }
      };
      applyHash();
      window.setTimeout(applyHash, 120);
    }
  }, [step, stepIndex, pathname, searchParams, router]);

  useEffect(() => {
    if (!step?.target) return undefined;

    let cancelled = false;
    const started = Date.now();

    const tryResolve = () => {
      if (cancelled) return;
      if (step.openNavOnMobile) openMobileNavIfNeeded();
      const el = findVisibleTarget(step.target);
      if (el) {
        if (step.scrollTarget) scrollTargetIntoView(el, step);
        measureTarget();
        return;
      }
      if (Date.now() - started < TARGET_WAIT_MS) {
        window.setTimeout(tryResolve, TARGET_POLL_MS);
      } else {
        setTargetReady(true);
        setRect(null);
      }
    };

    const delay = step.route ? 280 : 60;
    const timer = window.setTimeout(tryResolve, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step, stepIndex, pathname, measureTarget]);

  useLayoutEffect(() => {
    if (!step?.target || !targetReady) return undefined;
    measureTarget();
    const onReflow = () => measureTarget();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [step, targetReady, measureTarget]);

  const goNext = () => {
    if (isLast) close(true);
    else onStepIndexChange(stepIndex + 1);
  };

  const goBack = () => {
    if (stepIndex > 0) onStepIndexChange(stepIndex - 1);
  };

  if (!mounted || !step) return null;

  const centeredCard = !rect || step.cardPlacement === 'center';
  const tooltipStyle = computeTooltipStyle(rect, step);

  return createPortal(
    <div className="guided-tour" role="presentation">
      <button
        type="button"
        className={`guided-tour__backdrop${rect ? ' guided-tour__backdrop--clear' : ''}`}
        aria-label="Close tour"
        onClick={() => close(false)}
      />
      {rect ? (
        <div
          className="guided-tour__spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          aria-hidden
        />
      ) : null}
      <div
        className={`guided-tour__card${centeredCard ? ' guided-tour__card--centered' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        style={tooltipStyle}
      >
        <p className="guided-tour__section">{step.sectionLabel}</p>
        <p className="guided-tour__step-meta">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <div className="guided-tour__dots" aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`guided-tour__dot${i === stepIndex ? ' guided-tour__dot--active' : ''}${i < stepIndex ? ' guided-tour__dot--done' : ''}`}
            />
          ))}
        </div>
        <h2 id="guided-tour-title" className="guided-tour__title">
          {step.title}
        </h2>
        <p className="guided-tour__desc">{step.description}</p>
        {step.href ? (
          <p className="guided-tour__go">
            <Link href={step.href} className="guided-tour__link" onClick={() => close(true)}>
              Go to this section →
            </Link>
          </p>
        ) : null}
        {!step.target && !targetReady ? (
          <p className="guided-tour__hint guided-tour__hint--warn">Loading section…</p>
        ) : null}
        {step.target && targetReady && !rect ? (
          <p className="guided-tour__hint">
            Use the link above if the highlighted area is not visible on this screen size.
          </p>
        ) : null}
        <div className="guided-tour__actions">
          {stepIndex > 0 ? (
            <button type="button" className="guided-tour__btn guided-tour__btn--ghost" onClick={goBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="guided-tour__actions-end">
            <button
              type="button"
              className="guided-tour__btn guided-tour__btn--ghost"
              onClick={() => close(false)}
            >
              Skip
            </button>
            <button
              type="button"
              className="guided-tour__btn guided-tour__btn--primary"
              onClick={goNext}
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
