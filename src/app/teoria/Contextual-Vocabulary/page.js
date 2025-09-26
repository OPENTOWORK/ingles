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

const ContextualVocabularyPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Contextual Vocabulary?" icon="📚">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>contextual vocabulary</strong> (vocabulario contextual) se refiere a palabras y expresiones que adquieren 
          significado específico según el contexto en el que se usan. Es fundamental para la comprensión auditiva efectiva.
        </p>
        
        <QuickReference items={[
          "Palabras que cambian significado según contexto",
          "Expresiones idiomáticas y coloquiales",
          "Vocabulario específico por tema o situación",
          "Palabras con múltiples significados",
          "Importante para comprensión auditiva real"
        ]} />
      </TheorySection>

      <TheorySection title="Tipos de Vocabulario Contextual" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El vocabulario contextual puede clasificarse en diferentes tipos según cómo se comporta en diferentes contextos.
        </p>

        <GrammarTable
          caption="Tipos de Vocabulario Contextual"
          headers={["Tipo", "Descripción", "Ejemplo", "Significado"]}
          rows={[
            ["Polisemia", "Palabras con múltiples significados", "bank (banco/river bank)", "Depende del contexto"],
            ["Idiomas", "Expresiones con significado fijo", "break the ice", "Significado no literal"],
            ["Coloquialismos", "Expresiones informales", "hang out", "Usar en contexto informal"],
            ["Técnico", "Vocabulario específico por área", "CPU (informática)", "Específico del campo"],
            ["Situacional", "Palabras específicas por situación", "boarding pass (aeropuerto)", "Específico del contexto"],
            ["Cultural", "Expresiones culturalmente específicas", "the big apple (Nueva York)", "Referencia cultural"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Polisemia: 'bank' puede ser banco (institución) o orilla (río)"
            english="Polysemy: 'bank' can be bank (institution) or river bank"
            translation="Polisemia: 'bank' puede ser banco (institución) o orilla (río)"
          />
          <Example 
            spanish="Idioma: 'break the ice' significa romper el hielo (social)"
            english="Idiom: 'break the ice' means to start a conversation"
            translation="Idioma: 'break the ice' significa romper el hielo (social)"
          />
          <Example 
            spanish="Técnico: 'CPU' en contexto de computadoras"
            english="Technical: 'CPU' in computer context"
            translation="Técnico: 'CPU' en contexto de computadoras"
          />
        </div>

        <Rule 
          title="Importancia del Vocabulario Contextual"
          description="Por qué es crucial para listening:"
          examples={[
            "Permite entender el significado real en contexto",
            "Ayuda a distinguir entre diferentes significados",
            "Mejora la comprensión de expresiones idiomáticas",
            "Facilita la comprensión de vocabulario técnico"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El vocabulario contextual es la diferencia entre comprensión literal y comprensión real.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Vocabulario Contextual" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen estrategias específicas para manejar el vocabulario contextual en listening.
        </p>

        <GrammarTable
          caption="Estrategias para Vocabulario Contextual"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Ejemplo"]}
          rows={[
            ["Inferencia Contextual", "Usar contexto para inferir significado", "Palabras desconocidas", "Contexto: hospital → 'surgery' probablemente cirugía"],
            ["Claves Semánticas", "Usar palabras relacionadas", "Vocabulario técnico", "Palabras relacionadas indican significado"],
            ["Claves Gramaticales", "Usar estructura gramatical", "Palabras ambiguas", "Posición en oración indica función"],
            ["Claves Culturales", "Usar conocimiento cultural", "Expresiones culturales", "Conocimiento cultural ayuda comprensión"],
            ["Claves Situacionales", "Usar contexto de la situación", "Vocabulario situacional", "Situación determina significado"],
            ["Claves Fonéticas", "Usar pronunciación y acento", "Palabras homófonas", "Acento y pronunciación distinguen significados"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Inferencia: 'En hospital, escucho surgery → probablemente cirugía'"
            english="Inference: 'In hospital, I hear surgery → probably surgery'"
            translation="Inferencia: 'En hospital, escucho surgery → probablemente cirugía'"
          />
          <Example 
            spanish="Claves semánticas: 'computer, software, hardware → tecnología'"
            english="Semantic clues: 'computer, software, hardware → technology'"
            translation="Claves semánticas: 'computer, software, hardware → tecnología'"
          />
          <Example 
            spanish="Claves gramaticales: 'the bank' vs 'to bank' → diferente función"
            english="Grammatical clues: 'the bank' vs 'to bank' → different function"
            translation="Claves gramaticales: 'the bank' vs 'to bank' → diferente función"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Combina múltiples estrategias para inferir significado de manera más precisa.                                        
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulario por Contexto Específico" icon="🏢">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes contextos tienen vocabulario específico que debes reconocer.
        </p>

        <GrammarTable
          caption="Vocabulario por Contexto"
          headers={["Contexto", "Vocabulario Específico", "Significado", "Ejemplo de Uso"]}
          rows={[
            ["Hospital", "surgery, diagnosis, treatment", "Cirugía, diagnóstico, tratamiento", "The surgery was successful"],
            ["Aeropuerto", "boarding pass, gate, departure", "Tarjeta de embarque, puerta, salida", "Gate 15 for departure"],
            ["Restaurante", "appetizer, entrée, dessert", "Entrada, plato principal, postre", "I'll have the entrée"],
            ["Oficina", "deadline, meeting, presentation", "Fecha límite, reunión, presentación", "The deadline is Friday"],
            ["Escuela", "assignment, exam, grade", "Tarea, examen, nota", "The exam is tomorrow"],
            ["Tienda", "sale, discount, receipt", "Venta, descuento, recibo", "There's a 20% discount"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Hospital: 'The surgery was successful' (cirugía exitosa)"
            english="Hospital: 'The surgery was successful' (successful surgery)"
            translation="Hospital: 'The surgery was successful' (cirugía exitosa)"
          />
          <Example 
            spanish="Aeropuerto: 'Gate 15 for departure' (puerta 15 para salida)"
            english="Airport: 'Gate 15 for departure' (gate 15 for departure)"
            translation="Aeropuerto: 'Gate 15 for departure' (puerta 15 para salida)"
          />
          <Example 
            spanish="Oficina: 'The deadline is Friday' (la fecha límite es viernes)"
            english="Office: 'The deadline is Friday' (deadline is Friday)"
            translation="Oficina: 'The deadline is Friday' (la fecha límite es viernes)"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Familiarízate con el vocabulario específico de contextos comunes para mejorar tu comprensión.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones Idiomáticas Comunes" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las expresiones idiomáticas son una parte importante del vocabulario contextual.
        </p>

        <GrammarTable
          caption="Expresiones Idiomáticas Comunes"
          headers={["Expresión", "Significado Literal", "Significado Real", "Ejemplo"]}
          rows={[
            ["Break the ice", "Romper el hielo", "Iniciar conversación", "Let's break the ice with introductions"],
            ["Hit the nail on the head", "Golpear el clavo en la cabeza", "Dar en el clavo", "You hit the nail on the head"],
            ["Spill the beans", "Derramar los frijoles", "Revelar secreto", "Don't spill the beans about the surprise"],
            ["Piece of cake", "Pedazo de pastel", "Muy fácil", "This test is a piece of cake"],
            ["Break a leg", "Romper una pierna", "Buena suerte", "Break a leg in your presentation"],
            ["Cost an arm and a leg", "Costar un brazo y una pierna", "Muy caro", "This car costs an arm and a leg"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Break the ice: 'Vamos a romper el hielo con presentaciones'"
            english="Break the ice: 'Let's break the ice with introductions'"
            translation="Break the ice: 'Vamos a romper el hielo con presentaciones'"
          />
          <Example 
            spanish="Piece of cake: 'Este examen es muy fácil'"
            english="Piece of cake: 'This test is a piece of cake'"
            translation="Piece of cake: 'Este examen es muy fácil'"
          />
          <Example 
            spanish="Break a leg: 'Buena suerte en tu presentación'"
            english="Break a leg: 'Break a leg in your presentation'"
            translation="Break a leg: 'Buena suerte en tu presentación'"
          />
        </div>

        <Rule 
          title="Consejos para Expresiones Idiomáticas"
          description="Para entender expresiones idiomáticas:"
          examples={[
            "No tomes el significado literal",
            "Usa el contexto para inferir el significado",
            "Aprende expresiones comunes por contexto",
            "Practica con ejemplos reales"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Las expresiones idiomáticas no se pueden traducir literalmente.
        </Tip>
      </TheorySection>

      <TheorySection title="Palabras con Múltiples Significados" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Muchas palabras en inglés tienen múltiples significados que dependen del contexto.
        </p>

        <GrammarTable
          caption="Palabras con Múltiples Significados"
          headers={["Palabra", "Significado 1", "Significado 2", "Contexto"]}
          rows={[
            ["Bank", "Banco (institución)", "Orilla (río)", "Financial vs geographical"],
            ["Bat", "Murciélago", "Bate (deportes)", "Animal vs sports equipment"],
            ["Bear", "Oso", "Soportar/tener", "Animal vs verb"],
            ["Fair", "Justo", "Feria", "Justice vs event"],
            ["Light", "Luz", "Ligero", "Illumination vs weight"],
            ["Right", "Correcto", "Derecha", "Correct vs direction"],
            ["Spring", "Primavera", "Resorte", "Season vs mechanical"],
            ["Wave", "Ola", "Saludar", "Water vs gesture"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Bank: 'I go to the bank' (institución) vs 'The river bank' (orilla)"
            english="Bank: 'I go to the bank' (institution) vs 'The river bank' (shore)"
            translation="Bank: 'Voy al banco' (institución) vs 'La orilla del río' (orilla)"
          />
          <Example 
            spanish="Bear: 'I saw a bear' (oso) vs 'I can't bear it' (soportar)"
            english="Bear: 'I saw a bear' (animal) vs 'I can't bear it' (tolerate)"
            translation="Bear: 'Vi un oso' (oso) vs 'No puedo soportarlo' (soportar)"
          />
          <Example 
            spanish="Light: 'Turn on the light' (luz) vs 'This bag is light' (ligero)"
            english="Light: 'Turn on the light' (illumination) vs 'This bag is light' (not heavy)"
            translation="Light: 'Enciende la luz' (luz) vs 'Esta bolsa es ligera' (ligero)"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> El contexto gramatical y semántico te ayuda a distinguir entre diferentes significados.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Inferencia" icon="🧠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La inferencia es la habilidad clave para entender vocabulario contextual.
        </p>

        <GrammarTable
          caption="Estrategias de Inferencia"
          headers={["Estrategia", "Descripción", "Ejemplo", "Cuándo Usar"]}
          rows={[
            ["Contexto Inmediato", "Usar palabras circundantes", "The doctor performed surgery", "Palabras relacionadas"],
            ["Contexto Amplio", "Usar tema general", "Hospital conversation → medical terms", "Tema conocido"],
            ["Claves Gramaticales", "Usar función gramatical", "The bank vs to bank", "Función diferente"],
            ["Conocimiento Previo", "Usar conocimiento existente", "Computer context → technical terms", "Área familiar"],
            ["Claves Fonéticas", "Usar pronunciación", "read (present) vs read (past)", "Tiempo verbal"],
            ["Claves Culturales", "Usar conocimiento cultural", "Thanksgiving → turkey", "Referencia cultural"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Contexto inmediato: 'El doctor realizó cirugía' → surgery = cirugía"
            english="Immediate context: 'The doctor performed surgery' → surgery = surgery"
            translation="Contexto inmediato: 'El doctor realizó cirugía' → surgery = cirugía"
          />
          <Example 
            spanish="Contexto amplio: 'Conversación de hospital' → términos médicos"
            english="Broad context: 'Hospital conversation' → medical terms"
            translation="Contexto amplio: 'Conversación de hospital' → términos médicos"
          />
          <Example 
            spanish="Claves gramaticales: 'the bank' (sustantivo) vs 'to bank' (verbo)"
            english="Grammatical clues: 'the bank' (noun) vs 'to bank' (verb)"
            translation="Claves gramaticales: 'the bank' (sustantivo) vs 'to bank' (verbo)"
          />
        </div>

        <Rule 
          title="Proceso de Inferencia"
          description="Sigue este proceso para inferir significado:"
          examples={[
            "1. Identifica la palabra desconocida",
            "2. Observa el contexto inmediato",
            "3. Considera el contexto amplio",
            "4. Usa claves gramaticales",
            "5. Aplica conocimiento previo",
            "6. Haz una inferencia educada"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La inferencia mejora con la práctica - no te preocupes si no siempre aciertas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Tomar significado literal de expresiones idiomáticas ❌<br/>
            <strong>Correcto:</strong> Usar contexto para entender significado real ✅<br/>
            <em>Las expresiones idiomáticas tienen significado no literal</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Asumir un solo significado para palabras ❌<br/>
            <strong>Correcto:</strong> Considerar múltiples significados según contexto ✅<br/>
            <em>Muchas palabras tienen múltiples significados</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignorar el contexto al inferir significado ❌<br/>
            <strong>Correcto:</strong> Usar contexto como guía principal ✅<br/>
            <em>El contexto es la clave para entender vocabulario</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No practicar inferencia ❌<br/>
            <strong>Correcto:</strong> Practicar inferencia regularmente ✅<br/>
            <em>La inferencia mejora con la práctica</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Contexto es clave"
            description="El contexto determina el significado del vocabulario."
            examples={[
              "Usa contexto inmediato y amplio",
              "Considera el tema de la conversación",
              "Observa la función gramatical",
              "Aplica conocimiento previo"
            ]}
          />

          <Rule 
            title="2. Inferencia es habilidad"
            description="La inferencia se desarrolla con la práctica."
            examples={[
              "Practica con diferentes contextos",
              "No te preocupes por errores",
              "Combina múltiples estrategias",
              "Confía en tu conocimiento previo"
            ]}
          />

          <Rule 
            title="3. Vocabulario es dinámico"
            description="El vocabulario cambia según el contexto."
            examples={[
              "Una palabra puede tener múltiples significados",
              "Las expresiones idiomáticas son comunes",
              "El vocabulario técnico es específico",
              "La cultura influye en el significado"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="El vocabulario contextual cambia significado según ___ (contexto/pronunciación). Las expresiones ___ (idiomáticas/literales) tienen significado no literal. La ___ (inferencia/traducción) es clave para entender vocabulario contextual."
      blanks={[
        { answer: "contexto" },
        { answer: "idiomáticas" },
        { answer: "inferencia" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué es más importante para entender vocabulario contextual?"
      options={[
        "La pronunciación",
        "El contexto",
        "La ortografía",
        "La longitud de la palabra"
      ]}
      correctAnswer={1}
      explanation="El contexto es lo más importante para entender vocabulario contextual, ya que determina el significado de palabras con múltiples significados y expresiones idiomáticas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Las expresiones idiomáticas se pueden traducir literalmente.",
          isTrue: false,
          explanation: "Incorrecto. Las expresiones idiomáticas tienen significado no literal y no se pueden traducir palabra por palabra."
        },
        {
          text: "Muchas palabras en inglés tienen múltiples significados.",
          isTrue: true,
          explanation: "Correcto. Muchas palabras como 'bank', 'bear', 'light' tienen múltiples significados que dependen del contexto."
        },
        {
          text: "La inferencia es una habilidad que se puede desarrollar con la práctica.",
          isTrue: true,
          explanation: "Correcto. La inferencia de significado a partir del contexto es una habilidad que mejora con la práctica y experiencia."
        },
        {
          text: "El vocabulario técnico es igual en todos los contextos.",
          isTrue: false,
          explanation: "Incorrecto. El vocabulario técnico es específico de cada área o contexto, como medicina, tecnología, deportes, etc."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor estrategia para entender la palabra 'bank' en contexto?"
      options={[
        "Siempre significa institución financiera",
        "Usar el contexto para determinar el significado",
        "Siempre significa orilla de río",
        "Ignorar el contexto"
      ]}
      correctAnswer={1}
      explanation="Usar el contexto es la mejor estrategia, ya que 'bank' puede significar institución financiera o orilla de río dependiendo del contexto."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué significa 'break the ice' en contexto social?"
      options={[
        "Romper hielo literalmente",
        "Iniciar una conversación",
        "Hacer frío",
        "Golpear algo"
      ]}
      correctAnswer={1}
      explanation="'Break the ice' en contexto social significa iniciar una conversación o hacer que las personas se sientan más cómodas, no tiene significado literal."
    />
  ];

  return (
    <TheoryLayout
      title="Contextual Vocabulary"
      description="Domina el vocabulario contextual en inglés. Aprende a inferir significado a partir del contexto, entender expresiones idiomáticas y manejar palabras con múltiples significados."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of context"]}
      estimatedTime="70 min"
    />
  );
};

export default ContextualVocabularyPage;

