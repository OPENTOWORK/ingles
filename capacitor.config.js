const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://www.dralo.es';
const cleartext = serverUrl.startsWith('http://');

/**
 * La app nativa carga la misma web (mismas rutas, mismas API y la misma
 * Supabase). Los ajustes que solo tienen sentido en el móvil viven en
 * `mobile/www/native-shell.js` y en `.dralo-native-app` de globals.css.
 *
 * Para probar contra el servidor local:
 *   CAPACITOR_SERVER_URL=http://192.168.1.10:3000 npm run mobile:sync
 *
 * @type {import('@capacitor/cli').CapacitorConfig}
 */
const config = {
  appId: 'es.dralo.academy',
  appName: 'Dralo Academy',
  webDir: 'mobile/www',
  appendUserAgent: 'DraloApp',
  server: {
    url: serverUrl,
    cleartext,
    androidScheme: 'https',
    errorPath: 'offline.html',
    allowNavigation: [
      'www.dralo.es',
      'dralo.es',
      '*.supabase.co',
      '*.supabase.in',
      '*.stripe.com',
      '*.stripe.network',
      'accounts.google.com',
      '*.google.com',
      '*.gstatic.com',
      '*.googleapis.com',
      '*.googletagmanager.com',
      '*.google-analytics.com',
      '*.recaptcha.net',
    ],
  },
  android: {
    allowMixedContent: cleartext,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.CAPACITOR_DEBUG === 'true',
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: '#4f46e5',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

module.exports = config;
