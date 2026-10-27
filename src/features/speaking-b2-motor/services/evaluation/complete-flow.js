import { markCompleted, markProcessing } from '../coordinator.js';
import { bindGuestSessionToUser } from '../session-auth.js';

export async function completeSpeakingB2Session({
  session,
  userId,
  quota,
  evaluate,
  persist,
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

  if (session.evaluationInFlight) {
    return { status: 409, body: { error: 'Evaluation already running.', code: 'IN_FLIGHT' } };
  }
  session.evaluationInFlight = true;

  if (session.pendingReport && !session.evaluationCharged) {
    await persist(session);
    const charge = await quota.charge();
    if (!charge.ok) {
      session.evaluationInFlight = false;
      await persist(session);
      return { status: charge.status || 429, body: charge.body, response: charge.response };
    }
    session.evaluationCharged = true;
    session.report = session.pendingReport;
    session.pendingReport = null;
    session.evaluationFailed = false;
    session.evaluationInFlight = false;
    const processing = session.state === 'PROCESSING' ? session : markProcessing(session);
    processing.report = session.report;
    const completed = markCompleted(processing);
    await persist(completed);
    return { status: 200, body: { state: completed.state, report: completed.report, recovered: true } };
  }

  if (!['FINISHING', 'PROCESSING'].includes(session.state)) {
    session.evaluationInFlight = false;
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

    if (!processing.evaluationCharged) {
      const charge = await quota.charge();
      if (!charge.ok) {
        processing.evaluationInFlight = false;
        await persist(processing);
        return { status: charge.status || 429, body: charge.body, response: charge.response };
      }
      processing.evaluationCharged = true;
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
