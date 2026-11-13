/* Ajustes visuales de la app nativa. La web en el navegador no carga este archivo.
   Mantén el CSS igual que el bloque "App nativa" de src/app/globals.css. */
(function injectDraloNativeShell() {
  var root = document.documentElement;
  if (!root) return;
  root.classList.add('dralo-native-app');
  if (document.getElementById('dralo-native-shell')) return;

  var css = [
    'html.dralo-native-app {',
    '  -webkit-text-size-adjust: 100%;',
    '  text-size-adjust: 100%;',
    '}',
    'html.dralo-native-app, html.dralo-native-app body {',
    '  overscroll-behavior-y: none;',
    '}',
    'html.dralo-native-app body {',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    'html.dralo-native-app .full-page-layout {',
    '  min-height: 100dvh;',
    '}',
    'html.dralo-native-app .site-header {',
    '  padding-top: env(safe-area-inset-top, 0px);',
    '}',
    'html.dralo-native-app .legal-footer {',
    '  padding-bottom: calc(1.05rem + env(safe-area-inset-bottom, 0px));',
    '}',
    'html.dralo-native-app .site-header__install,',
    'html.dralo-native-app [data-home-install-slot],',
    'html.dralo-native-app .home-install-app {',
    '  display: none !important;',
    '}',
    'html.dralo-native-app input,',
    'html.dralo-native-app textarea,',
    'html.dralo-native-app select {',
    '  font-size: 16px;',
    '}',
    'html.dralo-native-app .site-assistant-fab {',
    '  right: calc(1.25rem + env(safe-area-inset-right, 0px));',
    '  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));',
    '}',
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'dralo-native-shell';
  style.appendChild(document.createTextNode(css));
  (document.head || root).appendChild(style);
})();
