import { isExamModeSessionScoringCompatible } from '@/lib/b2ScoringV2FeatureFlag';

function countCompletedSections(session) {
  return session?.sections?.filter((s) => s.status === 'completed').length ?? 0;
}

/**
 * Picks the best exam-mode session when local and remote copies exist.
 * Prefers more completed sections, then the most recently updated payload.
 */
export function mergeExamModeSessionSources(local, remote) {
  if (!local && !remote) return null;
  if (!local) return remote;
  if (!remote) return local;

  const localCompatible = isExamModeSessionScoringCompatible(local);
  const remoteCompatible = isExamModeSessionScoringCompatible(remote);
  if (localCompatible && !remoteCompatible) return local;
  if (remoteCompatible && !localCompatible) return remote;

  const localCompleted = countCompletedSections(local);
  const remoteCompleted = countCompletedSections(remote);
  if (remoteCompleted !== localCompleted) {
    return remoteCompleted > localCompleted ? remote : local;
  }

  const localTime = Date.parse(local.updatedAt || 0) || 0;
  const remoteTime = Date.parse(remote.updatedAt || 0) || 0;
  return remoteTime > localTime ? remote : local;
}
