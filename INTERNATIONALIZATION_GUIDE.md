# Guía de Internacionalización (i18n)

## Resumen
Se ha implementado un sistema de internacionalización que permite cambiar entre español (ES) e inglés (GB) sin afectar el contenido educativo ni la estructura de la aplicación.

## Características Principales

### ✅ Funcionalidades Implementadas
- **Idioma predeterminado**: Inglés (GB)
- **Idiomas disponibles**: Español (ES) y Inglés (GB)
- **Persistencia**: El idioma seleccionado se guarda en localStorage
- **Exclusión de secciones**: Los botones de idioma NO aparecen en exámenes ni training
- **Traducciones**: Solo elementos de interfaz, NO contenido educativo

### 🎯 Botones de Idioma
- **ES**: Cambia a español
- **GB**: Cambia a inglés
- **Estilo**: Botones con fondo semitransparente en la navegación
- **Estado activo**: El botón del idioma actual se resalta

### 🚫 Exclusiones
Los botones de idioma NO aparecen en:
- Rutas que contienen `/exam-`
- Rutas que contienen `/training/`

## Estructura de Archivos

### Contexto y Estado
- `src/context/LanguageContext.js` - Context Provider para el idioma global
- `src/hooks/useTranslation.js` - Hook personalizado para usar traducciones

### Traducciones
- `src/utils/translations.js` - Archivo con todas las traducciones

### Componentes
- `src/components/LanguageSwitcher.js` - Botones ES/GB actualizados

## Uso en Componentes

### Importar el hook
```javascript
import { useTranslation } from '@/hooks/useTranslation';
```

### Usar en componente
```javascript
export default function MiComponente() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t.welcomeTitle}</h1>
      <p>{t.welcomeSubtitle}</p>
    </div>
  );
}
```

### Verificar idioma actual
```javascript
const { t, language } = useTranslation();
// language será 'en' o 'es'
```

## Traducciones Disponibles

### Navegación
- `home`, `theory`, `levels`, `placementTest`, `training`, `contact`, `profile`, `logout`, `login`

### Página Principal
- `welcomeTitle`, `welcomeSubtitle`, `quote`, `quoteAuthor`, `startPracticing`

### Elementos Comunes
- `loading`, `error`, `success`, `cancel`, `confirm`, `save`, `edit`, `delete`, `back`, `next`, `previous`, `close`

### Páginas Específicas
- `levelsTitle`, `levelsSubtitle`, `duration`, `parts`, `minutes`
- `theoryTitle`, `theorySubtitle`
- `placementTestTitle`, `placementTestSubtitle`

## Agregar Nuevas Traducciones

1. Abrir `src/utils/translations.js`
2. Agregar la nueva clave en ambos idiomas:

```javascript
export const translations = {
  en: {
    // ... existentes
    newKey: "English text"
  },
  es: {
    // ... existentes  
    newKey: "Texto en español"
  }
};
```

3. Usar en componente: `{t.newKey}`

## Consideraciones Importantes

### ❌ NO Traducir
- Contenido educativo (ejercicios, explicaciones, teoría)
- Nombres de niveles Cambridge (A1, A2, B1, B2, C1, C2)
- Contenido de exámenes
- Descripciones técnicas de ejercicios

### ✅ SÍ Traducir
- Elementos de navegación
- Botones y acciones
- Títulos de páginas
- Mensajes de estado
- Elementos de interfaz de usuario

## Implementación Técnica

### Context Provider
El `LanguageProvider` envuelve toda la aplicación en `src/app/layout.js`:

```javascript
<LanguageProvider>
  <AccessibilityProvider>
    <ExamProvider>
      <RootLayoutClient>{children}</RootLayoutClient>
    </ExamProvider>
  </AccessibilityProvider>
</LanguageProvider>
```

### Exclusión Condicional
En `RootLayoutClient.js`, los botones se ocultan condicionalmente:

```javascript
{!pathname.includes('/exam-') && !pathname.includes('/training/') && (
  <div style={{ marginLeft: '1rem' }}>
    <LanguageSwitcher />
  </div>
)}
```

### Persistencia
El idioma se guarda automáticamente en localStorage y se restaura al recargar la página.

## Mantenimiento

### Agregar Nuevas Páginas
1. Importar `useTranslation` en el componente
2. Usar `const { t } = useTranslation()`
3. Reemplazar textos de interfaz con `{t.clave}`
4. Agregar traducciones necesarias en `translations.js`

### Modificar Exclusiones
Para cambiar qué rutas excluyen los botones de idioma, modificar la condición en `RootLayoutClient.js`:

```javascript
{!pathname.includes('/nueva-ruta-excluida') && (
  <LanguageSwitcher />
)}
```

## Pruebas

1. Navegar a la página principal
2. Verificar que aparecen los botones ES/GB
3. Hacer clic en ES - todo debe cambiar a español
4. Hacer clic en GB - todo debe cambiar a inglés
5. Recargar la página - debe mantener el idioma seleccionado
6. Ir a una ruta de examen - los botones NO deben aparecer
7. Ir a training - los botones NO deben aparecer
















