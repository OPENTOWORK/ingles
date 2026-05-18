#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// En Vercel no hace falta el setup local (acelera install y evita ruido en logs).
if (process.env.VERCEL === '1') {
  process.exit(0);
}

console.log('🚀 Configurando English Practice...\n');

// Verificar Node.js
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Error: Node.js 18+ es requerido. Versión actual:', nodeVersion);
  console.error('   Por favor, actualiza Node.js desde: https://nodejs.org/');
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Verificar npm
const { execSync } = require('child_process');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log('✅ npm version:', npmVersion);
} catch (error) {
  console.error('❌ Error: npm no está disponible');
  process.exit(1);
}

// Crear archivo .env.local si no existe
const envPath = '.env.local';
const envExamplePath = 'env.example';

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env.local creado desde env.example');
  } else {
    // Crear .env.local básico
    const envContent = `# Configuración de English Practice
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_NAME="English Practice"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NODE_ENV=development
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env.local creado con configuración básica');
  }
} else {
  console.log('✅ Archivo .env.local ya existe');
}

// Crear directorios necesarios
const directories = [
  'public/audio',
  'src/components',
  'src/utils',
  'src/data'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Directorio creado: ${dir}`);
  }
});

// Verificar archivos críticos
const criticalFiles = [
  'package.json',
  'src/app/layout.js',
  'src/app/training/page.js',
  'src/utils/offlineFirstDatabase.js'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Archivo encontrado: ${file}`);
  } else {
    console.log(`❌ Archivo faltante: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Algunos archivos críticos no se encontraron.');
  console.log('   Asegúrate de que todos los archivos estén en el repositorio.');
}

// Verificar dependencias
try {
  console.log('\n📦 Verificando dependencias...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  console.log(`✅ ${dependencies.length} dependencias encontradas:`, dependencies.join(', '));
} catch (error) {
  console.log('⚠️  No se pudo leer package.json');
}

// Crear archivo de estado
const statusFile = 'setup-status.json';
const status = {
  setupDate: new Date().toISOString(),
  nodeVersion: nodeVersion,
  filesChecked: criticalFiles.length,
  directoriesCreated: directories.length,
  status: 'completed'
};

fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
console.log(`✅ Estado de configuración guardado en ${statusFile}`);

console.log('\n🎉 ¡Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('   1. npm install          # Instalar dependencias');
console.log('   2. npm run dev          # Ejecutar en desarrollo');
console.log('   3. Abrir http://localhost:3000');
console.log('\n💡 Tip: El sistema funciona sin configuración adicional');
console.log('   (modo offline-first con datos locales)');
console.log('\n📚 Para más información, lee SETUP_GUIDE.md');






















