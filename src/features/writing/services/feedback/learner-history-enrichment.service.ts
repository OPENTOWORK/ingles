/**
 * Post-assessment learner-history enrichment (Phase 6).
 *
 * This is the only place in the engine where learner history exists, and it runs
 * strictly AFTER the four Cambridge marks are frozen. The boundary is enforced
 * by shape rather than by discipline: the service returns an overlay keyed by
 * observation id, so the base observations and the assessment record are never
 * handed to anything that could write to them.
 *
 * No database is connected. History arrives only as an explicitly injected,
 * structured, verified context.
 */
import { learnerHistoryContextSchema } from '../../domain/schemas';
import type {
  AssessmentRecord,
  HistoryOverlayEntry,
  LearnerHistoryContext,
  Observation,
} from '../../domain/types';

export class HistoryBoundaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HistoryBoundaryError';
  }
}

/** Anything in a history entry that would amount to re-scoring the response. */
const FORBIDDEN_HISTORY_KEYS = [
  'mark',
  'marks',
  'score',
  'scores',
  'band',
  'bands',
  'raw_total',
  'criteria',
  'criterion',
  'cefr',
  'passed',
  'readiness',
];

export interface HistoryOverlay {
  applied: boolean;
  entries: Map<string, HistoryOverlayEntry>;
  evidence_ids: string[];
}

export const EMPTY_HISTORY_OVERLAY: HistoryOverlay = {
  applied: false,
  entries: new Map(),
  evidence_ids: [],
};

/**
 * Builds the overlay. Observations are read, never modified: the caller keeps
 * the same objects it had, and history lives alongside them.
 */
export function buildHistoryOverlay(
  observations: readonly Observation[],
  context: LearnerHistoryContext | undefined,
  assessmentRecord: AssessmentRecord,
): HistoryOverlay {
  if (!context) return EMPTY_HISTORY_OVERLAY;

  assertHistoryIsNotScoring(context);

  const parsed = learnerHistoryContextSchema.safeParse(context);
  if (!parsed.success) {
    throw new HistoryBoundaryError(
      `the supplied learner history does not match the overlay contract: ${parsed.error.issues[0]?.message}`,
    );
  }

  // Marks are already final when this runs; if they were not, history could
  // still reach a scoring decision and the whole separation would be theatre.
  if (assessmentRecord.status !== 'complete') {
    throw new HistoryBoundaryError(
      'learner history may only be applied once a complete assessment has been produced',
    );
  }

  const known = new Set(observations.map((observation) => observation.observation_id));
  const entries = new Map<string, HistoryOverlayEntry>();
  const evidence = new Set<string>();

  for (const entry of parsed.data.entries) {
    if (!known.has(entry.observation_id)) {
      throw new HistoryBoundaryError(
        `history references observation "${entry.observation_id}", which this script did not produce`,
      );
    }
    entries.set(entry.observation_id, entry);
    for (const id of entry.history_evidence_ids) evidence.add(id);
  }

  return { applied: entries.size > 0, entries, evidence_ids: [...evidence] };
}

/**
 * History may only reorder what is emphasised. Doc 02 §6 factors are
 * pedagogical: a confirmed recurrence deserves more attention than a one-off
 * lapse, and that changes the feedback, not the mark.
 */
export function historyPriorityBoost(entry: HistoryOverlayEntry | undefined): number {
  if (!entry) return 0;
  let boost = 0;
  if (entry.confirmed_historical_recurrence) boost += 2;
  if (entry.previously_taught) boost += 1;
  if (entry.improvement_signal === 'regressed') boost += 1;
  // Something the learner has genuinely improved needs acknowledgement, not
  // another correction at the top of the list.
  if (entry.improvement_signal === 'improved') boost -= 1;
  return boost;
}

/** True when a longitudinal statement about this observation is defensible. */
export function supportsLongitudinalClaim(entry: HistoryOverlayEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.history_evidence_ids.length === 0) return false;
  return (
    entry.confirmed_historical_recurrence ||
    entry.previously_taught ||
    entry.improvement_signal !== 'unknown'
  );
}

function assertHistoryIsNotScoring(context: LearnerHistoryContext): void {
  const hits: string[] = [];
  walk(context, '', hits);
  if (hits.length) {
    throw new HistoryBoundaryError(
      `learner history must carry no scoring information: ${hits.join(', ')}`,
    );
  }
}

function walk(value: unknown, path: string, hits: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${path}[${i}]`, hits));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const next = path ? `${path}.${key}` : key;
    if (FORBIDDEN_HISTORY_KEYS.includes(key.toLowerCase())) hits.push(next);
    walk(child, next, hits);
  }
}
