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

const ConditionalsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Conditionals?" icon="🔀">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>conditionals</strong> (condicionales) son estructuras gramaticales que expresan situaciones 
          hipotéticas, posibilidades y sus resultados. Se componen de una cláusula condicional (if) y una cláusula 
          principal que expresa el resultado.
        </p>
        
        <QuickReference items={[
          "Expresan situaciones hipotéticas",
          "Tienen cláusula 'if' y resultado",
          "Diferentes tipos según probabilidad",
          "Zero, First, Second, Third, Mixed",
          "Esenciales para expresar posibilidades"
        ]} />
      </TheorySection>

      <TheorySection title="Zero Conditional" icon="🌍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hechos generales, verdades universales y situaciones que siempre son verdaderas.
        </p>

        <GrammarTable
          caption="Zero Conditional - Estructura"
          headers={["Estructura", "Ejemplo", "Significado"]}
          rows={[
            ["If + presente simple, presente simple", "If you heat water, it boils", "Si calientas agua, hierve"],
            ["Presente simple + if + presente simple", "Water boils if you heat it", "El agua hierve si la calientas"],
            ["When/Whenever + presente simple, presente simple", "When it rains, the ground gets wet", "Cuando llueve, el suelo se moja"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si no comes, tienes hambre"
            english="If you don't eat, you get hungry"
            translation="Si no comes, tienes hambre"
          />
          <Example 
            spanish="Cuando hace frío, uso abrigo"
            english="When it's cold, I wear a coat"
            translation="Cuando hace frío, uso abrigo"
          />
          <Example 
            spanish="Si estudias, aprendes"
            english="If you study, you learn"
            translation="Si estudias, aprendes"
          />
        </div>

        <Rule 
          title="Usos del Zero Conditional"
          description="Se usa para:"
          examples={[
            "Hechos científicos y naturales",
            "Rutinas y hábitos",
            "Instrucciones y reglas",
            "Causa y efecto general"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El Zero Conditional expresa situaciones que siempre son verdaderas, no hipotéticas.
        </Tip>
      </TheorySection>

      <TheorySection title="First Conditional" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para situaciones reales y posibles en el futuro. Expresa condiciones que pueden cumplirse.
        </p>

        <GrammarTable
          caption="First Conditional - Estructura"
          headers={["Estructura", "Ejemplo", "Significado"]}
          rows={[
            ["If + presente simple, will + infinitivo", "If it rains, I will stay home", "Si llueve, me quedaré en casa"],
            ["If + presente simple, be going to + infinitivo", "If you study, you are going to pass", "Si estudias, vas a aprobar"],
            ["If + presente simple, modal + infinitivo", "If you hurry, you can catch the bus", "Si te apuras, puedes tomar el autobús"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si tengo tiempo, te llamaré"
            english="If I have time, I will call you"
            translation="Si tengo tiempo, te llamaré"
          />
          <Example 
            spanish="Si estudias mucho, aprobarás"
            english="If you study hard, you will pass"
            translation="Si estudias mucho, aprobarás"
          />
          <Example 
            spanish="Si viene temprano, podremos almorzar juntos"
            english="If he comes early, we can have lunch together"
            translation="Si viene temprano, podremos almorzar juntos"
          />
        </div>

        <Rule 
          title="Características del First Conditional"
          description="Elementos importantes:"
          examples={[
            "Condición posible y real",
            "Resultado probable en el futuro",
            "Puede usar will, be going to, o modales",
            "Expresa planes y predicciones realistas"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> El First Conditional es el más común para hablar de planes futuros realistas.
        </Tip>
      </TheorySection>

      <TheorySection title="Second Conditional" icon="🌙">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para situaciones hipotéticas, irreales o improbables en el presente o futuro.
        </p>

        <GrammarTable
          caption="Second Conditional - Estructura"
          headers={["Estructura", "Ejemplo", "Significado"]}
          rows={[
            ["If + pasado simple, would + infinitivo", "If I won the lottery, I would travel", "Si ganara la lotería, viajaría"],
            ["If + pasado simple, could + infinitivo", "If I had time, I could help you", "Si tuviera tiempo, podría ayudarte"],
            ["If + pasado simple, might + infinitivo", "If it rained, we might stay inside", "Si lloviera, podríamos quedarnos dentro"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si fuera rico, compraría una casa grande"
            english="If I were rich, I would buy a big house"
            translation="Si fuera rico, compraría una casa grande"
          />
          <Example 
            spanish="Si tuviera alas, podría volar"
            english="If I had wings, I could fly"
            translation="Si tuviera alas, podría volar"
          />
          <Example 
            spanish="Si fuera más joven, haría más deporte"
            english="If I were younger, I would do more sport"
            translation="Si fuera más joven, haría más deporte"
          />
        </div>

        <Rule 
          title="Usos del Second Conditional"
          description="Se usa para:"
          examples={[
            "Situaciones hipotéticas irreales",
            "Sueños y fantasías",
            "Consejos indirectos",
            "Situaciones improbables"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Con 'be', usa 'were' para todas las personas: If I were, If you were, If he were.
        </Tip>
      </TheorySection>

      <TheorySection title="Third Conditional" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para situaciones hipotéticas en el pasado que no se pueden cambiar. Expresa arrepentimiento o especulación sobre el pasado.
        </p>

        <GrammarTable
          caption="Third Conditional - Estructura"
          headers={["Estructura", "Ejemplo", "Significado"]}
          rows={[
            ["If + pasado perfecto, would have + participio", "If I had studied, I would have passed", "Si hubiera estudiado, habría aprobado"],
            ["If + pasado perfecto, could have + participio", "If you had called, I could have helped", "Si hubieras llamado, habría podido ayudar"],
            ["If + pasado perfecto, might have + participio", "If it had rained, we might have stayed", "Si hubiera llovido, nos habríamos quedado"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera sabido, habría venido antes"
            english="If I had known, I would have come earlier"
            translation="Si hubiera sabido, habría venido antes"
          />
          <Example 
            spanish="Si no hubiera llovido, habríamos ido al parque"
            english="If it hadn't rained, we would have gone to the park"
            translation="Si no hubiera llovido, habríamos ido al parque"
          />
          <Example 
            spanish="Si hubiera tenido dinero, habría comprado el coche"
            english="If I had had money, I would have bought the car"
            translation="Si hubiera tenido dinero, habría comprado el coche"
          />
        </div>

        <Rule 
          title="Características del Third Conditional"
          description="Elementos importantes:"
          examples={[
            "Situación en el pasado que no ocurrió",
            "Resultado también en el pasado",
            "Expresa arrepentimiento o especulación",
            "No se puede cambiar el resultado"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El Third Conditional es perfecto para expresar 'qué habría pasado si...' sobre el pasado.
        </Tip>
      </TheorySection>

      <TheorySection title="Mixed Conditionals" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Combinan diferentes tiempos para expresar situaciones donde la condición y el resultado están en diferentes momentos temporales.
        </p>

        <GrammarTable
          caption="Mixed Conditionals - Tipos"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Tipo 1", "If + pasado perfecto, would + infinitivo", "If I had studied, I would be smarter now"],
            ["Tipo 2", "If + pasado simple, would have + participio", "If I were taller, I would have played basketball"],
            ["Tipo 3", "If + presente perfecto, would + infinitivo", "If I have finished, I will leave early"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera estudiado medicina, sería doctor ahora"
            english="If I had studied medicine, I would be a doctor now"
            translation="Si hubiera estudiado medicina, sería doctor ahora"
          />
          <Example 
            spanish="Si fuera más valiente, habría viajado solo"
            english="If I were braver, I would have traveled alone"
            translation="Si fuera más valiente, habría viajado solo"
          />
          <Example 
            spanish="Si tengo tiempo mañana, habré terminado el proyecto"
            english="If I have time tomorrow, I will have finished the project"
            translation="Si tengo tiempo mañana, habré terminado el proyecto"
          />
        </div>

        <Rule 
          title="Usos de Mixed Conditionals"
          description="Se usan para:"
          examples={[
            "Conectar pasado con presente",
            "Conectar presente con pasado",
            "Expresar resultados complejos",
            "Mostrar relaciones temporales"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los Mixed Conditionals son avanzados pero muy útiles para expresar situaciones complejas.
        </Tip>
      </TheorySection>

      <TheorySection title="Unless, Provided that, As long as" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Otras palabras que pueden introducir condiciones con significados específicos.
        </p>

        <GrammarTable
          caption="Otras Palabras Condicionales"
          headers={["Palabra", "Significado", "Ejemplo"]}
          rows={[
            ["unless", "si no, a menos que", "Unless you study, you won't pass"],
            ["provided that", "siempre que, con tal de que", "I'll help provided that you ask nicely"],
            ["as long as", "siempre que, mientras que", "As long as you're happy, I'm happy"],
            ["in case", "por si acaso", "Take an umbrella in case it rains"],
            ["suppose/supposing", "supongamos que", "Supposing it rains, what will we do?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="No aprobarás a menos que estudies"
            english="You won't pass unless you study"
            translation="No aprobarás a menos que estudies"
          />
          <Example 
            spanish="Te ayudaré siempre que me lo pidas bien"
            english="I'll help you provided that you ask nicely"
            translation="Te ayudaré siempre que me lo pidas bien"
          />
          <Example 
            spanish="Lleva paraguas por si llueve"
            english="Take an umbrella in case it rains"
            translation="Lleva paraguas por si llueve"
          />
        </div>

        <Rule 
          title="Diferencias Importantes"
          description="Usa la palabra correcta:"
          examples={[
            "Unless = if not (negativo)",
            "Provided that = condición específica",
            "As long as = condición continua",
            "In case = precaución"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> 'Unless' ya incluye el negativo, no uses 'not' después: Unless you don't study ❌ → Unless you study ✅
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Mezclar tiempos incorrectamente ❌<br/>
            <strong>Correcto:</strong> Usar tiempos consistentes ✅<br/>
            <em>If I will have time, I would help. → If I have time, I will help.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'was' en lugar de 'were' ❌<br/>
            <strong>Correcto:</strong> Usar 'were' para todas las personas ✅<br/>
            <em>If I was rich... → If I were rich...</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Olvidar 'have' en Third Conditional ❌<br/>
            <strong>Correcto:</strong> Incluir 'have' en el resultado ✅<br/>
            <em>If I had known, I would come. → If I had known, I would have come.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'unless' con 'not' ❌<br/>
            <strong>Correcto:</strong> 'Unless' ya incluye el negativo ✅<br/>
            <em>Unless you don't study... → Unless you study...</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confundir Zero y First Conditional ❌<br/>
            <strong>Correcto:</strong> Entender la diferencia de probabilidad ✅<br/>
            <em>If water boils (Zero) vs If it rains (First)</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Tiempos verbales"
            description="Cada tipo de conditional usa tiempos específicos."
            examples={[
              "Zero: presente + presente",
              "First: presente + futuro",
              "Second: pasado + would + infinitivo",
              "Third: pasado perfecto + would have + participio"
            ]}
          />

          <Rule 
            title="2. Probabilidad"
            description="Los conditionals expresan diferentes grados de probabilidad."
            examples={[
              "Zero: siempre verdadero (100%)",
              "First: posible (50-90%)",
              "Second: improbable (10-30%)",
              "Third: imposible (0%)"
            ]}
          />

          <Rule 
            title="3. Estructura flexible"
            description="Puedes cambiar el orden de las cláusulas."
            examples={[
              "If clause + comma + main clause",
              "Main clause + if clause (sin coma)",
              "Ambos órdenes son correctos",
              "Elige según el énfasis"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'If I _____ time tomorrow, I _____ you.'"
      options={[
        "have, call",
        "have, will call",
        "will have, call",
        "had, would call"
      ]}
      correctAnswer={1}
      explanation="En first conditional usamos: If + present simple, will + infinitive."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which conditional is used for real and possible situations in the future?"
      options={[
        "Zero Conditional",
        "First Conditional",
        "Second Conditional",
        "Third Conditional"
      ]}
      correctAnswer={1}
      explanation="First Conditional is used for real and possible situations in the future. It uses 'if + present simple, will + infinitive'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Zero Conditional is used for general truths and facts that are always true.",
          isTrue: true,
          explanation: "Correct. Zero Conditional expresses general truths, scientific facts, and situations that are always true."
        },
        {
          text: "In Second Conditional, you can use 'was' instead of 'were' with all persons.",
          isTrue: false,
          explanation: "Incorrect. In Second Conditional, 'were' is used for all persons with the verb 'be': If I were, If you were, If he were."
        },
        {
          text: "Third Conditional is used for hypothetical situations in the past that cannot be changed.",
          isTrue: true,
          explanation: "Correct. Third Conditional expresses regret or speculation about past situations that cannot be changed."
        },
        {
          text: "'Unless' means the same as 'if not' and already includes the negative.",
          isTrue: true,
          explanation: "Correct. 'Unless' means 'if not' and already contains the negative, so you don't add 'not' after it."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct structure for Second Conditional?"
      options={[
        "If + present simple, will + infinitive",
        "If + past simple, would + infinitive",
        "If + past perfect, would have + past participle",
        "If + present simple, present simple"
      ]}
      correctAnswer={1}
      explanation="Second Conditional uses 'If + past simple, would + infinitive' to express hypothetical or unreal situations."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence is correct?"
      options={[
        "If I was rich, I would buy a house.",
        "If I were rich, I would buy a house.",
        "If I am rich, I will buy a house.",
        "If I had been rich, I would buy a house."
      ]}
      correctAnswer={1}
      explanation="The correct Second Conditional uses 'were' for all persons with 'be': 'If I were rich, I would buy a house.'"
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Third Conditional is used for impossible past situations.",
          isTrue: true,
          explanation: "Correcto. Third Conditional expresa situaciones pasadas que no pueden cambiar: 'If I had studied, I would have passed.'"
        },
        {
          text: "'Unless' means the same as 'if'.",
          isTrue: false,
          explanation: "Incorrecto. 'Unless' significa 'if not': 'Unless you study' = 'If you don't study'."
        },
        {
          text: "Zero Conditional uses present tense in both clauses.",
          isTrue: true,
          explanation: "Correcto. Zero Conditional usa presente en ambas partes para hechos generales: 'If you heat water, it boils.'"
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'If I ___ you, I would apologize.'"
      options={[
        "am",
        "was",
        "were",
        "will be"
      ]}
      correctAnswer={2}
      explanation="En Second Conditional con 'be', usamos 'were' para todas las personas: 'If I were you'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'If she ___ earlier, she wouldn't have missed the train.'"
      options={[
        "left",
        "had left",
        "leaves",
        "would leave"
      ]}
      correctAnswer={1}
      explanation="Third Conditional usa 'had + past participle' en la cláusula if: 'If she had left earlier'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "First Conditional expresses real possibilities in the future.",
          isTrue: true,
          explanation: "Correcto. First Conditional expresa posibilidades reales: 'If it rains, I will stay home.'"
        },
        {
          text: "We can start a conditional sentence with the main clause.",
          isTrue: true,
          explanation: "Correcto. Podemos decir 'I will help you if you ask me' (sin coma cuando la cláusula if va al final)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: '___ you don't study, you will fail the exam.'"
      options={[
        "If",
        "Unless",
        "When",
        "Because"
      ]}
      correctAnswer={0}
      explanation="'If you don't study' es correcto. 'Unless' ya incluye el negativo, sería 'Unless you study'."
    />
  ];

  return (
    <TheoryLayout
      title="Conditionals"
      description="Domina los condicionales en inglés. Aprende a expresar situaciones hipotéticas, posibilidades reales e imposibles con if, unless, provided that."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Present and past tenses", "Future forms", "Modal verbs"]}
      estimatedTime="95 min"
    />
  );
};

export default ConditionalsPage;