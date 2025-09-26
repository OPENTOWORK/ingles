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

const LinkingWordsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Linking Words?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>linking words</strong> (palabras de enlace) son palabras o frases que conectan ideas, oraciones y párrafos. 
          Nos ayudan a crear textos coherentes y fluidos, especialmente en niveles intermedios y avanzados. Son esenciales 
          para la escritura académica y profesional.
        </p>
        
        <QuickReference items={[
          "Conectan ideas y oraciones",
          "Mejoran la fluidez del texto",
          "Indican relaciones entre ideas",
          "Esenciales para escritura académica",
          "Ayudan a organizar argumentos"
        ]} />
      </TheorySection>

      <TheorySection title="Addition (Adición)" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas palabras se usan para agregar información o ideas similares.
        </p>

        <GrammarTable
          caption="Linking Words para Adición"
          headers={["Palabra", "Uso", "Posición", "Ejemplo"]}
          rows={[
            ["and", "adición simple", "entre elementos", "I like tea and coffee"],
            ["also", "información adicional", "inicio/medio", "I also like green tea"],
            ["too", "acuerdo/adición", "final de oración", "I like coffee too"],
            ["as well", "información adicional", "final de oración", "I like coffee as well"],
            ["furthermore", "adición formal", "inicio de oración", "Furthermore, we need more time"],
            ["moreover", "adición formal", "inicio de oración", "Moreover, it is expensive"],
            ["in addition", "adición formal", "inicio de oración", "In addition, we have other options"],
            ["besides", "punto adicional", "inicio/medio", "Besides, it is more convenient"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el té y el café"
            english="I like tea and coffee"
            translation="Me gusta el té y el café"
          />
          <Example 
            spanish="También me gusta el té verde"
            english="I also like green tea"
            translation="También me gusta el té verde"
          />
          <Example 
            spanish="Además, necesitamos más tiempo"
            english="Furthermore, we need more time"
            translation="Además, necesitamos más tiempo"
          />
        </div>

        <Rule 
          title="Consejos para Adición"
          description="Para agregar información efectivamente:"
          examples={[
            "Usa 'and' para conexiones simples",
            "Usa 'also' para información adicional",
            "Usa 'furthermore' en contextos formales",
            "Evita repetir la misma palabra de enlace"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Las palabras de adición ayudan a construir argumentos sólidos paso a paso.
        </Tip>
      </TheorySection>

      <TheorySection title="Contrast (Contraste)" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas palabras muestran diferencias o contrastes entre ideas.
        </p>

        <GrammarTable
          caption="Linking Words para Contraste"
          headers={["Palabra", "Uso", "Ejemplo"]}
          rows={[
            ["but", "contraste directo", "I like coffee, but I prefer tea"],
            ["however", "contraste formal", "I like coffee. However, I prefer tea"],
            ["although", "contraste (a pesar de)", "Although I like coffee, I prefer tea"],
            ["though", "contraste informal", "I like coffee, though I prefer tea"],
            ["even though", "contraste fuerte", "Even though it's expensive, I'll buy it"],
            ["despite", "contraste (formal)", "Despite the rain, we went out"],
            ["in spite of", "contraste (formal)", "In spite of the problems, we succeeded"],
            ["on the other hand", "visión alternativa", "It's expensive. On the other hand, it's good quality"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el café, pero prefiero el té"
            english="I like coffee, but I prefer tea"
            translation="Me gusta el café, pero prefiero el té"
          />
          <Example 
            spanish="A pesar de la lluvia, salimos"
            english="Despite the rain, we went out"
            translation="A pesar de la lluvia, salimos"
          />
          <Example 
            spanish="Por otro lado, es de buena calidad"
            english="On the other hand, it's good quality"
            translation="Por otro lado, es de buena calidad"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> 'However' va al inicio de la segunda oración, no al final de la primera.
        </Tip>
      </TheorySection>

      <TheorySection title="Cause and Effect (Causa y Efecto)" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas palabras explican por qué algo sucede (causa) y cuáles son las consecuencias (efecto).
        </p>

        <GrammarTable
          caption="Linking Words para Causa y Efecto"
          headers={["Tipo", "Palabra", "Ejemplo"]}
          rows={[
            ["Causa", "because", "I stayed home because I was sick"],
            ["Causa", "since", "Since it's raining, we'll stay inside"],
            ["Causa", "as", "As it was late, we decided to leave"],
            ["Causa", "due to", "Due to the weather, the flight was cancelled"],
            ["Efecto", "so", "I was tired, so I went to bed"],
            ["Efecto", "therefore", "It was raining. Therefore, we stayed inside"],
            ["Efecto", "thus", "The roads were icy. Thus, driving was dangerous"],
            ["Efecto", "consequently", "He didn't study. Consequently, he failed"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me quedé en casa porque estaba enfermo"
            english="I stayed home because I was sick"
            translation="Me quedé en casa porque estaba enfermo"
          />
          <Example 
            spanish="Estaba cansado, así que me fui a la cama"
            english="I was tired, so I went to bed"
            translation="Estaba cansado, así que me fui a la cama"
          />
          <Example 
            spanish="Por lo tanto, nos quedamos dentro"
            english="Therefore, we stayed inside"
            translation="Por lo tanto, nos quedamos dentro"
          />
        </div>

        <Rule 
          title="Consejos para Causa y Efecto"
          description="Para explicar relaciones causales:"
          examples={[
            "Usa 'because' para explicar razones",
            "Usa 'so' para mostrar resultados",
            "Usa 'therefore' en contextos formales",
            "Sé claro sobre la relación causa-efecto"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las palabras de causa y efecto ayudan a crear argumentos lógicos y persuasivos.
        </Tip>
      </TheorySection>

      <TheorySection title="Sequence (Secuencia)" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas palabras organizan ideas en orden cronológico o lógico.
        </p>

        <GrammarTable
          caption="Linking Words para Secuencia"
          headers={["Palabra", "Uso", "Ejemplo"]}
          rows={[
            ["first", "comenzar", "First, we need to plan"],
            ["second", "segundo paso", "Second, we should research"],
            ["third", "tercer paso", "Third, we can start working"],
            ["then", "siguiente paso", "First, plan. Then, execute"],
            ["next", "paso siguiente", "Next, we need to evaluate"],
            ["finally", "último paso", "Finally, we can present our results"],
            ["lastly", "último paso", "Lastly, don't forget to follow up"],
            ["eventually", "resultado final", "Eventually, we will succeed"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Primero, necesitamos planificar"
            english="First, we need to plan"
            translation="Primero, necesitamos planificar"
          />
          <Example 
            spanish="Luego, ejecutamos"
            english="Then, we execute"
            translation="Luego, ejecutamos"
          />
          <Example 
            spanish="Finalmente, presentamos los resultados"
            english="Finally, we present our results"
            translation="Finalmente, presentamos los resultados"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Los marcadores de secuencia hacen que tus textos sean más fáciles de seguir.
        </Tip>
      </TheorySection>

      <TheorySection title="Examples (Ejemplos)" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas palabras introducen ejemplos o ilustraciones para apoyar tus ideas.
        </p>

        <GrammarTable
          caption="Linking Words para Ejemplos"
          headers={["Palabra", "Uso", "Ejemplo"]}
          rows={[
            ["for example", "introducir ejemplo", "Many fruits are healthy. For example, apples and oranges"],
            ["for instance", "introducir ejemplo", "Some sports are dangerous. For instance, boxing"],
            ["such as", "dar ejemplos", "I like tropical fruits such as mangoes and pineapples"],
            ["namely", "ejemplos específicos", "I have three hobbies, namely reading, swimming, and cooking"],
            ["to illustrate", "ejemplo formal", "To illustrate this point, consider the following case"],
            ["as an example", "ejemplo formal", "As an example, let's look at the sales figures"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Muchas frutas son saludables. Por ejemplo, manzanas y naranjas"
            english="Many fruits are healthy. For example, apples and oranges"
            translation="Muchas frutas son saludables. Por ejemplo, manzanas y naranjas"
          />
          <Example 
            spanish="Me gustan las frutas tropicales como mangos y piñas"
            english="I like tropical fruits such as mangoes and pineapples"
            translation="Me gustan las frutas tropicales como mangos y piñas"
          />
          <Example 
            spanish="Tengo tres hobbies, a saber: leer, nadar y cocinar"
            english="I have three hobbies, namely reading, swimming, and cooking"
            translation="Tengo tres hobbies, a saber: leer, nadar y cocinar"
          />
        </div>

        <Rule 
          title="Consejos para Ejemplos"
          description="Para usar ejemplos efectivamente:"
          examples={[
            "Usa ejemplos relevantes y claros",
            "Varía las palabras de introducción",
            "Asegúrate de que los ejemplos apoyen tu punto",
            "No uses demasiados ejemplos"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los ejemplos concretos hacen que tus argumentos sean más convincentes.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar 'but' al inicio de una oración ❌<br/>
            <strong>Correcto:</strong> Usar 'however' al inicio ✅<br/>
            <em>But: I like coffee. But I prefer tea. → However: I like coffee. However, I prefer tea.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'and' para empezar una oración ❌<br/>
            <strong>Correcto:</strong> Usar 'in addition' o 'furthermore' ✅<br/>
            <em>And: And we also need to consider... → In addition: In addition, we also need to consider...</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confundir 'because' y 'so' ❌<br/>
            <strong>Correcto:</strong> Usar solo uno de los dos ✅<br/>
            <em>Because I was tired, so I went to bed. → Because I was tired, I went to bed. / I was tired, so I went to bed.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No variar las palabras de enlace ❌<br/>
            <strong>Correcto:</strong> Usar variedad de conectores ✅<br/>
            <em>Repetir siempre 'and' → Usar 'also', 'furthermore', 'in addition', etc.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Posición en la oración"
            description="La posición de las palabras de enlace es importante."
            examples={[
              "Algunas van al inicio (however, therefore)",
              "Otras van en el medio (and, but)",
              "Algunas van al final (too, as well)",
              "Lee ejemplos para aprender la posición correcta"
            ]}
          />

          <Rule 
            title="2. Formalidad"
            description="Elige palabras apropiadas para el contexto."
            examples={[
              "Informal: but, so, and",
              "Formal: however, therefore, furthermore",
              "Académico: moreover, consequently, nevertheless",
              "Adapta tu elección al contexto"
            ]}
          />

          <Rule 
            title="3. Variedad"
            description="Usa diferentes palabras de enlace para evitar repetición."
            examples={[
              "No uses siempre la misma palabra",
              "Aprende sinónimos y alternativas",
              "Varía según el tipo de relación",
              "Practica con diferentes contextos"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="I like coffee. ___, I prefer tea in the morning. The weather is bad. ___, we should stay inside."
      blanks={[
        { answer: "However" },
        { answer: "Therefore" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el beneficio principal de usar linking words?"
      options={[
        "Mejorar la pronunciación",
        "Crear textos coherentes y fluidos",
        "Aumentar la velocidad de escritura",
        "Reducir el vocabulario necesario"
      ]}
      correctAnswer={1}
      explanation="Los linking words conectan ideas y crean textos coherentes y fluidos, facilitando la comprensión del lector."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Es correcto usar 'but' al inicio de una oración en inglés formal.",
          isTrue: false,
          explanation: "En inglés formal, es mejor usar 'however' al inicio de la segunda oración para mostrar contraste."
        },
        {
          text: "Los linking words ayudan a organizar ideas de manera lógica.",
          isTrue: true,
          explanation: "Correcto. Los linking words conectan ideas y ayudan a crear una estructura lógica en el texto."
        },
        {
          text: "Es importante variar las palabras de enlace para evitar repetición.",
          isTrue: true,
          explanation: "Correcto. Usar variedad de linking words hace que el texto sea más interesante y profesional."
        },
        {
          text: "'Because' y 'so' se pueden usar juntos en la misma oración.",
          isTrue: false,
          explanation: "Incorrecto. No se debe usar 'because' y 'so' juntos. Se usa uno u otro: 'Because I was tired, I went to bed' o 'I was tired, so I went to bed'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor opción para agregar información formalmente?"
      options={[
        "and",
        "also",
        "furthermore",
        "too"
      ]}
      correctAnswer={2}
      explanation="'Furthermore' es la opción más formal para agregar información. 'And' es muy básico, 'also' es informal, y 'too' va al final."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué palabra de enlace es mejor para mostrar contraste en un contexto académico?"
      options={[
        "but",
        "however",
        "though",
        "and"
      ]}
      correctAnswer={1}
      explanation="'However' es la opción más apropiada para contextos académicos y formales. 'But' es más informal, 'though' es casual, y 'and' no muestra contraste."
    />
  ];

  return (
    <TheoryLayout
      title="Linking Words"
      description="Domina las palabras de enlace en inglés. Aprende a conectar ideas, mostrar contrastes, explicar causas y efectos, y crear textos coherentes y fluidos."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic sentence structure", "Understanding of text organization"]}
      estimatedTime="90 min"
    />
  );
};

export default LinkingWordsPage;