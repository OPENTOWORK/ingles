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

const SpeakingConnectorsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Speaking Connectors?" icon="🗣️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>speaking connectors</strong> (conectores para hablar) son palabras y frases que te ayudan a conectar 
          ideas, organizar tu discurso y hacer que tu habla sea más fluida y coherente en inglés.
        </p>
        
        <QuickReference items={[
          "Conectores para organizar ideas: first, second, finally",
          "Conectores para agregar información: also, besides, furthermore",
          "Conectores para contrastar: but, however, on the other hand",
          "Conectores para dar ejemplos: for example, such as, like",
          "Conectores para expresar opinión: I think, in my opinion, personally"
        ]} />
      </TheorySection>

      <TheorySection title="Conectores para Organizar Ideas" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos conectores te ayudan a estructurar tu discurso y hacer que sea fácil de seguir.
        </p>

        <GrammarTable
          caption="Conectores de Organización"
          headers={["Función", "Conectores", "Uso", "Ejemplo"]}
          rows={[
            ["Inicio", "First, To begin with, Firstly", "Empezar una lista o argumento", "First, I think technology is important"],
            ["Continuación", "Second, Then, Next, Also", "Agregar puntos adicionales", "Second, it helps communication"],
            ["Final", "Finally, Lastly, To conclude", "Terminar una lista o argumento", "Finally, it makes life easier"],
            ["Secuencia", "First... second... third", "Lista ordenada", "First, we need money. Second, we need time"],
            ["Transición", "Now, So, Well", "Cambiar de tema o idea", "Now, let's talk about education"],
            ["Resumen", "In summary, To sum up", "Resumir ideas principales", "In summary, technology is beneficial"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Inicio: 'Primero, creo que la tecnología es importante'"
            english="Beginning: 'First, I think technology is important'"
            translation="Inicio: 'Primero, creo que la tecnología es importante'"
          />
          <Example 
            spanish="Continuación: 'Segundo, ayuda con la comunicación'"
            english="Continuation: 'Second, it helps with communication'"
            translation="Continuación: 'Segundo, ayuda con la comunicación'"
          />
          <Example 
            spanish="Final: 'Finalmente, hace la vida más fácil'"
            english="End: 'Finally, it makes life easier'"
            translation="Final: 'Finalmente, hace la vida más fácil'"
          />
        </div>

        <Rule 
          title="Uso de Conectores de Organización"
          description="Para usar efectivamente:"
          examples={[
            "Usa conectores apropiados para cada función",
            "Mantén la consistencia en tu discurso",
            "No uses demasiados conectores seguidos",
            "Varía los conectores para evitar repetición"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los conectores de organización hacen que tu discurso sea más profesional y fácil de seguir.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores para Agregar Información" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos conectores te permiten agregar información adicional y desarrollar tus ideas.
        </p>

        <GrammarTable
          caption="Conectores de Adición"
          headers={["Conector", "Nivel de Formalidad", "Uso", "Ejemplo"]}
          rows={[
            ["And", "Informal", "Agregar información simple", "I like music and movies"],
            ["Also", "Neutral", "Agregar información adicional", "I like music. Also, I enjoy movies"],
            ["Besides", "Neutral", "Agregar punto adicional", "Besides music, I like movies"],
            ["Furthermore", "Formal", "Agregar información importante", "Music is enjoyable. Furthermore, it's educational"],
            ["Moreover", "Formal", "Agregar punto significativo", "It's fun. Moreover, it's good for health"],
            ["In addition", "Formal", "Agregar información complementaria", "It's fun. In addition, it's educational"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Neutral: 'Me gusta la música. También, disfruto las películas'"
            english="Neutral: 'I like music. Also, I enjoy movies'"
            translation="Neutral: 'Me gusta la música. También, disfruto las películas'"
          />
          <Example 
            spanish="Formal: 'Es divertido. Además, es educativo'"
            english="Formal: 'It's fun. Furthermore, it's educational'"
            translation="Formal: 'Es divertido. Además, es educativo'"
          />
          <Example 
            spanish="Informal: 'Me gusta la música y las películas'"
            english="Informal: 'I like music and movies'"
            translation="Informal: 'Me gusta la música y las películas'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Varía los conectores según el nivel de formalidad de tu discurso.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores para Contrastar" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos conectores te permiten mostrar diferencias, oposiciones o contrastes entre ideas.
        </p>

        <GrammarTable
          caption="Conectores de Contraste"
          headers={["Conector", "Nivel de Formalidad", "Uso", "Ejemplo"]}
          rows={[
            ["But", "Informal", "Contraste simple", "I like music, but I don't like jazz"],
            ["However", "Formal", "Contraste fuerte", "I like music. However, I don't like jazz"],
            ["On the other hand", "Formal", "Mostrar alternativa", "Music is fun. On the other hand, it can be expensive"],
            ["Although", "Neutral", "Contraste con concesión", "Although I like music, I don't play any instruments"],
            ["Despite", "Formal", "Contraste con obstáculo", "Despite the cost, I still buy music"],
            ["Yet", "Neutral", "Contraste inesperado", "It's expensive, yet I still buy it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Informal: 'Me gusta la música, pero no me gusta el jazz'"
            english="Informal: 'I like music, but I don't like jazz'"
            translation="Informal: 'Me gusta la música, pero no me gusta el jazz'"
          />
          <Example 
            spanish="Formal: 'Me gusta la música. Sin embargo, no me gusta el jazz'"
            english="Formal: 'I like music. However, I don't like jazz'"
            translation="Formal: 'Me gusta la música. Sin embargo, no me gusta el jazz'"
          />
          <Example 
            spanish="Neutral: 'Aunque me gusta la música, no toco instrumentos'"
            english="Neutral: 'Although I like music, I don't play instruments'"
            translation="Neutral: 'Aunque me gusta la música, no toco instrumentos'"
          />
        </div>

        <Rule 
          title="Uso de Conectores de Contraste"
          description="Para contrastar efectivamente:"
          examples={[
            "Usa conectores apropiados para el nivel de formalidad",
            "Asegúrate de que el contraste sea claro",
            "No uses demasiados conectores de contraste seguidos",
            "Varía los conectores para evitar repetición"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No uses 'but' y 'however' juntos - son redundantes.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores para Dar Ejemplos" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos conectores te ayudan a ilustrar tus ideas con ejemplos específicos.
        </p>

        <GrammarTable
          caption="Conectores de Ejemplo"
          headers={["Conector", "Uso", "Posición", "Ejemplo"]}
          rows={[
            ["For example", "Dar ejemplo específico", "Inicio de oración", "I like many genres. For example, I enjoy rock"],
            ["For instance", "Dar ejemplo específico", "Inicio de oración", "Music is diverse. For instance, there's jazz"],
            ["Such as", "Listar ejemplos", "Medio de oración", "I like genres such as rock and jazz"],
            ["Like", "Dar ejemplo informal", "Medio de oración", "I like genres like rock and jazz"],
            ["Namely", "Especificar exactamente", "Inicio de oración", "I like two genres, namely rock and jazz"],
            ["Including", "Incluir en lista", "Medio de oración", "I like many genres, including rock and jazz"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Específico: 'Me gustan muchos géneros. Por ejemplo, disfruto el rock'"
            english="Specific: 'I like many genres. For example, I enjoy rock'"
            translation="Específico: 'Me gustan muchos géneros. Por ejemplo, disfruto el rock'"
          />
          <Example 
            spanish="Lista: 'Me gustan géneros como rock y jazz'"
            english="List: 'I like genres such as rock and jazz'"
            translation="Lista: 'Me gustan géneros como rock y jazz'"
          />
          <Example 
            spanish="Específico: 'Me gustan dos géneros, específicamente rock y jazz'"
            english="Specific: 'I like two genres, namely rock and jazz'"
            translation="Específico: 'Me gustan dos géneros, específicamente rock y jazz'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Los ejemplos hacen que tu discurso sea más convincente y fácil de entender.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores para Expresar Opinión" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos conectores te permiten expresar tu opinión de manera clara y apropiada.
        </p>

        <GrammarTable
          caption="Conectores de Opinión"
          headers={["Conector", "Nivel de Certeza", "Uso", "Ejemplo"]}
          rows={[
            ["I think", "Moderado", "Opinión personal", "I think music is important"],
            ["In my opinion", "Moderado", "Opinión personal formal", "In my opinion, music is important"],
            ["Personally", "Personal", "Opinión muy personal", "Personally, I love music"],
            ["I believe", "Firme", "Creencia fuerte", "I believe music is essential"],
            ["I feel", "Emocional", "Sentimiento personal", "I feel music connects people"],
            ["From my perspective", "Formal", "Punto de vista personal", "From my perspective, music is valuable"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Moderado: 'Creo que la música es importante'"
            english="Moderate: 'I think music is important'"
            translation="Moderado: 'Creo que la música es importante'"
          />
          <Example 
            spanish="Firme: 'Creo que la música es esencial'"
            english="Strong: 'I believe music is essential'"
            translation="Firme: 'Creo que la música es esencial'"
          />
          <Example 
            spanish="Emocional: 'Siento que la música conecta a las personas'"
            english="Emotional: 'I feel music connects people'"
            translation="Emocional: 'Siento que la música conecta a las personas'"
          />
        </div>

        <Rule 
          title="Uso de Conectores de Opinión"
          description="Para expresar opinión efectivamente:"
          examples={[
            "Elige conectores apropiados para tu nivel de certeza",
            "Varía los conectores para evitar repetición",
            "Usa conectores formales en contextos profesionales",
            "Sé consistente con el nivel de formalidad"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los conectores de opinión hacen que tu discurso sea más personal y convincente.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores para Causa y Resultado" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos conectores te permiten explicar relaciones de causa y efecto.
        </p>

        <GrammarTable
          caption="Conectores de Causa y Resultado"
          headers={["Tipo", "Conectores", "Uso", "Ejemplo"]}
          rows={[
            ["Causa", "Because, Since, As", "Explicar razón", "I like music because it's relaxing"],
            ["Resultado", "So, Therefore, Thus", "Mostrar consecuencia", "Music is relaxing, so I listen daily"],
            ["Causa Formal", "Due to, Owing to", "Explicar causa formal", "Due to its benefits, I listen to music"],
            ["Resultado Formal", "Consequently, As a result", "Mostrar resultado formal", "It's relaxing. Consequently, I listen daily"],
            ["Causa Informal", "Because of", "Explicar causa informal", "Because of its benefits, I listen to music"],
            ["Resultado Informal", "So, That's why", "Mostrar resultado informal", "It's relaxing, so I listen daily"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Causa: 'Me gusta la música porque es relajante'"
            english="Cause: 'I like music because it's relaxing'"
            translation="Causa: 'Me gusta la música porque es relajante'"
          />
          <Example 
            spanish="Resultado: 'Es relajante, así que escucho diariamente'"
            english="Result: 'It's relaxing, so I listen daily'"
            translation="Resultado: 'Es relajante, así que escucho diariamente'"
          />
          <Example 
            spanish="Causa formal: 'Debido a sus beneficios, escucho música'"
            english="Formal cause: 'Due to its benefits, I listen to music'"
            translation="Causa formal: 'Debido a sus beneficios, escucho música'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Los conectores de causa y resultado hacen que tu discurso sea más lógico y convincente.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar demasiados conectores seguidos ❌<br/>
            <strong>Correcto:</strong> Usar conectores de manera equilibrada ✅<br/>
            <em>Demasiados conectores hacen el discurso artificial</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mezclar niveles de formalidad ❌<br/>
            <strong>Correcto:</strong> Mantener consistencia en el registro ✅<br/>
            <em>La consistencia mejora la claridad</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar conectores incorrectos para la función ❌<br/>
            <strong>Correcto:</strong> Elegir conectores apropiados ✅<br/>
            <em>Cada conector tiene una función específica</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No variar los conectores ❌<br/>
            <strong>Correcto:</strong> Usar diferentes conectores ✅<br/>
            <em>La variedad hace el discurso más interesante</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Función específica"
            description="Cada conector tiene una función específica."
            examples={[
              "Conectores de organización: estructurar ideas",
              "Conectores de adición: agregar información",
              "Conectores de contraste: mostrar diferencias",
              "Conectores de ejemplo: ilustrar ideas"
            ]}
          />

          <Rule 
            title="2. Nivel de formalidad"
            description="Elige conectores apropiados para el contexto."
            examples={[
              "Informal: and, but, so",
              "Neutral: also, however, therefore",
              "Formal: furthermore, nevertheless, consequently",
              "Mantén consistencia en todo el discurso"
            ]}
          />

          <Rule 
            title="3. Variedad y equilibrio"
            description="Usa diferentes conectores de manera equilibrada."
            examples={[
              "No uses el mismo conector repetidamente",
              "Varía los conectores según la función",
              "No uses demasiados conectores seguidos",
              "Balancea conectores con pausas naturales"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Para organizar ideas uso conectores como ___ (first/but) y ___ (second/however). Para agregar información uso ___ (also/although) y ___ (furthermore/yet). Para contrastar uso ___ (but/also) y ___ (however/first)."
      blanks={[
        { answer: "first" },
        { answer: "second" },
        { answer: "also" },
        { answer: "furthermore" },
        { answer: "but" },
        { answer: "however" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el conector más apropiado para empezar una lista de ideas?"
      options={[
        "But",
        "First",
        "However",
        "Also"
      ]}
      correctAnswer={1}
      explanation="'First' es el conector más apropiado para empezar una lista de ideas, mientras que los otros tienen funciones diferentes."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Es importante mantener consistencia en el nivel de formalidad de los conectores.",
          isTrue: true,
          explanation: "Correcto. Mantener consistencia en el nivel de formalidad mejora la claridad y profesionalismo del discurso."
        },
        {
          text: "Puedo usar 'but' y 'however' juntos en la misma oración.",
          isTrue: false,
          explanation: "Incorrecto. 'But' y 'however' son redundantes - usa solo uno para evitar repetición."
        },
        {
          text: "Los conectores de ejemplo como 'for example' y 'such as' tienen usos diferentes.",
          isTrue: true,
          explanation: "Correcto. 'For example' va al inicio de oración, 'such as' va en medio de oración."
        },
        {
          text: "Es mejor usar siempre el mismo conector para evitar confusión.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor variar los conectores para hacer el discurso más interesante y evitar repetición."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la diferencia entre 'I think' e 'I believe'?"
      options={[
        "No hay diferencia",
        "'I think' es más firme que 'I believe'",
        "'I believe' es más firme que 'I think'",
        "Uno es formal y otro informal"
      ]}
      correctAnswer={2}
      explanation="'I believe' expresa una creencia más firme y segura, mientras que 'I think' es más moderado."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es el error en esta oración: 'But however, I disagree'?"
      options={[
        "Falta un conector",
        "Usa dos conectores de contraste juntos",
        "El conector está mal posicionado",
        "Falta puntuación"
      ]}
      correctAnswer={1}
      explanation="El error es usar 'But' y 'However' juntos, ambos son conectores de contraste. Debe ser solo uno: 'But I disagree' o 'However, I disagree'."
    />
  ];

  return (
    <TheoryLayout
      title="Speaking Connectors"
      description="Domina los conectores para hablar en inglés: organización, adición, contraste, ejemplos y opinión. Aprende a hacer tu discurso más fluido y coherente."
      level="A2-B1-B2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic speaking skills", "Understanding of sentence structure"]}
      estimatedTime="70 min"
    />
  );
};

export default SpeakingConnectorsPage;



