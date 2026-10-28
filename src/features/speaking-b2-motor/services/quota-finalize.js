/**
 * Session-level speaking_correction ledger.
 * A row in speaking_b2_quota_charges does not mean the plan counter moved
 * unless status is `consumed` (written in the same database transaction).
 */

export const SPEAKING_B2_CHARGE_STATES = {
  NONE: 'none',
  PENDING: 'pending',
  CONSUMED: 'consumed',
  FAILED: 'failed',
};

export function interpretSpeakingB2ChargeRow(row) {
  const status = String(row?.status || '').trim();
  if (!status) {
    return { state: SPEAKING_B2_CHARGE_STATES.NONE, canConsume: true, already: false };
  }
  if (status === 'consumed') {
    return { state: SPEAKING_B2_CHARGE_STATES.CONSUMED, canConsume: false, already: true };
  }
  if (status === 'failed' || status === 'released') {
    return { state: SPEAKING_B2_CHARGE_STATES.FAILED, canConsume: true, already: false };
  }
  if (status === 'claimed' || status === 'reserved') {
    return {
      state: SPEAKING_B2_CHARGE_STATES.PENDING,
      canConsume: false,
      already: false,
      unknownConsume: true,
    };
  }
  return { state: SPEAKING_B2_CHARGE_STATES.PENDING, canConsume: false, already: false, unknownConsume: true };
}

export function speakingSessionHasReportToCharge(session) {
  return Boolean(session?.pendingReport || session?.report);
}

export function canFinalizeSpeakingB2Quota(session) {
  if (!speakingSessionHasReportToCharge(session)) {
    return { ok: false, code: 'NO_REPORT' };
  }
  if (session.evaluationCharged) {
    return { ok: true, already: true };
  }
  return { ok: true, already: false };
}

export function applySpeakingB2QuotaFinalize(session, result) {
  if (!result?.ok) return session;
  session.evaluationCharged = true;
  if (result.rowVersion != null) {
    session.rowVersion = result.rowVersion;
  }
  return session;
}

/**
 * Decide what a crash between steps implies. Used by tests and docs.
 * Does not invent exactly-once unless the consume+mark ran in one transaction.
 */
export function describeSpeakingB2QuotaCrashWindow(windowName) {
  const windows = {
    after_eval_before_pending: {
      report: false,
      charged: false,
      counterMoved: false,
      safeRetry: 're-evaluate or recover without charging',
    },
    after_pending_before_consume: {
      report: true,
      charged: false,
      counterMoved: false,
      safeRetry: 'call consume transaction once',
    },
    after_claimed_row_before_counter: {
      report: true,
      charged: false,
      counterMoved: false,
      claimedMeansConsumed: false,
      safeRetry: 'do not treat claimed as consumed; use the SQL transaction',
    },
    after_counter_before_consumed_row: {
      report: true,
      charged: false,
      counterMoved: true,
      claimedMeansConsumed: false,
      exactlyOnce: false,
      safeRetry: 'only safe inside the same database transaction',
    },
    after_consume_transaction: {
      report: true,
      charged: true,
      counterMoved: true,
      exactlyOnce: true,
      safeRetry: 'return already, do not increment again',
    },
  };
  return windows[windowName] || null;
}
