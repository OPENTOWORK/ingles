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

const SentenceStructuresPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Sentence Structures?" icon="🏗️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>sentence structures</strong> (estructuras de oraciones) son los diferentes tipos de oraciones que puedes formar en inglés. 
          Conocer estas estructuras te permite crear oraciones más complejas y expresivas, combinando ideas de manera efectiva.
        </p>
        
        <QuickReference items={[
          "Simple: una idea principal (S + V + O)",
          "Compound: dos ideas unidas (oración + and/but/or + oración)",
          "Complex: idea principal + idea dependiente (oración + because/when/if + oración)",
          "Compound-Complex: combina compound y complex",
          "Usar conectores para unir ideas"
        ]} />
      </TheorySection>

      <TheorySection title="Simple Sentences (Oraciones Simples)" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Una oración simple contiene una sola idea principal con un sujeto y un predicado.
        </p>

        <GrammarTable
          caption="Estructura de Oraciones Simples"
          headers={["Tipo", "Estructura", "Ejemplo", "Componentes"]}
          rows={[
            ["Sujeto + Verbo", "S + V", "Birds fly", "Sujeto: Birds, Verbo: fly"],
            ["Sujeto + Verbo + Objeto", "S + V + O", "I eat pizza", "S: I, V: eat, O: pizza"],
            ["Sujeto + Verbo + Complemento", "S + V + C", "She is happy", "S: She, V: is, C: happy"],
            ["Sujeto + Verbo + Objeto + Complemento", "S + V + O + C", "I find it easy", "S: I, V: find, O: it, C: easy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Los pájaros vuelan"
            english="Birds fly"
            translation="Los pájaros vuelan"
          />
          <Example 
            spanish="Ella lee libros"
            english="She reads books"
            translation="Ella lee libros"
          />
          <Example 
            spanish="Estoy cansado"
            english="I am tired"
            translation="Estoy cansado"
          />
        </div>

        <Rule 
          title="Características de Oraciones Simples"
          description="Una oración simple:"
          examples={[
            "Tiene un solo sujeto y un solo predicado",
            "Expresa una idea completa",
            "Puede ser corta o larga",
            "Es independiente (no depende de otra oración)"
          ]}
        />

        <Tip type="info">
          <strong>Recuerda:</strong> Una oración simple puede tener múltiples palabras, pero solo una idea principal.
        </Tip>
      </TheorySection>

      <TheorySection title="Compound Sentences (Oraciones Compuestas)" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Una oración compuesta une dos o más oraciones simples usando conectores coordinantes.
        </p>

        <GrammarTable
          caption="Conectores Coordinantes (FANBOYS)"
          headers={["Conector", "Función", "Ejemplo", "Significado"]}
          rows={[
            ["For", "Razón", "I study hard, for I want to pass", "porque"],
            ["And", "Adición", "I like coffee and tea", "y"],
            ["Nor", "Negación", "I don't like coffee, nor do I like tea", "ni"],
            ["But", "Contraste", "I like coffee, but I don't like tea", "pero"],
            ["Or", "Alternativa", "I can have coffee or tea", "o"],
            ["Yet", "Contraste", "I'm tired, yet I can't sleep", "sin embargo"],
            ["So", "Resultado", "I'm tired, so I'll go to bed", "así que"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el café y el té"
            english="I like coffee and tea"
            translation="Me gusta el café y el té"
          />
          <Example 
            spanish="Estoy cansado, así que me voy a la cama"
            english="I'm tired, so I'll go to bed"
            translation="Estoy cansado, así que me voy a la cama"
          />
          <Example 
            spanish="Me gusta el café, pero no el té"
            english="I like coffee, but I don't like tea"
            translation="Me gusta el café, pero no el té"
          />
        </div>

        <Rule 
          title="Formación de Oraciones Compuestas"
          description="Para formar oraciones compuestas:"
          examples={[
            "Oración simple + , + conector + oración simple",
            "Oración simple + conector + oración simple (sin coma)",
            "Cada parte debe poder ser una oración independiente"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Usa coma antes de conectores coordinantes cuando unes dos oraciones completas.
        </Tip>
      </TheorySection>

      <TheorySection title="Complex Sentences (Oraciones Complejas)" icon="🧩">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Una oración compleja tiene una oración principal (independiente) y una o más oraciones subordinadas (dependientes).
        </p>

        <GrammarTable
          caption="Tipos de Oraciones Subordinadas"
          headers={["Tipo", "Conectores", "Ejemplo", "Función"]}
          rows={[
            ["Tiempo", "when, while, before, after", "I eat when I'm hungry", "Cuándo ocurre"],
            ["Causa", "because, since, as", "I study because I want to pass", "Por qué ocurre"],
            ["Condición", "if, unless, provided that", "I'll go if it doesn't rain", "Bajo qué condición"],
            ["Contraste", "although, though, even though", "I go although it's raining", "Contraste de ideas"],
            ["Propósito", "so that, in order to", "I study so that I can pass", "Para qué propósito"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Como cuando tengo hambre"
            english="I eat when I'm hungry"
            translation="Como cuando tengo hambre"
          />
          <Example 
            spanish="Estudio porque quiero aprobar"
            english="I study because I want to pass"
            translation="Estudio porque quiero aprobar"
          />
          <Example 
            spanish="Iré si no llueve"
            english="I'll go if it doesn't rain"
            translation="Iré si no llueve"
          />
        </div>

        <Rule 
          title="Estructura de Oraciones Complejas"
          description="Pueden organizarse de dos maneras:"
          examples={[
            "Oración principal + oración subordinada",
            "Oración subordinada + , + oración principal",
            "La oración subordinada no puede existir sola"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La oración principal tiene sentido completo por sí sola, la subordinada no.
        </Tip>
      </TheorySection>

      <TheorySection title="Compound-Complex Sentences" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Una oración compound-complex combina oraciones compuestas y complejas. Tiene al menos dos oraciones principales y una o más subordinadas.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estudio duro porque quiero aprobar, pero a veces me siento cansado"
            english="I study hard because I want to pass, but sometimes I feel tired"
            translation="Estudio duro porque quiero aprobar, pero a veces me siento cansado"
          />
          <Example 
            spanish="Cuando llueve, me quedo en casa y leo libros"
            english="When it rains, I stay home and read books"
            translation="Cuando llueve, me quedo en casa y leo libros"
          />
          <Example 
            spanish="Si tengo tiempo, iré al cine, pero si no, me quedaré en casa"
            english="If I have time, I'll go to the cinema, but if not, I'll stay home"
            translation="Si tengo tiempo, iré al cine, pero si no, me quedaré en casa"
          />
        </div>

        <Rule 
          title="Características de Compound-Complex"
          description="Este tipo de oración:"
          examples={[
            "Tiene al menos dos oraciones principales",
            "Tiene al menos una oración subordinada",
            "Combina las características de compound y complex",
            "Es la estructura más avanzada"
          ]}
        />

        <Tip type="info">
          <strong>Uso:</strong> Las oraciones compound-complex son útiles para expresar ideas complejas de manera clara.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores Avanzados" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Además de los conectores básicos, hay muchos conectores que te ayudan a crear oraciones más sofisticadas.
        </p>

        <GrammarTable
          caption="Conectores por Función"
          headers={["Función", "Conectores", "Ejemplo", "Significado"]}
          rows={[
            ["Adición", "furthermore, moreover, in addition", "I study hard. Furthermore, I practice daily", "además"],
            ["Contraste", "however, nevertheless, on the other hand", "It's expensive. However, it's worth it", "sin embargo"],
            ["Causa", "due to, owing to, as a result of", "Due to the rain, we stayed home", "debido a"],
            ["Resultado", "consequently, therefore, thus", "I studied hard. Therefore, I passed", "por lo tanto"],
            ["Tiempo", "meanwhile, subsequently, eventually", "I studied. Meanwhile, my friend played", "mientras tanto"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estudio duro. Además, practico diariamente"
            english="I study hard. Furthermore, I practice daily"
            translation="Estudio duro. Además, practico diariamente"
          />
          <Example 
            spanish="Es caro. Sin embargo, vale la pena"
            english="It's expensive. However, it's worth it"
            translation="Es caro. Sin embargo, vale la pena"
          />
          <Example 
            spanish="Debido a la lluvia, nos quedamos en casa"
            english="Due to the rain, we stayed home"
            translation="Debido a la lluvia, nos quedamos en casa"
          />
        </div>

        <Tip type="warning">
          <strong>Puntuación:</strong> Los conectores avanzados suelen ir al inicio de la oración, seguidos de coma.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I like coffee, I like tea" ❌<br/>
            <strong>Correcto:</strong> "I like coffee and tea" o "I like coffee, and I like tea" ✅<br/>
            <em>Necesitas un conector para unir oraciones</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Because I'm tired, so I'll sleep" ❌<br/>
            <strong>Correcto:</strong> "Because I'm tired, I'll sleep" o "I'm tired, so I'll sleep" ✅<br/>
            <em>No uses 'because' y 'so' juntos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I study hard, but I don't pass" ❌<br/>
            <strong>Correcto:</strong> "I study hard, but I don't pass" ✅<br/>
            <em>Esta oración está bien, pero asegúrate de que las ideas contrasten</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "If I have time, I will go" (sin coma) ❌<br/>
            <strong>Correcto:</strong> "If I have time, I will go" ✅<br/>
            <em>Usa coma cuando la oración subordinada va al inicio</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Puntuación con conectores"
            description="Usa coma antes de conectores coordinantes cuando unes oraciones completas."
            examples={[
              "I like coffee, and I like tea",
              "I'm tired, so I'll sleep"
            ]}
          />

          <Rule 
            title="2. Oraciones subordinadas"
            description="Si la oración subordinada va al inicio, usa coma después."
            examples={[
              "When I'm tired, I sleep",
              "Because it's raining, I stay home"
            ]}
          />

          <Rule 
            title="3. Evitar repetición"
            description="No uses conectores redundantes."
            examples={[
              "Because I'm tired, so I'll sleep ❌",
              "I'm tired, so I'll sleep ✅"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="I like coffee ___ I don't like tea. ___ it's raining, I stay home. I study hard, ___ I want to pass the exam. I'll go to the party ___ I finish my homework."
      blanks={[
        { answer: "but" },
        { answer: "Because" },
        { answer: "because" },
        { answer: "if" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'I like coffee, ___ I don't like tea'?"
      options={[
        "and",
        "but",
        "or",
        "so"
      ]}
      correctAnswer={1}
      explanation="Para mostrar contraste entre dos ideas usamos 'but': 'I like coffee, but I don't like tea'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I like coffee, I like tea' is a correct compound sentence.",
          isTrue: false,
          explanation: "Incorrecto. Necesitas un conector para unir las oraciones: 'I like coffee and tea' o 'I like coffee, and I like tea'."
        },
        {
          text: "'Because I'm tired, I'll sleep' is a correct complex sentence.",
          isTrue: true,
          explanation: "Correcto. Es una oración compleja con oración subordinada al inicio."
        },
        {
          text: "'I study hard, so I want to pass' is correct.",
          isTrue: true,
          explanation: "Correcto. Es una oración compuesta con 'so' mostrando resultado."
        },
        {
          text: "'If I have time, I will go' needs a comma.",
          isTrue: true,
          explanation: "Correcto. Cuando la oración subordinada va al inicio, se usa coma después."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: '___ it's raining, I stay home'?"
      options={[
        "Because",
        "So",
        "But",
        "And"
      ]}
      correctAnswer={0}
      explanation="Para mostrar causa usamos 'Because': 'Because it's raining, I stay home'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'I study hard, ___ I want to pass'?"
      options={[
        "because",
        "so",
        "but",
        "and"
      ]}
      correctAnswer={0}
      explanation="Para mostrar razón usamos 'because': 'I study hard, because I want to pass'."
    />
  ];

  return (
    <TheoryLayout
      title="Sentence Structures"
      description="Domina las estructuras de oraciones en inglés: simples, compuestas, complejas y compound-complex. Aprende a usar conectores para crear oraciones más sofisticadas."
      level="A1-B1-B2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar", "Understanding of subjects and verbs", "Basic vocabulary"]}
      estimatedTime="75 min"
    />
  );
};

export default SentenceStructuresPage;

