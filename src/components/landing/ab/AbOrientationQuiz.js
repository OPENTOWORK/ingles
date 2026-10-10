'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Hourglass,
  Lightbulb,
  Mic,
  PenLine,
  Star,
  Target,
  Timer,
  X,
} from 'lucide-react';
import { buildRegisterHref } from '@/lib/abExperiment';

const QUESTIONS = [
  {
    id: 'goal',
    tone: 'purple',
    icon: Target,
    title: '¿Para qué necesitas el B2?',
    options: [
      { id: 'oposicion', label: 'Oposición', icon: GraduationCap },
      { id: 'universidad', label: 'Universidad', icon: Building2 },
      { id: 'trabajo', label: 'Trabajo', icon: Briefcase },
      { id: 'cambridge', label: 'Cambridge', icon: FileText },
    ],
  },
  {
    id: 'when',
    tone: 'orange',
    icon: Calendar,
    title: '¿Cuándo te examinas?',
    options: [
      { id: 'soon', label: 'En menos de 1 mes', icon: Timer },
      { id: 'mid', label: '1 – 3 meses', icon: Hourglass },
      { id: 'later', label: 'Más adelante', icon: Calendar },
    ],
  },
  {
    id: 'skill',
    tone: 'green',
    icon: BarChart3,
    title: '¿Qué parte te cuesta más?',
    options: [
      { id: 'reading', label: 'Reading', icon: BookOpen },
      { id: 'use', label: 'Use of English', icon: FileText },
      { id: 'writing', label: 'Writing', icon: PenLine },
      { id: 'speaking', label: 'Speaking', icon: Mic },
    ],
  },
  {
    id: 'time',
    tone: 'blue',
    icon: Clock,
    title: '¿Cuánto tiempo puedes dedicar a la semana?',
    options: [
      { id: 'low', label: 'Menos de 2 horas', icon: Clock },
      { id: 'mid', label: '2 – 4 horas', icon: Clock },
      { id: 'high', label: '5+ horas', icon: Clock },
    ],
  },
  {
    id: 'help',
    tone: 'yellow',
    icon: Star,
    title: '¿Qué te ayudaría más ahora mismo?',
    options: [
      { id: 'level', label: 'Saber mi nivel', icon: BarChart3 },
      { id: 'exams', label: 'Practicar exámenes', icon: FileText },
      { id: 'errors', label: 'Corregir errores', icon: PenLine },
      { id: 'plan', label: 'Tener un plan', icon: Lightbulb },
    ],
  },
];

const SKILL_LABEL = {
  reading: 'Reading',
  use: 'Use of English',
  writing: 'Writing',
  speaking: 'Speaking',
};

const GOAL_LINE = {
  oposicion: 'Para una oposición importa acertar y no quedarte sin tiempo.',
  universidad: 'Para la universidad pesan más la lectura y la redacción.',
  trabajo: 'Para el trabajo, prioriza que se te entienda y el uso correcto.',
  cambridge: 'Para Cambridge, practica con el formato del B2 First.',
};

const WHEN_LINE = {
  soon: 'El examen está a menos de un mes: esta semana haz una práctica de esa parte y revisa solo esos fallos.',
  mid: 'Tienes de uno a tres meses: una sesión de examen y otra de la parte que te cuesta.',
  later: 'Aún falta tiempo: no abras las cuatro partes. Empieza por la que más te cuesta.',
};

const TIME_LINE = {
  low: 'Con menos de dos horas a la semana, termina una tarea antes de abrir otra.',
  mid: 'Con dos a cuatro horas, deja una para el examen y otra para corregir el fallo.',
  high: 'Con cinco horas o más, trabaja la parte difícil y repasa otra en la misma semana.',
};

const HELP_LINE = {
  level: 'Lo primero es ver tu nivel: una práctica corta y el resultado delante.',
  exams: 'Ahora te ayuda más practicar exámenes, empezando por esa parte.',
  errors: 'Céntrate en corregir fallos concretos, no en un temario entero.',
  plan: 'El orden es este: parte difícil, un examen y, al final, la revisión.',
};

export function buildOrientationPlan(answers) {
  const skill = SKILL_LABEL[answers.skill];
  if (!skill) return null;
  return {
    title: `Empieza por ${skill}`,
    lines: [GOAL_LINE[answers.goal], HELP_LINE[answers.help], WHEN_LINE[answers.when], TIME_LINE[answers.time]].filter(
      Boolean,
    ),
  };
}

function QuestionStep({ titleId, question, index, total, selectedId, onChoose, onBack }) {
  const Icon = question.icon;
  return (
    <div className="ab-ask__step">
      <p className="ab-ask__progress">
        Pregunta {index + 1} de {total}
      </p>
      <header className="ab-ask__head">
        <h2 id={titleId}>Cuéntanos qué necesitas</h2>
        <p>Responde y pasamos a la siguiente.</p>
      </header>
      <section className="ab-ask__q">
        <h3>
          <span className={`ab-ask__mark ab-ask__mark--${question.tone}`}>
            <Icon size={16} aria-hidden />
          </span>
          {question.title}
        </h3>
        <div className="ab-ask__options">
          {question.options.map((option) => {
            const OptionIcon = option.icon;
            const selected = selectedId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={`ab-ask__opt${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onChoose(question.id, option.id)}
              >
                <OptionIcon size={15} aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>
      <p className="ab-ask__note">Es rápido, gratis y sin tarjeta</p>
      {onBack ? (
        <button type="button" className="ab-ask__back" onClick={onBack}>
          Pregunta anterior
        </button>
      ) : null}
    </div>
  );
}

export default function AbOrientationQuiz({ pageType, variant, source = 'direct' }) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [plan, setPlan] = useState(null);
  const [href, setHref] = useState('/login/');

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    setHref(buildRegisterHref({ pageType, variant, source, searchParams: params }));
  }, [pageType, variant, source]);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function choose(questionId, optionId) {
    const next = { ...answers, [questionId]: optionId };
    const fromStep = step;
    setAnswers(next);
    window.setTimeout(() => {
      if (fromStep >= QUESTIONS.length - 1) {
        setPlan(buildOrientationPlan(next));
        return;
      }
      setStep((current) => (current === fromStep ? current + 1 : current));
    }, 160);
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <>
      {open ? (
        <div className="ab-ask" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="ab-ask__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="ab-ask__close" onClick={() => setOpen(false)} aria-label="Cerrar">
              <X size={18} aria-hidden />
            </button>

            {plan ? (
              <div className="ab-ask__result">
                <p className="ab-ask__kicker">Tu enfoque</p>
                <h2 id={titleId}>{plan.title}</h2>
                <ul>
                  {plan.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="ab-ask__actions">
                  <Link href={href} className="ab-ask__go">
                    Quiero mi plan gratis
                    <span aria-hidden>→</span>
                  </Link>
                  <button type="button" className="ab-ask__explore" onClick={() => setOpen(false)}>
                    Seguir explorando
                  </button>
                </div>
              </div>
            ) : (
              <QuestionStep
                titleId={titleId}
                question={QUESTIONS[step]}
                index={step}
                total={QUESTIONS.length}
                selectedId={answers[QUESTIONS[step].id]}
                onChoose={choose}
                onBack={step > 0 ? goBack : null}
              />
            )}
          </div>
        </div>
      ) : (
        <button type="button" className="ab-ask__launcher" onClick={() => setOpen(true)}>
          Cuéntanos qué necesitas
        </button>
      )}
    </>
  );
}
