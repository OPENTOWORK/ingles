import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FOUNDING_SURVEY_ELIGIBLE_SLOTS,
  FOUNDING_SURVEY_QUESTIONS,
  computeSurveyDeadline,
  daysLeftToAnswer,
  getSurveyState,
  isSurveyDue,
  isSurveyExpired,
  needsReminder,
  summarizeFoundingSurveyCampaign,
  validateSurveyAnswers,
} from '@/lib/foundingSurvey.rules.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-16T09:00:00Z');

function daysBefore(days) {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

function validAnswers(overrides = {}) {
  return {
    valoracion_general: 4,
    facilidad_uso: 4,
    diseno: 5,
    calidad_ejercicios: 4,
    rendimiento: 3,
    utilidad_ia: 'Muy útiles',
    recomendacion: 9,
    mejor_parte: 'Exam practice',
    prioridad_mejora: 'Más ejercicios y más variedad',
    mejorarias: 'Más ejercicios de listening.',
    ...overrides,
  };
}

describe('isSurveyDue', () => {
  it('is due exactly at 30 days after the grant', () => {
    assert.equal(isSurveyDue(daysBefore(30), NOW), true);
    assert.equal(isSurveyDue(daysBefore(45), NOW), true);
  });

  it('is not due before 30 days', () => {
    assert.equal(isSurveyDue(daysBefore(29), NOW), false);
    assert.equal(isSurveyDue(daysBefore(0), NOW), false);
  });

  it('handles missing or invalid dates', () => {
    assert.equal(isSurveyDue(null, NOW), false);
    assert.equal(isSurveyDue('no-es-fecha', NOW), false);
  });
});

describe('computeSurveyDeadline', () => {
  it('gives the student 7 days from the send date', () => {
    const sentAt = '2026-10-01T09:00:00Z';
    assert.equal(computeSurveyDeadline(sentAt).toISOString(), '2026-10-08T09:00:00.000Z');
  });

  it('returns null without a send date', () => {
    assert.equal(computeSurveyDeadline(null), null);
  });
});

describe('isSurveyExpired', () => {
  it('expires an unanswered survey past its deadline', () => {
    assert.equal(isSurveyExpired({ vence_en: daysBefore(1) }, NOW), true);
  });

  it('does not expire one still inside the deadline', () => {
    const future = new Date(NOW.getTime() + DAY_MS).toISOString();
    assert.equal(isSurveyExpired({ vence_en: future }, NOW), false);
  });

  it('never expires an answered or already revoked survey', () => {
    assert.equal(
      isSurveyExpired({ vence_en: daysBefore(5), respondida_en: daysBefore(6) }, NOW),
      false,
    );
    assert.equal(
      isSurveyExpired({ vence_en: daysBefore(5), plan_revocado_en: daysBefore(1) }, NOW),
      false,
    );
  });
});

describe('needsReminder', () => {
  it('reminds 5 days after sending when still pending', () => {
    const row = { enviada_en: daysBefore(5), vence_en: new Date(NOW.getTime() + 2 * DAY_MS) };
    assert.equal(needsReminder(row, NOW), true);
  });

  it('does not remind twice', () => {
    const row = {
      enviada_en: daysBefore(5),
      vence_en: new Date(NOW.getTime() + 2 * DAY_MS),
      recordatorio_enviado_en: daysBefore(0),
    };
    assert.equal(needsReminder(row, NOW), false);
  });

  it('does not remind too early, nor once expired', () => {
    assert.equal(needsReminder({ enviada_en: daysBefore(2) }, NOW), false);
    assert.equal(
      needsReminder({ enviada_en: daysBefore(10), vence_en: daysBefore(3) }, NOW),
      false,
    );
  });
});

describe('daysLeftToAnswer', () => {
  it('rounds up remaining whole days and never goes negative', () => {
    assert.equal(daysLeftToAnswer({ vence_en: new Date(NOW.getTime() + 3 * DAY_MS) }, NOW), 3);
    assert.equal(daysLeftToAnswer({ vence_en: daysBefore(2) }, NOW), 0);
  });
});

describe('getSurveyState', () => {
  it('classifies every lifecycle state', () => {
    assert.equal(getSurveyState(null, NOW), 'inexistente');
    assert.equal(getSurveyState({ respondida_en: daysBefore(1) }, NOW), 'respondida');
    assert.equal(getSurveyState({ plan_revocado_en: daysBefore(1) }, NOW), 'revocada');
    assert.equal(getSurveyState({ vence_en: daysBefore(1) }, NOW), 'vencida');
    assert.equal(
      getSurveyState({ vence_en: new Date(NOW.getTime() + DAY_MS) }, NOW),
      'pendiente',
    );
  });
});

describe('validateSurveyAnswers', () => {
  it('accepts a complete response and drops unknown fields', () => {
    const result = validateSurveyAnswers({ ...validAnswers(), campo_raro: 'x' });
    assert.equal(result.ok, true);
    assert.equal(result.answers.valoracion_general, 4);
    assert.equal(result.answers.campo_raro, undefined);
  });

  it('requires every mandatory question', () => {
    const result = validateSurveyAnswers({ valoracion_general: 4 });
    assert.equal(result.ok, false);
    assert.equal(result.errors.mejorarias, 'Esta pregunta es obligatoria.');
    assert.equal(result.errors.recomendacion, 'Esta pregunta es obligatoria.');
    assert.equal(result.errors.valoracion_general, undefined);
  });

  it('rejects scale values outside their range', () => {
    const tooHigh = validateSurveyAnswers(validAnswers({ valoracion_general: 9 }));
    assert.equal(tooHigh.ok, false);
    assert.equal(tooHigh.errors.valoracion_general, 'Elige un valor entre 1 y 5.');

    const npsZero = validateSurveyAnswers(validAnswers({ recomendacion: 0 }));
    assert.equal(npsZero.ok, true, 'el 0 es válido en una escala NPS');
  });

  it('rejects choices outside the offered options', () => {
    const result = validateSurveyAnswers(validAnswers({ mejor_parte: 'El logo' }));
    assert.equal(result.ok, false);
    assert.equal(result.errors.mejor_parte, 'Elige una de las opciones disponibles.');
  });

  it('rejects overlong free text', () => {
    const result = validateSurveyAnswers(validAnswers({ mejorarias: 'a'.repeat(1001) }));
    assert.equal(result.ok, false);
    assert.equal(result.errors.mejorarias, 'Máximo 1000 caracteres.');
  });

  it('rejects a blank open answer, since it is the point of the survey', () => {
    const result = validateSurveyAnswers(validAnswers({ mejorarias: '   ' }));
    assert.equal(result.ok, false);
    assert.equal(result.errors.mejorarias, 'Esta pregunta es obligatoria.');
  });
});

describe('summarizeFoundingSurveyCampaign', () => {
  it('counts each state', () => {
    const summary = summarizeFoundingSurveyCampaign(
      [
        { respondida_en: daysBefore(1) },
        { plan_revocado_en: daysBefore(1) },
        { vence_en: new Date(NOW.getTime() + DAY_MS) },
        { vence_en: daysBefore(1) },
      ],
      { claimedSlots: 20 },
      NOW,
    );

    assert.equal(summary.respondidas, 1);
    assert.equal(summary.revocadas, 1);
    assert.equal(summary.pendientes, 1);
    assert.equal(summary.vencidas, 1);
    assert.equal(summary.finished, false);
  });

  it('finishes only when all 50 slots are taken and nothing is left open', () => {
    const resolved = Array.from({ length: FOUNDING_SURVEY_ELIGIBLE_SLOTS }, () => ({
      respondida_en: daysBefore(1),
    }));

    const done = summarizeFoundingSurveyCampaign(resolved, { claimedSlots: 50 }, NOW);
    assert.equal(done.finished, true);

    const slotsLeft = summarizeFoundingSurveyCampaign(resolved, { claimedSlots: 49 }, NOW);
    assert.equal(slotsLeft.finished, false, 'quedan cupos por ocupar');

    const oneOpen = summarizeFoundingSurveyCampaign(
      [...resolved.slice(1), { vence_en: new Date(NOW.getTime() + DAY_MS) }],
      { claimedSlots: 50 },
      NOW,
    );
    assert.equal(oneOpen.finished, false, 'queda una encuesta sin resolver');
  });

  it('is not finished with no surveys sent yet', () => {
    assert.equal(summarizeFoundingSurveyCampaign([], { claimedSlots: 50 }, NOW).finished, false);
  });
});

describe('FOUNDING_SURVEY_QUESTIONS', () => {
  it('has unique ids and valid definitions', () => {
    const ids = FOUNDING_SURVEY_QUESTIONS.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length);

    for (const question of FOUNDING_SURVEY_QUESTIONS) {
      assert.ok(question.label, `${question.id} necesita enunciado`);
      if (question.type === 'choice') assert.ok(question.options.length > 1);
      if (question.type === 'scale') assert.ok(question.max > question.min);
      if (question.type === 'text') assert.ok(question.maxLength > 0);
    }
  });

  it('is 10 questions, all closed except the last one', () => {
    assert.equal(FOUNDING_SURVEY_QUESTIONS.length, 10);

    const closed = FOUNDING_SURVEY_QUESTIONS.slice(0, 9);
    for (const question of closed) {
      assert.ok(
        question.type === 'scale' || question.type === 'choice',
        `${question.id} debería ser cerrada`,
      );
    }

    const last = FOUNDING_SURVEY_QUESTIONS[9];
    assert.equal(last.type, 'text');
    assert.equal(last.required, true);
  });

  it('asks every student the same closed questions, so the answers are comparable', () => {
    for (const question of FOUNDING_SURVEY_QUESTIONS) {
      assert.equal(question.required, true, `${question.id} debería ser obligatoria`);
    }
  });
});
