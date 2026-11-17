export const DRALO_APP_REMEMBER_KEY = 'dralo_app_remember_login';
export const DRALO_APP_RUN_KEY = 'dralo_app_login_run';
export const DRALO_APP_DROP_PARAM = 'appDropSession';
export const DRALO_APP_SURFACE_KEY = 'dralo_app_surface';

const PREVIEW_PARAMS = ['itPreviewApp', 'itPreviewPlatform', 'itPreviewRole', '_itPreview'];

export function isDraloAppRequest({ userAgent = '', search = '' } = {}) {
  if (String(userAgent).includes('DraloApp')) return true;
  const raw = String(search || '');
  const query = raw.startsWith('?') ? raw.slice(1) : raw;
  return new URLSearchParams(query).get('itPreviewApp') === '1';
}

function appFrameEmbedded() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function readAppSurfaceFlag() {
  try {
    return sessionStorage.getItem(DRALO_APP_SURFACE_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberAppSurface() {
  try {
    sessionStorage.setItem(DRALO_APP_SURFACE_KEY, '1');
  } catch {
    /* modo privado */
  }
}

export function isDraloAppSurface() {
  if (typeof window === 'undefined') return false;
  const detected = isDraloAppRequest({
    userAgent: navigator.userAgent,
    search: window.location.search,
  });
  let native = false;
  try {
    native = window.Capacitor?.isNativePlatform?.() === true;
  } catch {
    native = false;
  }
  if (detected || native) {
    rememberAppSurface();
    return true;
  }
  return appFrameEmbedded() && readAppSurfaceFlag();
}

export function appSessionShouldPersist() {
  let remember = null;
  let run = null;
  try {
    remember = localStorage.getItem(DRALO_APP_REMEMBER_KEY);
  } catch {
    remember = null;
  }
  try {
    run = sessionStorage.getItem(DRALO_APP_RUN_KEY);
  } catch {
    run = null;
  }
  if (remember !== '0') return true;
  return run === '1';
}

export function markAppRemember(save) {
  try {
    localStorage.setItem(DRALO_APP_REMEMBER_KEY, save ? '1' : '0');
  } catch {
    /* modo privado */
  }
  try {
    sessionStorage.setItem(DRALO_APP_RUN_KEY, '1');
  } catch {
    /* modo privado */
  }
}

export function withAppPreviewSearch(path = '/') {
  const url = new URL(path, window.location.origin);
  const current = new URLSearchParams(window.location.search);
  for (const key of PREVIEW_PARAMS) {
    const value = current.get(key);
    if (value) url.searchParams.set(key, value);
  }
  url.searchParams.delete(DRALO_APP_DROP_PARAM);
  return `${url.pathname}${url.search}`;
}

/**
 * La app entra por el login salvo que ya haya una sesión guardada.
 * `remember === '0'` y un arranque nuevo obligan a identificarse otra vez.
 */
export function shouldOpenAppAtLogin({ path = '/', signedIn = false, remember = null, run = null } = {}) {
  const pathname = String(path || '/').split('?')[0].replace(/\/$/, '') || '/';
  if (pathname !== '/') return false;
  const drop = remember === '0' && run !== '1';
  if (drop) return true;
  return !signedIn;
}

export const DRALO_APP_BOOT_SCRIPT = `(function(){try{
  var ua=navigator.userAgent||'';
  var q=location.search||'';
  var embedded=false;
  try{embedded=window.self!==window.top;}catch(e){embedded=true;}
  var queryApp=/(?:^|[?&])itPreviewApp=1(?:&|$)/.test(q);
  var uaApp=ua.indexOf('DraloApp')!==-1;
  var stored=false;
  try{stored=sessionStorage.getItem('${DRALO_APP_SURFACE_KEY}')==='1';}catch(e){}
  var app=queryApp||uaApp||(embedded&&stored);
  if(!app)return;
  if(queryApp||uaApp){try{sessionStorage.setItem('${DRALO_APP_SURFACE_KEY}','1');}catch(e){}}
  document.documentElement.classList.add('dralo-native-app');
  var platform=(/(?:^|[?&])itPreviewPlatform=(ios|android)(?:&|$)/.exec(q)||[])[1];
  if(platform)document.documentElement.classList.add('dralo-native-'+platform);
  var path=location.pathname||'/';
  if(path!=='/'&&path!=='')return;
  var remember=null,run=null,jar=false;
  try{remember=localStorage.getItem('${DRALO_APP_REMEMBER_KEY}');}catch(e){}
  try{run=sessionStorage.getItem('${DRALO_APP_RUN_KEY}');}catch(e){}
  try{jar=(localStorage.getItem('dralo-it-preview-auth-jar')||'').indexOf('auth-token')!==-1;}catch(e){}
  var cookie=/(?:^|;\\s*)sb-[^=]*-auth-token(?:\\.\\d+)?=/.test(document.cookie);
  var signedIn=cookie||jar;
  var drop=remember==='0'&&run!=='1';
  if(signedIn&&!drop)return;
  var next=new URL('/login/',location.origin);
  var cur=new URLSearchParams(q);
  ['itPreviewApp','itPreviewPlatform','itPreviewRole','_itPreview'].forEach(function(key){var value=cur.get(key);if(value)next.searchParams.set(key,value);});
  if(drop)next.searchParams.set('${DRALO_APP_DROP_PARAM}','1');
  location.replace(next.pathname+next.search);
}catch(e){}})();`;
