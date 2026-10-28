import { markCompleted, markProcessing } from '../coordinator.js';
import { bindGuestSessionToUser } from '../session-auth.js';
import { claimEvaluationInMemory } from '../session-persistence.js';
import { applySpeakingB2QuotaFinalize } from '../quota-finalize.js';

export async function completeSpeakingB2Session({
  session,
  userId,
  quota,
  evaluate,
  persist,
  claim = claimEvaluationInMemory,
}) {
  if (!userId) {
    return {
      status: 401,
      body: { error: true, code: 'AUTH_REQUIRED', message: 'Inicia sesión para ver el informe.' },
    };
  }

  const bind = bindGuestSessionToUser(session, userId);
  if (!bind.ok) {
    return { status: bind.status, body: { error: bind.error, code: bind.code } };
  }
  if (session.report && (session.state === 'COMPLETED' || session.state === 'PROCESSING')) {
    return { status: 200, body: { state: session.state, report: session.report, reused: true } };
  }

  const claimed = await claim(session);
  if (!claimed.ok) {
    if (claimed.code === 'ALREADY_COMPLETED' && (claimed.session?.report || session.report)) {
      return {
        status: 200,
        body: {
          state: claimed.session?.state || 'COMPLETED',
          report: claimed.session?.report || session.report,
          reused: true,
        },
      };
    }
    return {
      status: 409,
      body: { error: 'Evaluation already running.', code: claimed.code || 'IN_FLIGHT' },
    };
  }
  session = claimed.session || session;

  if (session.pendingReport && session.evaluationCharged) {
    return persistRecoveredReport(session, persist);
  }

  if (session.pendingReport && !session.evaluationCharged) {
    await persist(session);
    const charge = await chargeOnce(quota, session);
    if (!charge.ok) {
      session.evaluationInFlight = false;
      await persist(session);
      return { status: charge.status || 429, body: charge.body, response: charge.response };
    }
    applySpeakingB2QuotaFinalize(session, charge);
    return persistRecoveredReport(session, persist);
  }

  if (!['FINISHING', 'PROCESSING'].includes(session.state)) {
    session.evaluationInFlight = false;
    await persist(session);
    return { status: 409, body: { error: 'The interview is not ready to evaluate.', code: 'NOT_READY' } };
  }

  await persist(session);

  try {
    if (!session.evaluationCharged) {
      const check = await quota.check();
      if (!check.ok) {
        session.evaluationInFlight = false;
        await persist(session);
        return { status: check.status || 429, body: check.body, response: check.response };
      }
    }

    const processing = markProcessing(session);
    await persist(processing);
    const report = processing.pendingReport || (await evaluate(processing));
    processing.pendingReport = report;
    await persist(processing);

    if (!processing.evaluationCharged) {
      const charge = await chargeOnce(quota, processing);
      if (!charge.ok) {
        processing.evaluationInFlight = false;
        await persist(processing);
        return { status: charge.status || 429, body: charge.body, response: charge.response };
      }
      applySpeakingB2QuotaFinalize(processing, charge);
    }

    processing.report = report;
    processing.pendingReport = null;
    processing.evaluationFailed = false;
    processing.evaluationInFlight = false;
    const completed = markCompleted(processing);
    await persist(completed);
    return { status: 200, body: { state: completed.state, report } };
  } catch (error) {
    session.evaluationFailed = true;
    session.evaluationInFlight = false;
    await persist(session);
    throw error;
  }
}

async function persistRecoveredReport(session, persist) {
  session.report = session.pendingReport || session.report;
  session.pendingReport = null;
  session.evaluationFailed = false;
  session.evaluationInFlight = false;
  session.evaluationCharged = true;
  if (session.state === 'COMPLETED') {
    await persist(session);
    return { status: 200, body: { state: session.state, report: session.report, recovered: true } };
  }
  const processing = session.state === 'PROCESSING' ? session : markProcessing(session);
  processing.report = session.report;
  processing.evaluationCharged = true;
  const completed = markCompleted(processing);
  await persist(completed);
  return { status: 200, body: { state: completed.state, report: completed.report, recovered: true } };
}

async function chargeOnce(quota, session) {
  if (typeof quota.finalize === 'function') {
    return quota.finalize(session);
  }

  if (typeof quota.claimCharge === 'function') {
    const gate = await quota.claimCharge(session);
    if (gate?.already) return { ok: true, already: true };
    if (gate?.unknownConsume || gate?.code === 'CHARGE_PENDING') {
      return {
        ok: false,
        status: 409,
        body: { code: 'CHARGE_PENDING' },
      };
    }
    if (gate && gate.ok === false && !gate.skipped) {
      return {
        ok: false,
        status: gate.status || 503,
        body: gate.body || { code: 'STORE_UNAVAILABLE' },
      };
    }
  }

  const charge = await quota.charge();
  if (!charge.ok) {
    if (typeof quota.releaseCharge === 'function') {
      await quota.releaseCharge(session);
    }
    return charge;
  }
  return charge;
}
