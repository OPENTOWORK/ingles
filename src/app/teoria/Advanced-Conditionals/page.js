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

const AdvancedConditionalsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Condicionales Avanzados" icon="🎭">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>condicionales avanzados</strong> van más allá de las estructuras básicas (if + will, if + would). 
          Incluyen condicionales mixtos, inversión, y estructuras alternativas que expresan matices más sofisticados 
          de posibilidad, probabilidad y arrepentimiento.
        </p>
        
        <QuickReference items={[
          "Condicionales mixtos: combinan diferentes tiempos",
          "Inversión: estructuras formales sin 'if'",
          "Alternativas: unless, provided that, supposing",
          "Expresan matices complejos de significado",
          "Esenciales para niveles C1-C2"
        ]} />
      </TheorySection>

      <TheorySection title="Condicionales Mixtos" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los condicionales mixtos combinan diferentes períodos de tiempo para expresar relaciones complejas entre causa y efecto.
        </p>

        <GrammarTable
          caption="Tipos de Condicionales Mixtos"
          headers={["Tipo", "Estructura", "Uso", "Ejemplo"]}
          rows={[
            ["Pasado → Presente", "If + past perfect, would + infinitive", "Causa pasada, efecto presente", "If I had studied medicine, I would be a doctor now"],
            ["Presente → Pasado", "If + past simple, would have + past participle", "Causa presente/general, efecto pasado", "If I were more careful, I wouldn't have broken it"],
            ["Pasado → Futuro", "If + past perfect, would + infinitive", "Causa pasada, efecto futuro", "If I had saved money, I would travel next year"],
            ["Presente → Futuro", "If + past simple, will + infinitive", "Causa presente, efecto futuro probable", "If you are late, you will miss the train"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera nacido en Francia, hablaría francés perfectamente ahora."
            english="If I had been born in France, I would speak French perfectly now."
            translation="Causa pasada (nacer en Francia) → Efecto presente (hablar francés)"
          />
          
          <Example 
            spanish="Si fuera más organizado, no habría perdido las llaves ayer."
            english="If I were more organized, I wouldn't have lost my keys yesterday."
            translation="Causa presente/general (ser organizado) → Efecto pasado (perder llaves)"
          />
        </div>

        <Tip type="info">
          <strong>Clave:</strong> Los condicionales mixtos reflejan cómo las acciones de diferentes tiempos 
          se relacionan en la vida real.
        </Tip>
      </TheorySection>

      <TheorySection title="Inversión en Condicionales" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En inglés formal, podemos omitir 'if' e invertir el sujeto y el auxiliar. Esto es común en escritura académica y formal.
        </p>

        <GrammarTable
          caption="Estructuras de Inversión"
          headers={["Condicional Normal", "Con Inversión", "Auxiliar Usado"]}
          rows={[
            ["If I were you...", "Were I you...", "were"],
            ["If I had known...", "Had I known...", "had"],
            ["If you should need help...", "Should you need help...", "should"],
            ["If it were not for...", "Were it not for...", "were"],
            ["If I had not been there...", "Had I not been there...", "had"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera sabido sobre el problema..."
            english="Had I known about the problem, I would have acted differently."
            translation="Estructura formal equivalente a 'If I had known...'"
          />
          
          <Example 
            spanish="Si necesitaras ayuda..."
            english="Should you need any assistance, please don't hesitate to contact us."
            translation="Estructura formal para ofertas educadas"
          />
        </div>

        <Tip type="success">
          <strong>Registro:</strong> La inversión es muy formal. Úsala en escritura académica, cartas formales, 
          y presentaciones profesionales.
        </Tip>
      </TheorySection>

      <TheorySection title="Alternativas a 'If'" icon="🚪">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen muchas alternativas a 'if' que añaden matices específicos al significado condicional.
        </p>

        <GrammarTable
          caption="Conectores Condicionales Alternativos"
          headers={["Conector", "Significado", "Ejemplo", "Registro"]}
          rows={[
            ["unless", "if not / excepto si", "Unless it rains, we'll go out", "Neutral"],
            ["provided (that)", "con la condición de que", "I'll help, provided you pay me", "Formal"],
            ["as long as", "mientras que / con tal de que", "You can stay as long as you're quiet", "Informal"],
            ["supposing", "suponiendo que", "Supposing he doesn't come, what then?", "Neutral"],
            ["on condition that", "con la condición de que", "I'll agree on condition that you sign", "Formal"],
            ["in case", "por si acaso", "Take an umbrella in case it rains", "Neutral"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="No iré a menos que me invites."
            english="I won't go unless you invite me."
            translation="'Unless' = 'if not' (si no me invitas)"
          />
          
          <Example 
            spanish="Puedes quedarte con tal de que ayudes."
            english="You can stay as long as you help out."
            translation="'As long as' expresa condición con matiz de duración"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> 'Unless' ya significa 'if not', así que no uses negación doble: 
          "Unless you don't study" ❌ → "Unless you study" ✅
        </Tip>
      </TheorySection>

      <TheorySection title="Condicionales Implícitos" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A veces expresamos condiciones sin usar estructuras condicionales explícitas.
        </p>

        <Rule 
          title="Formas de expresar condiciones implícitas"
          description="Estructuras que implican condición sin 'if':"
          examples={[
            "Otherwise / Or else: 'Hurry up, otherwise you'll be late'",
            "But for: 'But for your help, I would have failed'",
            "With/Without: 'With more practice, you'd improve'",
            "Gerundios: 'Studying harder, you would pass'",
            "Participios: 'Given more time, I could finish'"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Sin tu ayuda, habría fracasado."
            english="But for your help, I would have failed."
            translation="'But for' = 'If it weren't for' (si no fuera por)"
          />
          
          <Example 
            spanish="Con más tiempo, podría terminarlo."
            english="Given more time, I could finish it."
            translation="Participio que implica condición"
          />
        </div>
      </TheorySection>

      <TheorySection title="Condicionales en Contexto Académico" icon="🎓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En escritura académica, los condicionales expresan hipótesis, posibilidades y argumentos complejos.
        </p>

        <GrammarTable
          caption="Funciones Académicas de Condicionales"
          headers={["Función", "Estructura", "Ejemplo Académico"]}
          rows={[
            ["Hipótesis", "If + were to", "If we were to increase funding, research would improve"],
            ["Especulación", "Should + happen to", "Should the experiment fail, we would need new data"],
            ["Contraste", "If... whereas if", "If theory A is correct, then X. Whereas if theory B applies, then Y"],
            ["Recomendación", "If I were you", "If I were the researcher, I would replicate the study"],
            ["Consecuencia", "Unless... will", "Unless we address this issue, the problem will persist"]
          ]}
        />

        <Tip type="success">
          <strong>Escritura académica:</strong> Usa condicionales para explorar diferentes escenarios, 
          presentar hipótesis y discutir implicaciones teóricas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes Avanzados" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "If I would have known..." ❌<br/>
            <strong>Correcto:</strong> "If I had known..." o "Had I known..." ✅<br/>
            <em>No uses 'would' en la cláusula condicional</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Unless you won't come..." ❌<br/>
            <strong>Correcto:</strong> "Unless you come..." ✅<br/>
            <em>'Unless' ya implica negación</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mezclar tiempos incorrectamente en condicionales mixtos ❌<br/>
            <strong>Correcto:</strong> Asegurar lógica temporal clara ✅<br/>
            <em>La relación tiempo debe tener sentido</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar inversión en contexto informal ❌<br/>
            <strong>Correcto:</strong> Reservar inversión para escritura formal ✅<br/>
            <em>Conoce el registro apropiado</em>
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____ I been born in a different era, I would be living differently now.'"
      options={[
        "If",
        "Had",
        "Were",
        "Should"
      ]}
      correctAnswer={1}
      explanation="'Had I been born' es la inversión formal de 'If I had been born' en condicionales mixtos."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which sentence correctly expresses a mixed conditional (past cause, present effect)?"
      options={[
        "If I studied harder, I would have passed the exam.",
        "If I had studied harder, I would pass all my exams now.",
        "If I had studied harder, I would have passed the exam.",
        "If I study harder, I will pass the exam."
      ]}
      correctAnswer={1}
      explanation="Esta estructura combina una causa pasada (had studied) con un efecto presente (would pass now)."
    />,

    <MultipleChoiceExercise
      key="3"
      question="What is the formal inversion equivalent of 'If you should have any questions'?"
      options={[
        "Should you have any questions",
        "Would you have any questions", 
        "Had you any questions",
        "Were you to have questions"
      ]}
      correctAnswer={0}
      explanation="'Should you have' es la inversión formal correcta de 'If you should have'."
    />,

    <TrueFalseExercise
      key="4"
      statements={[
        {
          text: "'Unless' means the same as 'if not'.",
          isTrue: true,
          explanation: "Correcto. 'Unless' es equivalente a 'if not'."
        },
        {
          text: "Mixed conditionals can combine different time periods.",
          isTrue: true,
          explanation: "Correcto. Los condicionales mixtos relacionan diferentes tiempos."
        },
        {
          text: "Inversion in conditionals is commonly used in informal speech.",
          isTrue: false,
          explanation: "Falso. La inversión es una estructura formal, no informal."
        },
        {
          text: "'But for' can be used to express implicit conditions.",
          isTrue: true,
          explanation: "Correcto. 'But for' expresa condiciones implícitas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="5"
      question="Complete: 'I'll lend you the money _____ you promise to pay me back next week.'"
      options={[
        "unless",
        "provided that",
        "in case",
        "supposing"
      ]}
      correctAnswer={1}
      explanation="'Provided that' expresa una condición específica que debe cumplirse."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: '_____ it not for the rain, we would go to the beach.'"
      options={[
        "If",
        "Were",
        "Had",
        "Should"
      ]}
      correctAnswer={1}
      explanation="'Were it not for' es la inversión formal de 'If it were not for'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which expresses a present cause with a past effect?"
      options={[
        "If I were more careful, I wouldn't have broken it.",
        "If I had been more careful, I wouldn't break things.",
        "If I am more careful, I won't break it.",
        "If I were more careful, I wouldn't break it."
      ]}
      correctAnswer={0}
      explanation="Presente (were more careful) → Pasado (wouldn't have broken) es un condicional mixto."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: '_____ the circumstances been different, the outcome would have changed.'"
      options={[
        "If",
        "Had",
        "Were",
        "Should"
      ]}
      correctAnswer={1}
      explanation="'Had the circumstances been different' es inversión formal de 'If the circumstances had been different'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: 'I'd rather you _____ told me earlier.'"
      options={[
        "have",
        "had",
        "would have",
        "will have"
      ]}
      correctAnswer={1}
      explanation="'I'd rather you had told me' expresa preferencia sobre algo que no ocurrió en el pasado."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which sentence uses 'unless' correctly?"
      options={[
        "Unless you won't study, you'll fail.",
        "Unless you don't study, you'll pass.",
        "Unless you study, you'll fail.",
        "Unless you will study, you'll fail."
      ]}
      correctAnswer={2}
      explanation="'Unless' ya implica negación, así que no necesitas 'don't' o 'won't'."
    />
  ];

  return (
    <TheoryLayout
      title="Advanced Conditionals"
      description="Domina las estructuras condicionales avanzadas: condicionales mixtos, inversión, alternativas a 'if' y condicionales implícitos para expresar ideas complejas."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Condicionales básicos", "Tiempos verbales avanzados", "Subjuntivo"]}
      estimatedTime="60 min"
    />
  );
};

export default AdvancedConditionalsPage;

