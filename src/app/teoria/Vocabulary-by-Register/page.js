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

const VocabularyByRegisterPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Vocabulary by Register?" icon="📚">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>vocabulary by register</strong> (vocabulario por registro) se refiere a la elección apropiada de palabras 
          según el contexto, la audiencia y el propósito de tu escritura. Usar el registro correcto es esencial para la comunicación efectiva.
        </p>
        
        <QuickReference items={[
          "Registro Formal: académico, profesional, oficial",
          "Registro Neutral: periodístico, informativo, general",
          "Registro Informal: personal, conversacional, casual",
          "Contexto determina el registro apropiado",
          "Audiencia y propósito influyen en la elección"
        ]} />
      </TheorySection>

      <TheorySection title="Registro Formal" icon="🎩">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El registro formal se usa en contextos académicos, profesionales y oficiales. Requiere vocabulario preciso y estructuras complejas.
        </p>

        <GrammarTable
          caption="Características del Registro Formal"
          headers={["Aspecto", "Formal", "Informal", "Ejemplo Formal"]}
          rows={[
            ["Vocabulario", "Palabras complejas y precisas", "Palabras simples y coloquiales", "commence (start), utilize (use)"],
            ["Contracciones", "No se usan", "Se usan", "I will not (won't), do not (don't)"],
            ["Pronombres", "Evita 'I', 'you' directos", "Usa 'I', 'you' libremente", "One should consider (You should)"],
            ["Estructura", "Oraciones complejas", "Oraciones simples", "Despite the fact that (Although)"],
            ["Conectores", "Sin embargo, además", "Pero, también", "Nevertheless, Furthermore"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Formal: 'The investigation commenced in January'"
            english="Formal: 'The investigation commenced in January'"
            translation="Formal: 'La investigación comenzó en enero'"
          />
          <Example 
            spanish="Informal: 'The investigation started in January'"
            english="Informal: 'The investigation started in January'"
            translation="Informal: 'La investigación empezó en enero'"
          />
          <Example 
            spanish="Formal: 'One should consider all options'"
            english="Formal: 'One should consider all options'"
            translation="Formal: 'Uno debe considerar todas las opciones'"
          />
          <Example 
            spanish="Informal: 'You should consider all options'"
            english="Informal: 'You should consider all options'"
            translation="Informal: 'Deberías considerar todas las opciones'"
          />
        </div>

        <Rule 
          title="Cuándo usar Registro Formal"
          description="Usa registro formal para:"
          examples={[
            "Ensayos académicos y tesis",
            "Informes profesionales y empresariales",
            "Correspondencia oficial",
            "Presentaciones formales"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El registro formal da autoridad y credibilidad a tu escritura.
        </Tip>
      </TheorySection>

      <TheorySection title="Registro Neutral" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El registro neutral se usa en contextos informativos, periodísticos y de comunicación general. Es claro y directo.
        </p>

        <GrammarTable
          caption="Características del Registro Neutral"
          headers={["Aspecto", "Neutral", "Ejemplo", "Contexto"]}
          rows={[
            ["Vocabulario", "Palabras estándar y claras", "begin, use, help", "Noticias, informes"],
            ["Contracciones", "Ocasionalmente", "I'll, don't (en diálogos)", "Artículos informativos"],
            ["Pronombres", "Balance entre formal e informal", "We, they, it", "Documentación técnica"],
            ["Estructura", "Oraciones moderadamente complejas", "Balanced sentence length", "Informes profesionales"],
            ["Tono", "Objetivo e informativo", "Factual, clear", "Comunicación empresarial"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Neutral: 'The company will begin production next month'"
            english="Neutral: 'The company will begin production next month'"
            translation="Neutral: 'La empresa comenzará la producción el próximo mes'"
          />
          <Example 
            spanish="Neutral: 'We need to consider the implications'"
            english="Neutral: 'We need to consider the implications'"
            translation="Neutral: 'Necesitamos considerar las implicaciones'"
          />
          <Example 
            spanish="Neutral: 'The results show significant improvement'"
            english="Neutral: 'The results show significant improvement'"
            translation="Neutral: 'Los resultados muestran una mejora significativa'"
          />
        </div>

        <Rule 
          title="Cuándo usar Registro Neutral"
          description="Usa registro neutral para:"
          examples={[
            "Artículos de noticias",
            "Informes técnicos",
            "Documentación empresarial",
            "Comunicación profesional"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> El registro neutral es versátil y apropiado para la mayoría de contextos profesionales.
        </Tip>
      </TheorySection>

      <TheorySection title="Registro Informal" icon="😊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El registro informal se usa en contextos personales, conversacionales y casuales. Es relajado y amigable.
        </p>

        <GrammarTable
          caption="Características del Registro Informal"
          headers={["Aspecto", "Informal", "Formal", "Ejemplo Informal"]}
          rows={[
            ["Vocabulario", "Palabras cotidianas y coloquiales", "Palabras complejas", "start (commence), get (obtain)"],
            ["Contracciones", "Se usan frecuentemente", "No se usan", "I'm, you're, don't, can't"],
            ["Pronombres", "I, you directos y frecuentes", "Evita pronombres directos", "I think, you know"],
            ["Estructura", "Oraciones simples y cortas", "Oraciones complejas", "Short, clear sentences"],
            ["Expresiones", "Frases coloquiales", "Expresiones formales", "by the way, you know"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Informal: 'I think we should start the project'"
            english="Informal: 'I think we should start the project'"
            translation="Informal: 'Creo que deberíamos empezar el proyecto'"
          />
          <Example 
            spanish="Formal: 'It is recommended that we commence the project'"
            english="Formal: 'It is recommended that we commence the project'"
            translation="Formal: 'Se recomienda que comencemos el proyecto'"
          />
          <Example 
            spanish="Informal: 'By the way, did you get my email?'"
            english="Informal: 'By the way, did you get my email?'"
            translation="Informal: 'Por cierto, ¿recibiste mi email?'"
          />
        </div>

        <Rule 
          title="Cuándo usar Registro Informal"
          description="Usa registro informal para:"
          examples={[
            "Emails personales",
            "Mensajes de texto",
            "Blogs personales",
            "Conversaciones casuales"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> El registro informal puede no ser apropiado en contextos profesionales o académicos.
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulario por Contexto Específico" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes contextos requieren vocabulario específico y apropiado.
        </p>

        <GrammarTable
          caption="Vocabulario por Contexto"
          headers={["Contexto", "Vocabulario Apropiado", "Ejemplo", "Registro"]}
          rows={[
            ["Académico", "Análisis, investigación, metodología", "The research methodology demonstrates", "Formal"],
            ["Empresarial", "Estrategia, implementación, objetivos", "We need to implement this strategy", "Neutral-Formal"],
            ["Técnico", "Especificaciones, parámetros, protocolos", "The system parameters indicate", "Neutral"],
            ["Médico", "Diagnóstico, tratamiento, síntomas", "The patient exhibits symptoms", "Formal"],
            ["Legal", "Jurisdicción, precedente, cláusula", "According to legal precedent", "Formal"],
            ["Personal", "Sentimientos, experiencias, opiniones", "I feel that this is important", "Informal"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Académico: 'La metodología de investigación demuestra'"
            english="Academic: 'The research methodology demonstrates'"
            translation="Académico: 'La metodología de investigación demuestra'"
          />
          <Example 
            spanish="Empresarial: 'Necesitamos implementar esta estrategia'"
            english="Business: 'We need to implement this strategy'"
            translation="Empresarial: 'Necesitamos implementar esta estrategia'"
          />
          <Example 
            spanish="Personal: 'Siento que esto es importante'"
            english="Personal: 'I feel that this is important'"
            translation="Personal: 'Siento que esto es importante'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Familiarízate con el vocabulario específico de tu campo o área de interés.
        </Tip>
      </TheorySection>

      <TheorySection title="Transiciones entre Registros" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A veces necesitas cambiar de registro dentro del mismo texto para diferentes secciones o propósitos.
        </p>

        <GrammarTable
          caption="Estrategias para Cambiar de Registro"
          headers={["Transición", "De", "A", "Ejemplo"]}
          rows={[
            ["Introducción formal", "Título informal", "Cuerpo formal", "Let me explain formally..."],
            ["Conclusión personal", "Análisis formal", "Opinión informal", "Personally, I believe..."],
            ["Ejemplo casual", "Teoría formal", "Ilustración informal", "For example, imagine..."],
            ["Resumen técnico", "Explicación informal", "Síntesis formal", "In summary, the data indicates..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Transición: 'Déjame explicar formalmente...'"
            english="Transition: 'Let me explain formally...'"
            translation="Transición: 'Déjame explicar formalmente...'"
          />
          <Example 
            spanish="Transición: 'Personalmente, creo...'"
            english="Transition: 'Personally, I believe...'"
            translation="Transición: 'Personalmente, creo...'"
          />
          <Example 
            spanish="Transición: 'En resumen, los datos indican...'"
            english="Transition: 'In summary, the data indicates...'"
            translation="Transición: 'En resumen, los datos indican...'"
          />
        </div>

        <Rule 
          title="Consejos para Transiciones"
          description="Para cambiar de registro efectivamente:"
          examples={[
            "Usa frases de transición claras",
            "Mantén la coherencia general",
            "Justifica el cambio de registro",
            "Asegúrate de que el cambio sea apropiado"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Los cambios de registro deben ser intencionales y justificados, no accidentales.                                    
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar registro informal en ensayo académico ❌<br/>
            <strong>Correcto:</strong> Usar registro formal apropiado ✅<br/>
            <em>El contexto determina el registro apropiado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mezclar registros sin transición ❌<br/>
            <strong>Correcto:</strong> Cambiar de registro con transiciones claras ✅<br/>
            <em>Los cambios deben ser intencionales y justificados</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar vocabulario demasiado formal para la audiencia ❌<br/>
            <strong>Correcto:</strong> Adaptar el vocabulario a la audiencia ✅<br/>
            <em>Considera quién va a leer tu texto</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignorar el propósito del texto ❌<br/>
            <strong>Correcto:</strong> Elegir registro según el propósito ✅<br/>
            <em>El propósito determina el registro apropiado</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Contexto determina registro"
            description="Siempre considera el contexto antes de elegir vocabulario."
            examples={[
              "Académico → Formal",
              "Empresarial → Neutral-Formal",
              "Personal → Informal",
              "Técnico → Neutral"
            ]}
          />

          <Rule 
            title="2. Audiencia influye en la elección"
            description="Adapta tu vocabulario a tu audiencia."
            examples={[
              "Expertos → Vocabulario técnico",
              "General → Vocabulario accesible",
              "Académicos → Registro formal",
              "Amigos → Registro informal"
            ]}
          />

          <Rule 
            title="3. Consistencia es clave"
            description="Mantén el registro consistente a menos que haya una razón para cambiarlo."
            examples={[
              "Elige un registro principal",
              "Mantén la consistencia",
              "Cambia solo cuando sea necesario",
              "Justifica los cambios"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="En un ensayo académico, debo usar registro ___ (formal/informal). Para un email personal, puedo usar registro ___ (formal/informal). En un informe empresarial, el registro apropiado es ___ (neutral/formal)."
      blanks={[
        { answer: "formal" },
        { answer: "informal" },
        { answer: "neutral" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el registro más apropiado para un ensayo académico?"
      options={[
        "Informal con contracciones",
        "Formal sin contracciones",
        "Neutral con algunas contracciones",
        "Mixto según la sección"
      ]}
      correctAnswer={1}
      explanation="Los ensayos académicos requieren registro formal, sin contracciones, con vocabulario preciso y estructuras complejas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "El registro formal siempre es mejor que el informal.",
          isTrue: false,
          explanation: "Incorrecto. El registro apropiado depende del contexto, audiencia y propósito. No hay uno mejor que otro."
        },
        {
          text: "Las contracciones son apropiadas en registro informal.",
          isTrue: true,
          explanation: "Correcto. Las contracciones como 'don't', 'won't', 'I'm' son comunes y apropiadas en registro informal."
        },
        {
          text: "El contexto determina el registro apropiado.",
          isTrue: true,
          explanation: "Correcto. El contexto (académico, empresarial, personal) es el factor principal para elegir el registro."
        },
        {
          text: "Es mejor usar siempre el mismo registro en todo el texto.",
          isTrue: false,
          explanation: "Incorrecto. Aunque la consistencia es importante, a veces es necesario cambiar de registro con transiciones apropiadas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor manera de cambiar de registro formal a informal en un texto?"
      options={[
        "Cambiar abruptamente sin transición",
        "Usar una frase de transición clara",
        "Mezclar ambos registros en la misma oración",
        "No cambiar nunca de registro"
      ]}
      correctAnswer={1}
      explanation="Los cambios de registro deben hacerse con transiciones claras como 'Let me explain informally...' o 'Personally, I believe...'"
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué factor es más importante al elegir el registro apropiado?"
      options={[
        "Tu preferencia personal",
        "El contexto y la audiencia",
        "La longitud del texto",
        "El tema del texto"
      ]}
      correctAnswer={1}
      explanation="El contexto (donde se usa el texto) y la audiencia (quién lo va a leer) son los factores más importantes para elegir el registro apropiado."
    />
  ];

  return (
    <TheoryLayout
      title="Vocabulary by Register"
      description="Domina el vocabulario por registro en inglés: formal, neutral e informal. Aprende a elegir el vocabulario apropiado según el contexto y la audiencia."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of formal vs informal language"]}
      estimatedTime="70 min"
    />
  );
};

export default VocabularyByRegisterPage;

