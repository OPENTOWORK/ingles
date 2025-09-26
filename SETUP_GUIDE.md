# 🚀 Guía de Configuración - English Practice

## 📋 Para tu Compañero

### 🎯 Configuración Rápida (5 minutos)

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/english-practice.git
cd english-practice
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar la aplicación**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

**¡Listo! La aplicación funciona sin configuración adicional.**

---

## 🔧 Configuración Completa (Opcional)

### Variables de Entorno

1. **Crear archivo de configuración**
```bash
cp env.example .env.local
```

2. **Configurar Supabase (Opcional)**
- Ve a [supabase.com](https://supabase.com)
- Crea una cuenta gratuita
- Crea un nuevo proyecto
- Copia las credenciales a `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

3. **Configurar base de datos**
- La aplicación funciona sin BD (modo offline)
- Si quieres usar BD: ve a Supabase SQL Editor
- Ejecuta el script de `database_setup.sql`

---

## 📱 Características Principales

### ✅ Funciona Sin Configuración
- **Modo Offline**: Todos los datos se guardan localmente
- **Ejercicios Incluidos**: 3 ejercicios de ejemplo
- **Logros**: 10 logros predefinidos
- **Dashboard**: Estadísticas y progreso funcionando

### 🎧 Sistema de Audio
- **Reproductor Avanzado**: Controles de velocidad, volumen
- **Text-to-Speech**: Convierte texto a audio
- **Caché Inteligente**: Precarga archivos de audio
- **Fallback**: Funciona sin archivos de audio

### 📊 Seguimiento de Progreso
- **Estadísticas Detalladas**: Por nivel, habilidad, tiempo
- **Logros**: Sistema de gamificación completo
- **Aprendizaje Adaptativo**: IA que se ajusta al usuario
- **Persistencia**: Datos guardados en localStorage

### ♿ Accesibilidad
- **WCAG 2.1 AA**: Cumple estándares de accesibilidad
- **Navegación por Teclado**: Completamente accesible
- **Panel de Accesibilidad**: Configuración personalizable
- **Skip Links**: Navegación rápida

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Verificar código

# Utilidades
npm run clean        # Limpiar caché
npm run analyze      # Analizar bundle
```

---

## 📁 Estructura del Proyecto

```
english-practice/
├── src/
│   ├── app/                    # Páginas de Next.js
│   │   ├── training/          # Sistema de entrenamiento
│   │   │   ├── a1/           # Nivel A1
│   │   │   └── page.js       # Página principal
│   │   ├── login/            # Autenticación
│   │   └── layout.js         # Layout principal
│   ├── components/            # Componentes React
│   │   ├── ProgressDashboard.js      # Dashboard de progreso
│   │   ├── AdaptiveLearningDashboard.js # IA adaptativa
│   │   ├── AudioPlayer.js            # Reproductor de audio
│   │   ├── UserOnboarding.js         # Configuración inicial
│   │   ├── DatabaseSetup.js          # Configuración de BD
│   │   ├── AchievementNotification.js # Notificaciones
│   │   └── AccessibilityProvider.js  # Accesibilidad
│   ├── utils/                 # Utilidades
│   │   ├── offlineFirstDatabase.js   # Sistema offline-first
│   │   ├── progressTracker.js        # Seguimiento de progreso
│   │   ├── audioManager.js           # Gestión de audio
│   │   ├── adaptiveLearning.js       # IA adaptativa
│   │   ├── performanceMonitor.js     # Monitoreo de rendimiento
│   │   └── supabaseClient.js         # Cliente de Supabase
│   └── data/                  # Datos
│       └── trainingExercises.js      # Ejercicios de entrenamiento
├── public/                    # Archivos estáticos
│   ├── audio/                # Archivos de audio (opcional)
│   ├── sw.js                 # Service Worker para offline
│   └── offline.html          # Página offline
├── database_setup.sql        # Script de configuración de BD
├── SUPABASE_SETUP_GUIDE.md   # Guía de configuración de BD
└── README.md                 # Documentación principal
```

---

## 🔍 Solución de Problemas

### Problemas Comunes

**❌ Error: "Module not found"**
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

**❌ Error: "Port 3000 is already in use"**
```bash
# Solución: Usar otro puerto
npm run dev -- --port 3001
```

**❌ Error: "Database needs setup"**
```bash
# Solución: El sistema funciona sin BD
# Solo haz clic en "Setup Automatically" en la app
```

**❌ Error: "Failed to fetch"**
```bash
# Solución: Revisar conexión a internet
# El sistema funciona offline, no es crítico
```

### Debug

**Ver logs detallados:**
```bash
npm run dev -- --verbose
```

**Limpiar caché:**
```bash
npm run clean
```

**Verificar configuración:**
```bash
node -e "console.log('Node version:', process.version)"
npm --version
```

---

## 🎮 Uso de la Aplicación

### Flujo de Usuario

1. **Acceso**: `http://localhost:3000`
2. **Login/Registro**: Crear cuenta o iniciar sesión
3. **Onboarding**: Configurar nivel y objetivos (8 pasos)
4. **Entrenamiento**: Practicar ejercicios por nivel
5. **Progreso**: Ver estadísticas en el dashboard
6. **Logros**: Desbloquear logros al completar objetivos

### Funcionalidades

- **🎯 Ejercicios Interactivos**: Múltiples tipos de ejercicios
- **🎧 Audio Integrado**: Reproductor con controles avanzados
- **📊 Progreso Visual**: Gráficos y estadísticas detalladas
- **🏆 Sistema de Logros**: 10 tipos de logros diferentes
- **🤖 IA Adaptativa**: Recomendaciones personalizadas
- **📱 Modo Offline**: Funciona sin conexión a internet
- **♿ Accesibilidad**: Panel de configuración de accesibilidad

---

## 📞 Soporte

### Si algo no funciona:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Revisa los logs del servidor** en la terminal
3. **Verifica la configuración** en `.env.local`
4. **Reinstala dependencias** si es necesario

### Contacto:
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/english-practice/issues)
- **Email**: tu-email@ejemplo.com

---

## 🎉 ¡Disfruta del Proyecto!

**Este es un sistema completo de aprendizaje de inglés con:**
- ✅ **Funcionalidad Completa** sin configuración
- ✅ **Modo Offline** para trabajar sin internet
- ✅ **Código Limpio** y bien documentado
- ✅ **Escalable** y fácil de extender
- ✅ **Accesible** para todos los usuarios

**¡Perfecto para demostrar, desarrollar y aprender!** 🌟



