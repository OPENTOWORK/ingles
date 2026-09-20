export const STUDY_TRACK_RECORD_TAB_ID = 'track-record';
export const STUDY_TRACK_RECORD_REFRESH_EVENT = 'dralo:track-record-refresh';

/** @deprecated Use studyTrackRecordProfileHref() — kept for old bookmarks */
export const STUDY_TRACK_RECORD_LEGACY_PATH = '/perfil/track-record';

export function studyTrackRecordProfileHref() {
  return `/perfil?tab=${STUDY_TRACK_RECORD_TAB_ID}`;
}

export function isStudyTrackRecordProfileRoute(pathname = '', search = '') {
  const path = String(pathname || '').split('?')[0];
  if (path === '/perfil/track-record' || path.startsWith('/perfil/track-record/')) {
    return true;
  }
  if (path !== '/perfil') return false;
  const qs = String(search || '');
  const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  return params.get('tab') === STUDY_TRACK_RECORD_TAB_ID;
}
