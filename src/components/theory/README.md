# Sistema de Teoría Interactiva

Este sistema proporciona una experiencia completa de aprendizaje de teoría de inglés con ejercicios interactivos y seguimiento de progreso.

## Componentes Principales

### 1. TheoryLayout
Componente principal que estructura todas las páginas de teoría.

**Características:**
- Navegación entre teoría y ejercicios
- Barra de progreso del tema
- Información del nivel y tiempo estimado
- Integración con sistema de seguimiento de progreso
- Diseño responsivo y accesible

### 2. Componentes de Contenido (TheoryContent.js)

#### TheorySection
Organiza el contenido en secciones temáticas con iconos y títulos.

#### Example
Muestra ejemplos con traducciones español-inglés.

#### Rule
Presenta reglas gramaticales con descripciones y ejemplos.

#### Tip
Diferentes tipos de consejos: info, warning, success, error.

#### GrammarTable
Tablas gramaticales estructuradas y responsivas.

#### QuickReference
Lista rápida de puntos clave del tema.

#### ProgressIndicator
Indicador visual de progreso.

### 3. Componentes de Ejercicios (ExerciseComponents.js)

#### MultipleChoiceExercise
Ejercicios de opción múltiple con retroalimentación inmediata.

**Características:**
- Verificación automática de respuestas
- Explicaciones detalladas
- Opción de reintentar
- Seguimiento de progreso

#### FillBlanksExercise
Ejercicios de completar espacios en blanco.

**Características:**
- Múltiples espacios en blanco
- Validación de respuestas
- Puntuación por porcentaje
- Retroalimentación visual

#### TrueFalseExercise
Ejercicios de verdadero/falso con explicaciones.

**Características:**
- Múltiples declaraciones
- Explicaciones para cada respuesta
- Puntuación total
- Opción de reintentar

## Páginas Implementadas

### ✅ Completadas
1. **Articles, Determiners and Quantifiers** (A1)
2. **Verb to Be** (A1)
3. **Pronouns** (A1)
4. **Present Tenses** (A1-A2-B1)
5. **Past Tenses** (A2-B1-B2)
6. **Future Tenses** (A2-B1-B2)
7. **Modal Verbs** (A2-B1-C1)

### 📋 Estructura de Cada Página

Cada página de teoría incluye:

1. **Introducción al tema**
   - Explicación clara del concepto
   - Referencia rápida de puntos clave

2. **Contenido estructurado**
   - Teoría organizada en secciones
   - Ejemplos prácticos
   - Reglas gramaticales
   - Consejos y advertencias

3. **Ejercicios interactivos**
   - Múltiples tipos de ejercicios
   - Retroalimentación inmediata
   - Explicaciones detalladas
   - Seguimiento de progreso

4. **Errores comunes**
   - Ejemplos de errores frecuentes
   - Correcciones explicadas

5. **Palabras clave**
   - Conectores y expresiones importantes
   - Organizados por categorías

## Características del Sistema

### 🎯 Interactividad
- Ejercicios con verificación automática
- Retroalimentación inmediata
- Explicaciones detalladas
- Opción de reintentar

### 📊 Seguimiento de Progreso
- Integración con sistema de progreso
- Guardado automático de resultados
- Detección de logros
- Estadísticas por tema

### 🎨 Diseño
- Interfaz moderna y atractiva
- Diseño responsivo
- Colores consistentes
- Iconos descriptivos

### ♿ Accesibilidad
- Navegación por teclado
- Contraste adecuado
- Textos alternativos
- Estructura semántica

## Uso

### Para Estudiantes
1. Navega a `/teoria`
2. Selecciona un tema por nivel
3. Lee la teoría en la pestaña "Teoría"
4. Practica con ejercicios en la pestaña "Ejercicios"
5. Ve tu progreso en tiempo real

### Para Desarrolladores
```jsx
// Ejemplo de uso del TheoryLayout
<TheoryLayout
  title="Título del Tema"
  description="Descripción del tema"
  level="A1"
  theoryContent={<TheoryContent />}
  exercises={[<Exercise1 />, <Exercise2 />]}
  prerequisites={["Prerequisito 1", "Prerequisito 2"]}
  estimatedTime="30 min"
/>
```

## Próximos Pasos

### Páginas Pendientes
- Adverbs and Adjectives
- Prepositions
- Word Formation
- Infinitive vs Gerund
- Sentence Structures
- Linking Words
- Conditionals
- Passive Voice
- Reported Speech
- Comparatives and Superlatives

### Mejoras Futuras
- Ejercicios de audio
- Reconocimiento de voz
- Gamificación avanzada
- Modo offline
- Exportación de progreso

## Estructura de Archivos

```
src/
├── components/
│   └── theory/
│       ├── TheoryLayout.js
│       ├── TheoryContent.js
│       ├── ExerciseComponents.js
│       └── README.md
└── app/
    └── teoria/
        ├── page.js (página principal)
        ├── 1-Articles-Determiners-and-Quantifiers/
        │   └── page.js
        ├── 2-Verb-to-be/
        │   └── page.js
        └── ... (otras páginas)
```

## Contribuir

Para agregar nuevas páginas de teoría:

1. Crea la carpeta del tema en `src/app/teoria/`
2. Implementa `page.js` usando `TheoryLayout`
3. Estructura el contenido usando los componentes de `TheoryContent`
4. Agrega ejercicios usando `ExerciseComponents`
5. Actualiza las rutas en `src/app/teoria/page.js`

¡El sistema está listo para expandirse con más temas y funcionalidades!






















