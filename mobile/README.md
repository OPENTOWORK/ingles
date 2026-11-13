# Dralo Academy en iOS y Android

La app es la misma web. Abre `https://www.dralo.es`, así que login, práctica, pagos y Dralo AI siguen en las mismas rutas y en la misma base de Supabase. El diseño es el responsive de la web. En la app se ajusta la barra de estado, el área segura del móvil, el teclado y se oculta el botón de instalar la PWA.

Identificador: `es.dralo.academy`.

## Probar en un móvil

1. `npm install`
2. Arranca la web con `npm run dev` accesible en la red (`next dev -H 0.0.0.0`).
3. Sincroniza apuntando al ordenador, no a producción:

```bash
CAPACITOR_SERVER_URL=http://192.168.1.10:3000 npm run mobile:sync
```

4. Android: abre `android/` en Android Studio y pulsa Run.
5. iOS: hace falta un Mac. Abre `ios/App/App.xcodeproj` en Xcode, o sube esta rama a Codemagic.

Para la build de tienda no hace falta esa variable: la app queda apuntando a `https://www.dralo.es`.

## Google Play (.aab)

Hace falta JDK 21 (Android Studio lo incluye) y Android SDK. `npm run mobile:aab` usa el JDK 21 de Android Studio si `JAVA_HOME` es más antiguo. La app llega a móviles con Android 7 o posterior e iOS 15 o posterior.

```bash
npm run mobile:keystore
npm run mobile:aab
```

El fichero queda en `android/app/build/outputs/bundle/release/`. Súbelo a Play Console en una pista de prueba interna.

`npm run mobile:keystore` crea `android/app/dralo-upload.keystore` y `android/keystore.properties`. No van a GitHub. Si se pierden, no se puede publicar una actualización de la misma ficha. Guárdalos y úsalos también en Codemagic con el nombre `dralo_upload`.

## iOS con Codemagic

El workflow `ios-app-store` de `codemagic.yaml` genera el IPA y lo manda a TestFlight.

En Codemagic:

1. Conecta el repo y elige la rama `mobile/ios-android`.
2. App Store Connect: integración de API y el bundle id `es.dralo.academy`.
3. Lanza el workflow **Dralo iOS**.

El workflow **Dralo Android App Bundle** hace lo mismo para el `.aab` si prefieres no generarlo en local. El grupo `google_play` debe definir `GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS`.

## Permisos

Speaking usa el micrófono. La ficha de la tienda debe decirlo. El avatar del perfil puede abrir la galería.

## Login con Google

El correo y la contraseña funcionan igual que en la web. El botón de Google a veces lo bloquea el propio Google dentro de una app, porque no quiere el inicio de sesión en un WebView. Si pasa, el acceso con correo sigue siendo el de la web.
