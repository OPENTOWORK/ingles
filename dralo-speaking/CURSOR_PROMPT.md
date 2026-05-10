# Prompt para Cursor — Integración módulo Speaking Dralo

## Contexto del proyecto
Estoy desarrollando una web educativa llamada Dralo (dralo.es) para preparar exámenes Cambridge (A2, B1, B2, C1, C2). Es una aplicación React con Vite. Necesito integrar un módulo de speaking practice que ya tengo desarrollado.

## Archivos que te proporciono
He adjuntado estos archivos que debes integrar en el proyecto:
- `pages/SpeakingPage.jsx` — componente principal de la página
- `lib/gemini-coach.js` — integración con Gemini API y Text-to-Speech
- `lib/useSpeechRecognition.js` — hook para reconocimiento de voz
- `prompts/cambridge-prompts.js` — prompts por nivel Cambridge y modo

## Lo que necesito que hagas

### 1. Analiza la estructura actual del proyecto
Revisa cómo está organizado el proyecto (carpetas, router, estilos, componentes existentes) antes de tocar nada.

### 2. Copia los archivos en las rutas correctas
Coloca cada archivo respetando la estructura existente del proyecto:
- Si usamos `src/pages/` → pon `SpeakingPage.jsx` ahí
- Si usamos `src/lib/` o `src/utils/` → pon los archivos de lib ahí
- Si usamos `src/prompts/` o `src/data/` → pon los prompts ahí
Adapta los import paths de cada archivo según donde los coloques.

### 3. Añade la ruta `/speaking`
Integra la nueva página en el router existente del proyecto. Si usamos React Router:
```jsx
import SpeakingPage from './pages/SpeakingPage';
<Route path="/speaking" element={<SpeakingPage />} />
```
Si usamos otro sistema de routing, adáptalo.

### 4. Añade un enlace en la navegación principal
En el componente de navegación existente (navbar, sidebar, o menú principal), añade un enlace a `/speaking` con el texto "Speaking" o "Práctica oral". Respeta el estilo visual existente — no cambies el diseño del nav.

### 5. Configura las variables de entorno
Añade al archivo `.env` (o `.env.local`) esta línea si no existe ya:
```
VITE_GEMINI_API_KEY=
```
Deja el valor vacío — yo añadiré la clave manualmente. Si el proyecto usa otro prefijo distinto de VITE_ (por ejemplo REACT_APP_), adáptalo y actualiza también la referencia en `gemini-coach.js`.

### 6. Instala dependencias necesarias
Ejecuta en terminal:
```bash
npm install lucide-react
```
Si lucide-react ya está instalada, no hagas nada.

### 7. Verifica compatibilidad de estilos
El componente usa variables CSS como `var(--color-background-primary)` y `var(--color-text-primary)`. Comprueba si el proyecto ya define estas variables en un archivo global de CSS o en un theme provider. Si no existen, añade estos valores por defecto al CSS global:
```css
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f5f5f5;
  --color-text-primary: #111111;
  --color-text-secondary: #666666;
  --color-border-tertiary: #e0e0e0;
}
```

### 8. Comprueba que todo funciona
Después de integrar, verifica que:
- La ruta `/speaking` carga sin errores de consola
- Los imports de todos los archivos son correctos
- No hay conflictos con estilos globales existentes
- El componente se renderiza correctamente

## Restricciones importantes
- NO modifiques el diseño ni los estilos de páginas existentes
- NO cambies la lógica de negocio existente
- NO refactorices código que no sea parte de esta integración
- Si algo no está claro, pregúntame antes de asumir

## Resultado esperado
Al terminar, quiero poder ir a `/speaking` en el navegador y ver la página de práctica de speaking funcionando. La única cosa manual que haré yo es añadir la API key de Gemini en el `.env`.
