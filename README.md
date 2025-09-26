# 🎯 English Practice - Plataforma de Aprendizaje de Inglés

Una plataforma completa de práctica de inglés con IA adaptativa, gamificación y modo offline.

## ✨ Características Principales

- 🎧 **Sistema de Audio Avanzado** con precarga inteligente
- 📊 **Seguimiento de Progreso Completo** con estadísticas detalladas
- 🏆 **Sistema de Logros y Gamificación** con 10 tipos de logros
- 🤖 **Aprendizaje Adaptativo con IA** que se ajusta al usuario
- 📱 **Modo Offline Completo** - funciona sin internet
- ♿ **Accesibilidad Universal** - cumple estándares WCAG 2.1 AA
- ⚡ **Rendimiento Optimizado** con caché inteligente
- 📈 **Analytics en Tiempo Real** para administradores

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (opcional - funciona sin BD)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/english-practice.git
cd english-practice
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar Supabase (Opcional)**
- Crea una cuenta en [Supabase](https://supabase.com)
- Crea un nuevo proyecto
- Copia las credenciales a `.env.local`

5. **Ejecutar en desarrollo**
```bash
npm run dev
# o
yarn dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 🔧 Configuración Detallada

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Supabase (Opcional - funciona sin esto)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Configuración de la app
NEXT_PUBLIC_APP_NAME="English Practice"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Base de Datos (Opcional)

El sistema funciona completamente sin base de datos usando datos locales. Si quieres usar Supabase:

1. Ve a tu proyecto de Supabase
2. Ve a SQL Editor
3. Ejecuta el script de `database_setup.sql`
4. O usa la configuración automática en la app

## 📁 Estructura del Proyecto

```
english-practice/
├── src/
│   ├── app/                    # Páginas de Next.js
│   │   ├── training/          # Sistema de entrenamiento
│   │   └── layout.js          # Layout principal
│   ├── components/            # Componentes React
│   │   ├── ProgressDashboard.js
│   │   ├── AdaptiveLearningDashboard.js
│   │   ├── AudioPlayer.js
│   │   └── ...
│   ├── utils/                 # Utilidades
│   │   ├── offlineFirstDatabase.js
│   │   ├── progressTracker.js
│   │   ├── audioManager.js
│   │   └── ...
│   └── data/                  # Datos de ejercicios
│       └── trainingExercises.js
├── public/                    # Archivos estáticos
│   ├── audio/                # Archivos de audio
│   ├── sw.js                 # Service Worker
│   └── offline.html          # Página offline
├── database_setup.sql        # Script de configuración de BD
└── README.md
```

## 🎮 Uso del Sistema

### Para Usuarios
1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Onboarding**: Configura tu nivel y objetivos
3. **Entrenamiento**: Practica con ejercicios interactivos
4. **Progreso**: Ve tu evolución en el dashboard
5. **Logros**: Desbloquea logros al completar objetivos

### Para Desarrolladores
1. **Modo Offline**: El sistema funciona sin BD
2. **Datos Locales**: Todos los datos se guardan localmente
3. **Sincronización**: Se conecta a BD cuando está disponible
4. **Logs**: Revisa la consola para información de debug

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Verificar código

# Base de datos
npm run db:setup     # Configurar base de datos
npm run db:reset     # Reiniciar base de datos
```

## 📊 Características Técnicas

### Tecnologías Utilizadas
- **Next.js 14** - Framework React
- **Supabase** - Base de datos y autenticación
- **React Hooks** - Estado y efectos
- **Service Workers** - Modo offline
- **Web Audio API** - Reproducción de audio
- **LocalStorage** - Persistencia local

### Arquitectura
- **Offline-First**: Funciona sin conexión
- **Component-Based**: Componentes reutilizables
- **Progressive Enhancement**: Mejora progresiva
- **Responsive Design**: Adaptable a todos los dispositivos

## 🔍 Solución de Problemas

### Problemas Comunes

**Error: "Database needs setup"**
- ✅ **Solución**: El sistema funciona sin BD, solo haz clic en "Setup Automatically"

**Error: "Failed to fetch"**
- ✅ **Solución**: Revisa tu conexión a internet, el sistema funciona offline

**Audio no reproduce**
- ✅ **Solución**: Verifica que tienes archivos de audio en `public/audio/`

**Progreso no se guarda**
- ✅ **Solución**: El progreso se guarda localmente, revisa localStorage

### Debug
```bash
# Ver logs detallados
npm run dev -- --verbose

# Limpiar caché
npm run clean

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribución

### Para Contribuir
1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'Agregar nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

### Estándares de Código
- Usa ESLint y Prettier
- Escribe tests para nuevas funciones
- Documenta cambios importantes
- Sigue las convenciones de naming

## 📈 Roadmap

### Próximas Características
- [ ] Más ejercicios de audio
- [ ] Sistema de pronunciación
- [ ] Modo multijugador
- [ ] Integración con APIs externas
- [ ] App móvil nativa

### Mejoras Técnicas
- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Monitoreo de errores
- [ ] Optimización de bundle
- [ ] PWA completa

## 📞 Soporte

### Documentación
- [Guía de Usuario](docs/USER_GUIDE.md)
- [Guía de Desarrollador](docs/DEVELOPER_GUIDE.md)
- [API Documentation](docs/API.md)

### Contacto
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/english-practice/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/english-practice/discussions)
- **Email**: tu-email@ejemplo.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Supabase por la plataforma de base de datos
- Next.js por el framework React
- La comunidad de desarrolladores por las librerías utilizadas

---

**¡Disfruta aprendiendo inglés! 🎉**

Si tienes preguntas o necesitas ayuda, no dudes en abrir un issue o contactarnos.