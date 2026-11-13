import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const propsPath = path.join(androidDir, 'keystore.properties');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');

if (!fs.existsSync(gradlew)) {
  console.error('No está el proyecto Android. Ejecuta: npm run mobile:sync');
  process.exit(1);
}

const sync = spawnSync('npx', ['cap', 'sync', 'android'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (sync.status !== 0) {
  process.exit(sync.status || 1);
}

if (!fs.existsSync(propsPath) && !process.env.CM_KEYSTORE_PATH) {
  console.error('Falta la clave de firma. Ejecuta: npm run mobile:keystore');
  process.exit(1);
}

const javaHome = resolveJavaHome();
if (!javaHome) {
  console.error('Hace falta JDK 21. Android Studio lo trae en su carpeta jbr, o instala Temurin 21 y define JAVA_HOME.');
  process.exit(1);
}

const result = spawnSync(gradlew, ['bundleRelease'], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, JAVA_HOME: javaHome },
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

const aabDir = path.join(androidDir, 'app', 'build', 'outputs', 'bundle', 'release');
console.log(`App Bundle listo en ${aabDir}`);

function resolveJavaHome() {
  const candidates = [
    process.env.JAVA_HOME,
    'C:\\Program Files\\Android\\Android Studio\\jbr',
    'C:\\Program Files\\Java\\jdk-21',
  ].filter(Boolean);

  return candidates.find((home) => fs.existsSync(path.join(home, 'bin')) && javaMajor(home) >= 21) || '';
}

function javaMajor(javaHome) {
  const java = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  const result = spawnSync(java, ['-version'], { encoding: 'utf8' });
  const text = `${result.stderr || ''}${result.stdout || ''}`;
  const match = text.match(/version "(?:1\.)?(\d+)/);
  return match ? Number(match[1]) : 0;
}
