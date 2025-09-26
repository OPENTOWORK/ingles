'use client';
import React from 'react';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { 
  TheorySection, 
  Example, 
  Rule, 
  Tip, 
  GrammarTable, 
  QuickReference 
} from '@/components/theory/TheoryContent';
import { 
  MultipleChoiceExercise, 
  FillBlanksExercise, 
  TrueFalseExercise 
} from '@/components/theory/ExerciseComponents';

const ComparativesSuperlativesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Comparatives y Superlatives?" icon="📊">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>comparatives</strong> (comparativos) y <strong>superlatives</strong> (superlativos) se usan para comparar personas, cosas o situaciones. 
          Los comparativos se usan para comparar dos elementos, mientras que los superlativos se usan para comparar tres o más elementos.
        </p>
        
        <QuickReference items={[
          "Comparativos: comparan dos cosas",
          "Superlativos: comparan tres o más cosas",
          "Adjetivos cortos: -er, -est",
          "Adjetivos largos: more, most",
          "Formas irregulares especiales"
        ]} />
      </TheorySection>

      <TheorySection title="Formación de Comparativos y Superlativos" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La formación depende de la longitud del adjetivo y algunas reglas especiales.
        </p>

        <GrammarTable
          caption="Reglas de Formación"
          headers={["Tipo de Adjetivo", "Comparativo", "Superlativo", "Ejemplo"]}
          rows={[
            ["Adjetivos cortos (1-2 sílabas)", "adjetivo + -er", "adjetivo + -est", "tall → taller → tallest"],
            ["Adjetivos largos (3+ sílabas)", "more + adjetivo", "most + adjetivo", "beautiful → more beautiful → most beautiful"],
            ["Adjetivos irregulares", "forma especial", "forma especial", "good → better → best"],
            ["Adjetivos de 2 sílabas", "ambas reglas", "ambas reglas", "happy → happier → happiest"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este coche es más rápido que ese"
            english="This car is faster than that one"
            translation="Este coche es más rápido que ese"
          />
          <Example 
            spanish="Esta es la película más interesante"
            english="This is the most interesting movie"
            translation="Esta es la película más interesante"
          />
          <Example 
            spanish="Ella es la más alta de su familia"
            english="She is the tallest in her family"
            translation="Ella es la más alta de su familia"
          />
        </div>

        <Rule 
          title="Reglas de Escritura"
          description="Para adjetivos cortos:"
          examples={[
            "Doble consonante final: big → bigger → biggest",
            "Cambio de 'y' a 'i': happy → happier → happiest",
            "Agregar 'e' si termina en 'e': nice → nicer → nicest"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los adjetivos de 2 sílabas pueden seguir ambas reglas. Generalmente, los que terminan en -y, -ow, -er, -le usan -er/-est.
        </Tip>
      </TheorySection>

      <TheorySection title="Adjetivos Irregulares" icon="⚠️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunos adjetivos tienen formas irregulares que debes memorizar.
        </p>

        <GrammarTable
          caption="Adjetivos Irregulares"
          headers={["Adjetivo", "Comparativo", "Superlativo", "Ejemplo"]}
          rows={[
            ["good", "better", "best", "This is better than that"],
            ["bad", "worse", "worst", "This is the worst movie"],
            ["far", "farther/further", "farthest/furthest", "It's farther than I thought"],
            ["little", "less", "least", "This costs less money"],
            ["much/many", "more", "most", "I have more books"],
            ["old", "older/elder", "oldest/eldest", "My elder brother"],
            ["late", "later/latter", "latest/last", "The latter option"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esta es una mejor solución"
            english="This is a better solution"
            translation="Esta es una mejor solución"
          />
          <Example 
            spanish="Esta es la peor película que he visto"
            english="This is the worst movie I've ever seen"
            translation="Esta es la peor película que he visto"
          />
          <Example 
            spanish="Tengo más libros que tú"
            english="I have more books than you"
            translation="Tengo más libros que tú"
          />
        </div>

        <Tip type="warning">
          <strong>Nota especial:</strong> 'Farther' se usa para distancia física, 'further' para distancia abstracta. 'Elder' se usa solo para familia (my elder brother).
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras de Comparación" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes formas de estructurar las comparaciones en inglés.
        </p>

        <GrammarTable
          caption="Estructuras de Comparación"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Comparativo básico", "Sujeto + be + comparativo + than + objeto", "This car is faster than that one"],
            ["Superlativo básico", "Sujeto + be + the + superlativo + (in/of + grupo)", "This is the tallest building in the city"],
            ["Igualdad", "Sujeto + be + as + adjetivo + as + objeto", "This book is as interesting as that one"],
            ["Diferencia", "Sujeto + be + not as + adjetivo + as + objeto", "This is not as expensive as that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este coche es más rápido que ese"
            english="This car is faster than that one"
            translation="Este coche es más rápido que ese"
          />
          <Example 
            spanish="Este es el edificio más alto de la ciudad"
            english="This is the tallest building in the city"
            translation="Este es el edificio más alto de la ciudad"
          />
          <Example 
            spanish="Este libro es tan interesante como ese"
            english="This book is as interesting as that one"
            translation="Este libro es tan interesante como ese"
          />
        </div>

        <Rule 
          title="Consejos para Estructuras"
          description="Para usar las estructuras correctamente:"
          examples={[
            "Usa 'than' con comparativos, no con superlativos",
            "Usa 'the' con superlativos (excepto predicativos)",
            "Usa 'as...as' para igualdad",
            "Usa 'not as...as' para diferencia"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las estructuras de comparación hacen que tus descripciones sean más precisas y expresivas.
        </Tip>
      </TheorySection>

      <TheorySection title="Modificadores de Grado" icon="📈">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Palabras que modifican el grado de comparación para enfatizar diferencias.
        </p>

        <GrammarTable
          caption="Modificadores de Grado"
          headers={["Modificador", "Uso", "Ejemplo"]}
          rows={[
            ["much", "enfatizar diferencia grande", "This is much better than that"],
            ["far", "enfatizar diferencia grande", "This is far more expensive"],
            ["a lot", "enfatizar diferencia grande", "This is a lot cheaper"],
            ["a little", "diferencia pequeña", "This is a little more difficult"],
            ["a bit", "diferencia pequeña", "This is a bit longer"],
            ["slightly", "diferencia pequeña", "This is slightly warmer"],
            ["no", "negación", "This is no better than that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esto es mucho mejor que eso"
            english="This is much better than that"
            translation="Esto es mucho mejor que eso"
          />
          <Example 
            spanish="Esto es un poco más difícil"
            english="This is a little more difficult"
            translation="Esto es un poco más difícil"
          />
          <Example 
            spanish="Esto es ligeramente más cálido"
            english="This is slightly warmer"
            translation="Esto es ligeramente más cálido"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Los modificadores de grado ayudan a expresar matices en las comparaciones y hacer el lenguaje más natural.
        </Tip>
      </TheorySection>

      <TheorySection title="Comparativos Progresivos" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estructuras especiales para mostrar progresión en las comparaciones.
        </p>

        <GrammarTable
          caption="Comparativos Progresivos"
          headers={["Estructura", "Uso", "Ejemplo"]}
          rows={[
            ["The more..., the more...", "progresión positiva", "The more you study, the more you learn"],
            ["The better..., the better...", "progresión positiva", "The better the weather, the better the trip"],
            ["The sooner..., the better...", "progresión temporal", "The sooner we start, the better it will be"],
            ["The less..., the less...", "progresión negativa", "The less you worry, the less stress you have"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mientras más estudias, más aprendes"
            english="The more you study, the more you learn"
            translation="Mientras más estudias, más aprendes"
          />
          <Example 
            spanish="Mientras más trabajes, más exitoso te vuelves"
            english="The harder you work, the more successful you become"
            translation="Mientras más trabajes, más exitoso te vuelves"
          />
          <Example 
            spanish="Mientras antes empecemos, mejor"
            english="The sooner we start, the better"
            translation="Mientras antes empecemos, mejor"
          />
        </div>

        <Rule 
          title="Uso de Comparativos Progresivos"
          description="Para usar comparativos progresivos:"
          examples={[
            "Usa 'the' antes de cada comparativo",
            "La estructura es: The + comparativo + ..., the + comparativo + ...",
            "Expresa relaciones de causa y efecto",
            "Es útil para dar consejos y expresar resultados"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los comparativos progresivos son muy útiles para expresar relaciones causales y dar consejos efectivos.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar 'more' con adjetivos cortos ❌<br/>
            <strong>Correcto:</strong> Usar -er con adjetivos cortos ✅<br/>
            <em>This is more big than that. → This is bigger than that.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Olvidar 'the' con superlativos ❌<br/>
            <strong>Correcto:</strong> Usar 'the' con superlativos ✅<br/>
            <em>This is most beautiful flower. → This is the most beautiful flower.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'than' con superlativos ❌<br/>
            <strong>Correcto:</strong> Usar 'of' o 'in' con superlativos ✅<br/>
            <em>This is the tallest than all buildings. → This is the tallest of all buildings.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Doble comparación ❌<br/>
            <strong>Correcto:</strong> Una sola forma de comparación ✅<br/>
            <em>This is more better than that. → This is better than that.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Formas irregulares incorrectas ❌<br/>
            <strong>Correcto:</strong> Memorizar formas irregulares ✅<br/>
            <em>This is the goodest solution. → This is the best solution.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Longitud del adjetivo"
            description="La longitud determina la forma de comparación."
            examples={[
              "Adjetivos cortos (1-2 sílabas): usar -er, -est",
              "Adjetivos largos (3+ sílabas): usar more, most",
              "Adjetivos de 2 sílabas: pueden usar ambas reglas",
              "Verificar la pronunciación para determinar la longitud"
            ]}
          />

          <Rule 
            title="2. Posición y artículos"
            description="Usa los artículos y preposiciones correctas."
            examples={[
              "Superlativos necesitan 'the' antes del adjetivo",
              "Usa 'than' con comparativos, no con superlativos",
              "Usa 'in' para lugares, 'of' para grupos",
              "No uses 'the' con superlativos predicativos"
            ]}
          />

          <Rule 
            title="3. Formas irregulares"
            description="Memoriza las formas irregulares más comunes."
            examples={[
              "good → better → best",
              "bad → worse → worst",
              "far → farther/further → farthest/furthest",
              "much/many → more → most",
              "little → less → least"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="This is the ___ (good) movie I've ever seen. It's ___ (good) than the previous one."
      blanks={[
        { answer: "best" },
        { answer: "better" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="Choose the correct comparative: This book is ___ than the other one."
      options={[
        "interesting",
        "more interesting",
        "most interesting",
        "interestinger"
      ]}
      correctAnswer={1}
      explanation="'Interesting' is a long adjective (3+ syllables), so we use 'more' for the comparative form."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We always use 'the' before superlative adjectives.",
          isTrue: false,
          explanation: "We don't use 'the' when the superlative is predicative or when it means 'very' rather than 'most'."
        },
        {
          text: "Short adjectives use -er and -est for comparatives and superlatives.",
          isTrue: true,
          explanation: "Correct. Short adjectives (1-2 syllables) generally use -er for comparative and -est for superlative."
        },
        {
          text: "'Good' has regular comparative and superlative forms.",
          isTrue: false,
          explanation: "False. 'Good' is irregular: good → better → best."
        },
        {
          text: "We use 'than' with superlatives to show comparison.",
          isTrue: false,
          explanation: "False. We use 'than' with comparatives, not superlatives. With superlatives we use 'of' or 'in'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the superlative form of 'far'?"
      options={[
        "farther",
        "farthest",
        "furthest",
        "both b and c"
      ]}
      correctAnswer={3}
      explanation="'Far' has two superlative forms: 'farthest' (for physical distance) and 'furthest' (for abstract distance)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence is correct?"
      options={[
        "This is the most tallest building.",
        "This is the tallest building.",
        "This is more tall building.",
        "This is tallest building."
      ]}
      correctAnswer={1}
      explanation="'Tall' is a short adjective, so we use -est for superlative, and we need 'the' before superlatives."
    />
  ];

  return (
    <TheoryLayout
      title="Comparatives and Superlatives"
      description="Domina los comparativos y superlativos en inglés. Aprende a comparar personas, cosas y situaciones usando -er, -est, more, most y estructuras especiales."
      level="A2-B1"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic adjectives", "Understanding of sentence structure"]}
      estimatedTime="70 min"
    />
  );
};

export default ComparativesSuperlativesPage;