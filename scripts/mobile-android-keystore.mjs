import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const appDir = path.join(androidDir, 'app');
const keystorePath = path.join(appDir, 'dralo-upload.keystore');
const propsPath = path.join(androidDir, 'keystore.properties');

if (!fs.existsSync(androidDir)) {
  console.error('Todavía no existe android/. Ejecuta antes: npm run mobile:sync');
  process.exit(1);
}

if (fs.existsSync(keystorePath) && fs.existsSync(propsPath)) {
  console.log('La clave de subida ya está en android/app/dralo-upload.keystore');
  console.log('Guárdala: sin ese fichero no podrás actualizar la app en Google Play.');
  process.exit(0);
}

const password = crypto.randomBytes(18).toString('base64url');
fs.mkdirSync(appDir, { recursive: true });

const result = spawnSync(
  'keytool',
  [
    '-genkeypair',
    '-v',
    '-storetype',
    'PKCS12',
    '-keystore',
    keystorePath,
    '-alias',
    'dralo',
    '-keyalg',
    'RSA',
    '-keysize',
    '2048',
    '-validity',
    '10000',
    '-storepass',
    password,
    '-keypass',
    password,
    '-dname',
    'CN=Dralo Academy, OU=Mobile, O=Dralo, C=ES',
  ],
  { stdio: 'inherit' },
);

if (result.status !== 0) {
  console.error('keytool no pudo crear la clave. Hace falta un JDK (keytool en el PATH).');
  process.exit(result.status || 1);
}

const props = [
  'storeFile=dralo-upload.keystore',
  `storePassword=${password}`,
  'keyAlias=dralo',
  `keyPassword=${password}`,
  '',
].join('\n');

fs.writeFileSync(propsPath, props);
console.log('Clave creada. No se sube a GitHub.');
console.log(`Keystore: ${keystorePath}`);
console.log(`Contraseña: ${propsPath}`);
console.log('Copia los dos ficheros a un sitio seguro y súbelos a Codemagic si firmas allí.');
