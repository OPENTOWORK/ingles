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

const SubjunctivePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Subjuntivo y Pasado Irreal" icon="🎭">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>subjuntivo</strong> y las estructuras de <strong>pasado irreal</strong> en inglés expresan 
          situaciones hipotéticas, deseos, recomendaciones y situaciones contrarias a la realidad. 
          Son esenciales para comunicación sofisticada en niveles avanzados.
        </p>
        
        <QuickReference items={[
          "Subjuntivo: situaciones hipotéticas y formales",
          "Pasado irreal: 'were' para todas las personas",
          "Expresiones de deseo: wish, if only, would rather",
          "Recomendaciones: suggest, recommend, insist",
          "Estructuras formales y académicas"
        ]} />
      </TheorySection>

      <TheorySection title="El Subjuntivo en Inglés" icon="👑">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Aunque menos común que en español, el inglés mantiene formas subjuntivas en contextos específicos.
        </p>

        <GrammarTable
          caption="Usos del Subjuntivo"
          headers={["Contexto", "Estructura", "Ejemplo", "Registro"]}
          rows={[
            ["Recomendaciones", "suggest/recommend + (that) + base form", "I suggest that he study harder", "Formal"],
            ["Necesidad", "it's important/necessary + (that) + base form", "It's vital that she be present", "Muy formal"],
            ["Deseos formales", "wish + past subjunctive", "I wish I were taller", "Neutral"],
            ["Condiciones irreales", "if + were (todas las personas)", "If I were you, I would go", "Neutral"],
            ["Expresiones fijas", "God save the Queen, Long live...", "God save the Queen", "Ceremonial"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Es importante que él esté presente."
            english="It's important that he be present."
            translation="Subjuntivo formal: 'be' en lugar de 'is'"
          />
          
          <Example 
            spanish="Sugiero que estudies más."
            english="I suggest that you study more."
            translation="Base form después de 'suggest'"
          />
        </div>

        <Tip type="info">
          <strong>Nota:</strong> En inglés moderno, muchas formas subjuntivas se reemplazan por 'should' + infinitivo: 
          "I suggest that he should study" es más común que "I suggest that he study".
        </Tip>
      </TheorySection>

      <TheorySection title="Pasado Irreal con 'Were'" icon="🌟">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          'Were' se usa para todas las personas en situaciones hipotéticas, contrario a la gramática normal.
        </p>

        <Rule 
          title="Cuándo usar 'Were' para todas las personas"
          description="Usa 'were' (no 'was') en estas situaciones:"
          examples={[
            "Condicionales irreales: 'If I were rich...'",
            "Después de 'wish': 'I wish I were there'",
            "Después de 'as if/as though': 'He acts as if he were the boss'",
            "Después de 'suppose/imagine': 'Suppose you were famous'",
            "En inversión formal: 'Were I to leave early...'"
          ]}
        />

        <GrammarTable
          caption="Were vs Was en Contextos Irreales"
          headers={["Situación", "Incorrecto", "Correcto", "Explicación"]}
          rows={[
            ["Condicional irreal", "If I was you", "If I were you", "'Were' en situaciones hipotéticas"],
            ["Después de wish", "I wish I was taller", "I wish I were taller", "Expresa deseo irreal"],
            ["As if/as though", "He acts as if he was rich", "He acts as if he were rich", "Comparación irreal"],
            ["Suppose", "Suppose she was here", "Suppose she were here", "Situación imaginaria"]
          ]}
        />

        <Tip type="success">
          <strong>Truco:</strong> Si puedes reemplazar la situación con "imagine that..." entonces usa 'were'. 
          "Imagine that I were rich" → "If I were rich".
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones de Deseo" icon="⭐">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Varias estructuras expresan deseos sobre situaciones presentes, pasadas o futuras.
        </p>

        <GrammarTable
          caption="Estructuras de Deseo"
          headers={["Estructura", "Tiempo", "Uso", "Ejemplo"]}
          rows={[
            ["wish + past simple", "Presente", "Deseo sobre situación actual", "I wish I had more time"],
            ["wish + past perfect", "Pasado", "Arrepentimiento sobre el pasado", "I wish I had studied harder"],
            ["wish + would", "Futuro/Hábito", "Deseo de cambio futuro", "I wish you would listen to me"],
            ["if only + past simple", "Presente", "Deseo fuerte sobre presente", "If only I were younger"],
            ["if only + past perfect", "Pasado", "Arrepentimiento fuerte", "If only I had known"],
            ["would rather + past", "Preferencia", "Preferencia sobre acciones de otros", "I'd rather you didn't smoke"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ojalá tuviera más dinero (ahora)."
            english="I wish I had more money."
            translation="Deseo sobre situación presente"
          />
          
          <Example 
            spanish="Ojalá hubiera estudiado más (en el pasado)."
            english="I wish I had studied more."
            translation="Arrepentimiento sobre el pasado"
          />
          
          <Example 
            spanish="Ojalá me escucharas (cambio futuro)."
            english="I wish you would listen to me."
            translation="Deseo de cambio en comportamiento"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No uses 'wish + would' para ti mismo: "I wish I would be rich" ❌ 
          → "I wish I were rich" ✅
        </Tip>
      </TheorySection>

      <TheorySection title="Would Rather - Preferencias" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          'Would rather' expresa preferencias de manera educada y sofisticada.
        </p>

        <Rule 
          title="Estructuras con Would Rather"
          description="Diferentes formas de expresar preferencias:"
          examples={[
            "Would rather + infinitive: 'I'd rather stay home'",
            "Would rather + past simple (otros): 'I'd rather you came early'",
            "Would rather + past perfect (pasado): 'I'd rather you had told me'",
            "Would rather... than: 'I'd rather walk than drive'"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Prefiero quedarme en casa."
            english="I would rather stay home."
            translation="Preferencia personal"
          />
          
          <Example 
            spanish="Prefiero que vengas temprano."
            english="I would rather you came early."
            translation="Preferencia sobre acciones de otros (presente/futuro)"
          />
          
          <Example 
            spanish="Prefiero caminar que conducir."
            english="I would rather walk than drive."
            translation="Comparación de preferencias"
          />
        </div>
      </TheorySection>

      <TheorySection title="It's Time - Expresiones de Tiempo" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Expresiones con 'time' que requieren estructuras especiales.
        </p>

        <GrammarTable
          caption="Expresiones con 'Time'"
          headers={["Expresión", "Estructura", "Significado", "Ejemplo"]}
          rows={[
            ["It's time", "It's time + past simple", "Es hora de hacer algo ahora", "It's time we left"],
            ["It's about time", "It's about time + past simple", "Ya era hora (con impaciencia)", "It's about time you apologized"],
            ["It's high time", "It's high time + past simple", "Ya es más que hora (urgencia)", "It's high time we made changes"],
            ["It's time for", "It's time for + noun/gerund", "Es hora de (algo específico)", "It's time for dinner"]
          ]}
        />

        <Example 
          spanish="Ya es hora de que te vayas."
          english="It's time you left."
          translation="'Left' (pasado) para expresar presente/futuro inmediato"
        />

        <Tip type="info">
          <strong>Matiz:</strong> "It's time to go" (infinitivo) es neutro, pero "It's time we went" (pasado) 
          implica que ya deberíamos haber ido.
        </Tip>
      </TheorySection>

      <TheorySection title="Verbos de Recomendación" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Ciertos verbos requieren subjuntivo o estructuras especiales en inglés formal.
        </p>

        <GrammarTable
          caption="Verbos que Requieren Subjuntivo"
          headers={["Verbo", "Estructura Formal", "Estructura Informal", "Ejemplo"]}
          rows={[
            ["suggest", "suggest + (that) + base form", "suggest + -ing", "I suggest (that) he go / I suggest going"],
            ["recommend", "recommend + (that) + base form", "recommend + -ing", "We recommend (that) you be careful"],
            ["insist", "insist + (that) + base form", "insist on + -ing", "She insists (that) we arrive early"],
            ["demand", "demand + (that) + base form", "demand + to + infinitive", "They demand (that) he resign"],
            ["propose", "propose + (that) + base form", "propose + -ing", "I propose (that) we meet tomorrow"]
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> En inglés americano, el subjuntivo es más común. En inglés británico, 
          'should + infinitive' es más frecuente: "I suggest that he should go".
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "If I was you..." ❌<br/>
            <strong>Correcto:</strong> "If I were you..." ✅<br/>
            <em>Usa 'were' en condicionales irreales</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I wish I would have more money" ❌<br/>
            <strong>Correcto:</strong> "I wish I had more money" ✅<br/>
            <em>No uses 'would' con 'wish' para ti mismo en presente</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I suggest that he goes" ❌<br/>
            <strong>Correcto:</strong> "I suggest that he go" ✅<br/>
            <em>Usa base form después de verbos de recomendación</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I'd rather you will come" ❌<br/>
            <strong>Correcto:</strong> "I'd rather you came" ✅<br/>
            <em>Usa past simple después de 'would rather' para otros</em>
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'If I _____ you, I would take that job.'"
      options={[
        "was",
        "were",
        "am",
        "will be"
      ]}
      correctAnswer={1}
      explanation="En situaciones hipotéticas usamos 'were' para todas las personas: 'If I were you'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which sentence is grammatically correct?"
      options={[
        "I wish I would be taller.",
        "I wish I was taller.",
        "I wish I were taller.",
        "I wish I am taller."
      ]}
      correctAnswer={2}
      explanation="'I wish I were taller' usa correctamente el pasado irreal 'were' para expresar un deseo sobre el presente."
    />,

    <MultipleChoiceExercise
      key="3"
      question="Complete: 'I'd rather you _____ smoking in the house.'"
      options={[
        "don't",
        "didn't",
        "wouldn't",
        "not"
      ]}
      correctAnswer={1}
      explanation="Después de 'would rather' para acciones de otros, usamos past simple: 'didn't smoke'."
    />,

    <TrueFalseExercise
      key="4"
      statements={[
        {
          text: "In formal English, we say 'I suggest that he goes' after suggestion verbs.",
          isTrue: false,
          explanation: "Falso. En inglés formal usamos base form: 'I suggest that he go'."
        },
        {
          text: "'Were' is used for all persons in unreal situations.",
          isTrue: true,
          explanation: "Correcto. 'Were' se usa para todas las personas en situaciones irreales."
        },
        {
          text: "'I wish you would listen' expresses a desire for future change.",
          isTrue: true,
          explanation: "Correcto. 'Wish + would' expresa deseo de cambio futuro en otros."
        },
        {
          text: "'It's time we left' means we should leave now or soon.",
          isTrue: true,
          explanation: "Correcto. Esta estructura indica que es momento de actuar."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which expresses the strongest urgency?"
      options={[
        "It's time to go.",
        "It's time we went.",
        "It's about time we went.",
        "It's high time we went."
      ]}
      correctAnswer={3}
      explanation="'It's high time' expresa la mayor urgencia, indicando que algo debería haber pasado hace tiempo."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'I wish I _____ studied harder when I was younger.'"
      options={[
        "have",
        "had",
        "would have",
        "will have"
      ]}
      correctAnswer={1}
      explanation="Para arrepentimientos sobre el pasado usamos 'wish + had + past participle'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I recommend that you _____ a lawyer.'"
      options={[
        "consult",
        "consults",
        "should consult",
        "Both A and C are correct"
      ]}
      correctAnswer={3}
      explanation="Ambas formas son correctas: subjuntivo (consult) o 'should + infinitive'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which sentence uses 'were' correctly?"
      options={[
        "If I was rich, I would travel.",
        "I wish I was younger.",
        "If I were you, I would go.",
        "He acts as if he was the boss."
      ]}
      correctAnswer={2}
      explanation="'If I were you' usa correctamente 'were' en situación hipotética."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: 'It's vital that he _____ the truth.'"
      options={[
        "tells",
        "tell",
        "told",
        "will tell"
      ]}
      correctAnswer={1}
      explanation="Después de 'it's vital that' usamos subjuntivo (base form): 'tell'."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which expresses regret about the past?"
      options={[
        "I wish I had more money.",
        "I wish I would have more money.",
        "I wish I had had more money.",
        "I wish I have more money."
      ]}
      correctAnswer={2}
      explanation="'I wish I had had more money' expresa arrepentimiento sobre el pasado."
    />
  ];

  return (
    <TheoryLayout
      title="Subjunctive and Unreal Past"
      description="Domina el subjuntivo inglés y las estructuras de pasado irreal para expresar deseos, recomendaciones y situaciones hipotéticas con sofisticación."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Condicionales básicos", "Tiempos verbales", "Estructuras de deseo básicas"]}
      estimatedTime="55 min"
    />
  );
};

export default SubjunctivePage;

