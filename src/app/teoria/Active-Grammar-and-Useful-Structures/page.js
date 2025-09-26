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

const ActiveGrammarAndUsefulStructuresPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Active Grammar and Useful Structures?" icon="⚡">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Active Grammar and Useful Structures</strong> (gramática activa y estructuras útiles) se refiere a 
          patrones gramaticales y estructuras que se usan activamente en el habla para expresar ideas de manera fluida y natural.
        </p>
        
        <QuickReference items={[
          "Estructuras gramaticales para uso activo en conversación",
          "Patrones que permiten expresar ideas complejas",
          "Estructuras para diferentes funciones comunicativas",
          "Gramática práctica para hablar con fluidez",
          "Herramientas para comunicación efectiva y natural"
        ]} />
      </TheorySection>

      <TheorySection title="Estructuras para Expresar Opiniones" icon="💭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te permiten expresar opiniones de manera clara y convincente en conversaciones.
        </p>

        <GrammarTable
          caption="Estructuras para Expresar Opiniones"
          headers={["Estructura", "Uso", "Nivel de Certeza", "Ejemplo"]}
          rows={[
            ["I think that...", "Opinión personal", "Moderado", "I think that technology is beneficial"],
            ["In my opinion...", "Opinión personal formal", "Moderado", "In my opinion, education is important"],
            ["I believe that...", "Creencia fuerte", "Firme", "I believe that we should act now"],
            ["I feel that...", "Sentimiento personal", "Emocional", "I feel that this is wrong"],
            ["It seems to me that...", "Opinión cautelosa", "Inseguro", "It seems to me that this might work"],
            ["I would argue that...", "Argumento", "Persuasivo", "I would argue that we need change"],
            ["From my perspective...", "Punto de vista personal", "Formal", "From my perspective, this is beneficial"],
            ["I'm convinced that...", "Convicción fuerte", "Muy firme", "I'm convinced that this is the right approach"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Moderado: 'Creo que la tecnología es beneficiosa'"
            english="Moderate: 'I think that technology is beneficial'"
            translation="Moderado: 'Creo que la tecnología es beneficiosa'"
          />
          <Example 
            spanish="Firme: 'Creo que debemos actuar ahora'"
            english="Strong: 'I believe that we should act now'"
            translation="Firme: 'Creo que debemos actuar ahora'"
          />
          <Example 
            spanish="Persuasivo: 'Yo argumentaría que necesitamos cambio'"
            english="Persuasive: 'I would argue that we need change'"
            translation="Persuasivo: 'Yo argumentaría que necesitamos cambio'"
          />
        </div>

        <Rule 
          title="Uso de Estructuras de Opinión"
          description="Para usar efectivamente:"
          examples={[
            "Elige estructuras apropiadas para tu nivel de certeza",
            "Varía las estructuras para evitar repetición",
            "Considera el contexto y nivel de formalidad",
            "Usa estructuras que reflejen tu verdadero sentimiento"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Las estructuras de opinión te permiten expresar tu perspectiva de manera clara y convincente.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Dar Ejemplos" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te ayudan a ilustrar tus ideas con ejemplos específicos y convincentes.
        </p>

        <GrammarTable
          caption="Estructuras para Dar Ejemplos"
          headers={["Estructura", "Uso", "Posición", "Ejemplo"]}
          rows={[
            ["For example...", "Ejemplo específico", "Inicio de oración", "For example, smartphones have changed communication"],
            ["For instance...", "Ejemplo específico", "Inicio de oración", "For instance, social media connects people"],
            ["Such as...", "Lista de ejemplos", "Medio de oración", "Technology such as AI and robotics is advancing"],
            ["Like...", "Ejemplo informal", "Medio de oración", "Apps like WhatsApp are very popular"],
            ["Take... for example", "Ejemplo específico", "Inicio de oración", "Take smartphones for example"],
            ["A good example is...", "Ejemplo destacado", "Inicio de oración", "A good example is the internet"],
            ["Consider...", "Ejemplo para reflexión", "Inicio de oración", "Consider how email changed communication"],
            ["Let's say...", "Ejemplo hipotético", "Inicio de oración", "Let's say you want to learn a language"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Específico: 'Por ejemplo, los smartphones han cambiado la comunicación'"
            english="Specific: 'For example, smartphones have changed communication'"
            translation="Específico: 'Por ejemplo, los smartphones han cambiado la comunicación'"
          />
          <Example 
            spanish="Lista: 'Tecnología como IA y robótica está avanzando'"
            english="List: 'Technology such as AI and robotics is advancing'"
            translation="Lista: 'Tecnología como IA y robótica está avanzando'"
          />
          <Example 
            spanish="Destacado: 'Un buen ejemplo es internet'"
            english="Highlighted: 'A good example is the internet'"
            translation="Destacado: 'Un buen ejemplo es internet'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Los ejemplos hacen que tus argumentos sean más convincentes y fáciles de entender.                                   
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Comparar y Contrastar" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te permiten hacer comparaciones y contrastes efectivos en tus conversaciones.
        </p>

        <GrammarTable
          caption="Estructuras para Comparar y Contrastar"
          headers={["Estructura", "Uso", "Función", "Ejemplo"]}
          rows={[
            ["Similarly...", "Mostrar similitud", "Comparación", "Similarly, both methods are effective"],
            ["In contrast...", "Mostrar diferencia", "Contraste", "In contrast, this approach is different"],
            ["On the other hand...", "Mostrar alternativa", "Contraste", "On the other hand, we could try this"],
            ["Unlike...", "Mostrar diferencia", "Contraste", "Unlike the previous method, this is faster"],
            ["Whereas...", "Mostrar contraste", "Contraste formal", "Whereas A is expensive, B is cheap"],
            ["Compared to...", "Hacer comparación", "Comparación", "Compared to last year, sales are higher"],
            ["In comparison with...", "Comparación formal", "Comparación", "In comparison with other options, this is better"],
            ["Both... and...", "Mostrar similitud", "Similitud", "Both methods are effective"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Similitud: 'Similarmente, ambos métodos son efectivos'"
            english="Similarity: 'Similarly, both methods are effective'"
            translation="Similitud: 'Similarmente, ambos métodos son efectivos'"
          />
          <Example 
            spanish="Contraste: 'En contraste, este enfoque es diferente'"
            english="Contrast: 'In contrast, this approach is different'"
            translation="Contraste: 'En contraste, este enfoque es diferente'"
          />
          <Example 
            spanish="Comparación: 'Comparado con el año pasado, las ventas son mayores'"
            english="Comparison: 'Compared to last year, sales are higher'"
            translation="Comparación: 'Comparado con el año pasado, las ventas son mayores'"
          />
        </div>

        <Rule 
          title="Uso de Estructuras de Comparación"
          description="Para usar efectivamente:"
          examples={[
            "Usa estructuras apropiadas para el tipo de comparación",
            "Asegúrate de que la comparación sea clara",
            "Varía las estructuras para evitar repetición",
            "Considera el nivel de formalidad del contexto"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Asegúrate de que las comparaciones sean relevantes y claras para tu audiencia.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Causa y Efecto" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te permiten explicar relaciones de causa y efecto de manera clara y lógica.
        </p>

        <GrammarTable
          caption="Estructuras para Causa y Efecto"
          headers={["Estructura", "Uso", "Función", "Ejemplo"]}
          rows={[
            ["Because...", "Explicar causa", "Causa directa", "Because technology is advancing, life is easier"],
            ["Since...", "Explicar causa", "Causa formal", "Since we have the internet, communication is faster"],
            ["As a result...", "Mostrar resultado", "Efecto", "Technology advanced. As a result, productivity increased"],
            ["Therefore...", "Mostrar consecuencia", "Efecto formal", "We need change. Therefore, we must act"],
            ["Due to...", "Explicar causa formal", "Causa formal", "Due to technology, work is more efficient"],
            ["Owing to...", "Explicar causa formal", "Causa muy formal", "Owing to advances, we can do more"],
            ["Consequently...", "Mostrar consecuencia", "Efecto formal", "Technology improved. Consequently, life is better"],
            ["This is why...", "Explicar razón", "Explicación", "Technology is important. This is why we invest in it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Causa directa: 'Porque la tecnología avanza, la vida es más fácil'"
            english="Direct cause: 'Because technology is advancing, life is easier'"
            translation="Causa directa: 'Porque la tecnología avanza, la vida es más fácil'"
          />
          <Example 
            spanish="Efecto: 'La tecnología avanzó. Como resultado, la productividad aumentó'"
            english="Effect: 'Technology advanced. As a result, productivity increased'"
            translation="Efecto: 'La tecnología avanzó. Como resultado, la productividad aumentó'"
          />
          <Example 
            spanish="Causa formal: 'Debido a la tecnología, el trabajo es más eficiente'"
            english="Formal cause: 'Due to technology, work is more efficient'"
            translation="Causa formal: 'Debido a la tecnología, el trabajo es más eficiente'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Las estructuras de causa y efecto hacen que tus argumentos sean más lógicos y convincentes.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras Condicionales Avanzadas" icon="🔀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras condicionales te permiten expresar hipótesis y condiciones de manera sofisticada.
        </p>

        <GrammarTable
          caption="Estructuras Condicionales Avanzadas"
          headers={["Estructura", "Uso", "Condición", "Ejemplo"]}
          rows={[
            ["If... then...", "Condición general", "Cualquier condición", "If we work hard, then we will succeed"],
            ["Provided that...", "Condición específica", "Condición formal", "Provided that we have resources, we can proceed"],
            ["As long as...", "Condición de duración", "Condición continua", "As long as we work together, we can achieve our goals"],
            ["Unless...", "Condición negativa", "A menos que", "Unless we act now, we will lose the opportunity"],
            ["In case...", "Preparación para posibilidad", "Precaución", "In case of problems, we have a backup plan"],
            ["Suppose...", "Hipótesis", "Situación hipotética", "Suppose we had more time, what would we do?"],
            ["Imagine if...", "Hipótesis creativa", "Imaginación", "Imagine if we could solve this problem easily"],
            ["What if...", "Pregunta hipotética", "Exploración", "What if we tried a different approach?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Condición general: 'Si trabajamos duro, entonces tendremos éxito'"
            english="General condition: 'If we work hard, then we will succeed'"
            translation="Condición general: 'Si trabajamos duro, entonces tendremos éxito'"
          />
          <Example 
            spanish="Condición específica: 'Siempre que tengamos recursos, podemos proceder'"
            english="Specific condition: 'Provided that we have resources, we can proceed'"
            translation="Condición específica: 'Siempre que tengamos recursos, podemos proceder'"
          />
          <Example 
            spanish="Condición negativa: 'A menos que actuemos ahora, perderemos la oportunidad'"
            english="Negative condition: 'Unless we act now, we will lose the opportunity'"
            translation="Condición negativa: 'A menos que actuemos ahora, perderemos la oportunidad'"
          />
        </div>

        <Rule 
          title="Uso de Estructuras Condicionales"
          description="Para usar efectivamente:"
          examples={[
            "Elige estructuras apropiadas para el tipo de condición",
            "Considera el nivel de formalidad del contexto",
            "Usa estructuras que reflejen la probabilidad de la condición",
            "Varía las estructuras para evitar repetición"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las estructuras condicionales te permiten explorar posibilidades y hipótesis de manera sofisticada.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Concluir" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te ayudan a concluir tus argumentos de manera efectiva y convincente.
        </p>

        <GrammarTable
          caption="Estructuras para Concluir"
          headers={["Estructura", "Uso", "Función", "Ejemplo"]}
          rows={[
            ["In conclusion...", "Conclusión formal", "Cierre formal", "In conclusion, technology is beneficial"],
            ["To sum up...", "Resumen", "Síntesis", "To sum up, we need to act now"],
            ["All in all...", "Conclusión general", "Evaluación general", "All in all, this is a good solution"],
            ["Overall...", "Evaluación general", "Perspectiva general", "Overall, the results are positive"],
            ["In summary...", "Resumen formal", "Síntesis formal", "In summary, we have three main points"],
            ["To conclude...", "Conclusión formal", "Cierre formal", "To conclude, we must take action"],
            ["Finally...", "Punto final", "Último punto", "Finally, I want to emphasize the importance"],
            ["In the end...", "Conclusión final", "Resultado final", "In the end, what matters is the result"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Conclusión formal: 'En conclusión, la tecnología es beneficiosa'"
            english="Formal conclusion: 'In conclusion, technology is beneficial'"
            translation="Conclusión formal: 'En conclusión, la tecnología es beneficiosa'"
          />
          <Example 
            spanish="Resumen: 'Para resumir, necesitamos actuar ahora'"
            english="Summary: 'To sum up, we need to act now'"
            translation="Resumen: 'Para resumir, necesitamos actuar ahora'"
          />
          <Example 
            spanish="Evaluación general: 'En general, los resultados son positivos'"
            english="General evaluation: 'Overall, the results are positive'"
            translation="Evaluación general: 'En general, los resultados son positivos'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Las conclusiones fuertes refuerzan tu argumento y dejan una impresión duradera.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar siempre las mismas estructuras ❌<br/>
            <strong>Correcto:</strong> Variar las estructuras para evitar repetición ✅<br/>
            <em>La variedad hace que tu habla sea más interesante y natural</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar estructuras formales en contextos informales ❌<br/>
            <strong>Correcto:</strong> Adaptar estructuras al contexto ✅<br/>
            <em>El contexto determina el nivel de formalidad apropiado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No considerar el nivel de certeza ❌<br/>
            <strong>Correcto:</strong> Elegir estructuras apropiadas para tu nivel de certeza ✅<br/>
            <em>Tu nivel de certeza debe reflejarse en la estructura que elijas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No practicar las estructuras ❌<br/>
            <strong>Correcto:</strong> Practicar estructuras en contextos reales ✅<br/>
            <em>La práctica desarrolla fluidez y naturalidad</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Variedad y flexibilidad"
            description="Desarrolla variedad en el uso de estructuras."
            examples={[
              "Aprende diferentes formas de expresar la misma idea",
              "Practica diferentes niveles de formalidad",
              "Desarrolla estructuras para diferentes funciones",
              "Usa variedad para evitar repetición"
            ]}
          />

          <Rule 
            title="2. Contexto apropiado"
            description="Adapta las estructuras al contexto."
            examples={[
              "Considera el nivel de formalidad del contexto",
              "Adapta según la relación con la persona",
              "Usa estructuras apropiadas para la situación",
              "Observa cómo otros usan estructuras en el contexto"
            ]}
          />

          <Rule 
            title="3. Práctica activa"
            description="Practica las estructuras activamente."
            examples={[
              "Usa estructuras en conversaciones reales",
              "Practica en diferentes contextos",
              "Recibe feedback sobre tu uso",
              "Ajusta según el contexto y retroalimentación"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Las estructuras ___ (activas/pasivas) se usan para hablar con fluidez. La ___ (variedad/repetición) en estructuras hace el habla más natural. El ___ (contexto/nivel) determina qué estructuras usar."
      blanks={[
        { answer: "activas" },
        { answer: "variedad" },
        { answer: "contexto" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el beneficio principal de usar estructuras gramaticales activas?"
      options={[
        "Mejorar la pronunciación",
        "Hablar con fluidez y naturalidad",
        "Aumentar la velocidad de habla",
        "Reducir el vocabulario necesario"
      ]}
      correctAnswer={1}
      explanation="El beneficio principal es hablar con fluidez y naturalidad, ya que las estructuras activas te permiten expresar ideas complejas de manera efectiva."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Es importante variar las estructuras para evitar repetición.",
          isTrue: true,
          explanation: "Correcto. La variedad en estructuras hace que tu habla sea más interesante y natural, evitando la repetición monótona."
        },
        {
          text: "Las estructuras formales son apropiadas en todos los contextos.",
          isTrue: false,
          explanation: "Incorrecto. Debes adaptar las estructuras al contexto. Las estructuras formales no son apropiadas en contextos informales."
        },
        {
          text: "La práctica activa desarrolla fluidez en el uso de estructuras.",
          isTrue: true,
          explanation: "Correcto. La práctica activa en contextos reales es la mejor manera de desarrollar fluidez y naturalidad en el uso de estructuras."
        },
        {
          text: "El contexto no influye en la elección de estructuras.",
          isTrue: false,
          explanation: "Incorrecto. El contexto determina qué estructuras usar. Diferentes contextos requieren diferentes niveles de formalidad."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor estructura para expresar una opinión con certeza moderada?"
      options={[
        "I'm absolutely sure that...",
        "I think that...",
        "I have no idea...",
        "It might be..."
      ]}
      correctAnswer={1}
      explanation="'I think that...' expresa una opinión con certeza moderada, mientras que las otras expresan certeza absoluta, incertidumbre total o posibilidad."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estructura es más apropiada para una conclusión formal?"
      options={[
        "All in all...",
        "In conclusion...",
        "Finally...",
        "What if..."
      ]}
      correctAnswer={1}
      explanation="'In conclusion...' es la estructura más apropiada para una conclusión formal, mientras que las otras son más informales o para otros propósitos."
    />
  ];

  return (
    <TheoryLayout
      title="Active Grammar and Useful Structures"
      description="Domina la gramática activa y estructuras útiles en inglés. Aprende patrones gramaticales para expresar opiniones, dar ejemplos, comparar, explicar causa-efecto y concluir efectivamente."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar knowledge", "Understanding of sentence structures"]}
      estimatedTime="80 min"
    />
  );
};

export default ActiveGrammarAndUsefulStructuresPage;

