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

const ShortDialoguesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Short Dialogues?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>short dialogues</strong> (diálogos cortos) son conversaciones breves entre dos o más personas que 
          aparecen frecuentemente en exámenes de listening. Son ideales para practicar comprensión auditiva básica.
        </p>
        
        <QuickReference items={[
          "Duración: 30 segundos a 2 minutos",
          "Participantes: 2-3 personas máximo",
          "Contextos: situaciones cotidianas",
          "Objetivo: información específica",
          "Nivel: A1-A2 (principiante a elemental)"
        ]} />
      </TheorySection>

      <TheorySection title="Características de los Short Dialogues" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los diálogos cortos tienen características específicas que los hacen ideales para principiantes.
        </p>

        <GrammarTable
          caption="Características de Short Dialogues"
          headers={["Característica", "Descripción", "Beneficio", "Ejemplo"]}
          rows={[
            ["Duración Corta", "30 segundos a 2 minutos", "Mantiene la atención", "Conversación rápida"],
            ["Vocabulario Simple", "Palabras comunes y cotidianas", "Fácil comprensión", "Hello, how are you?"],
            ["Estructura Clara", "Inicio, desarrollo, final", "Fácil seguimiento", "Greeting → Question → Answer"],
            ["Contexto Familiar", "Situaciones cotidianas", "Comprensión intuitiva", "Shop, restaurant, street"],
            ["Objetivo Específico", "Una información principal", "Enfoque claro", "Price, time, location"],
            ["Velocidad Moderada", "Habla clara y pausada", "Tiempo para procesar", "No demasiado rápido"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Contexto: Tienda - Cliente preguntando precio"
            english="Context: Shop - Customer asking for price"
            translation="Contexto: Tienda - Cliente preguntando precio"
          />
          <Example 
            spanish="Duración: 45 segundos"
            english="Duration: 45 seconds"
            translation="Duración: 45 segundos"
          />
          <Example 
            spanish="Objetivo: Encontrar el precio del producto"
            english="Objective: Find the product price"
            translation="Objetivo: Encontrar el precio del producto"
          />
        </div>

        <Rule 
          title="Ventajas de los Short Dialogues"
          description="Por qué son ideales para principiantes:"
          examples={[
            "No abruman con información excesiva",
            "Permiten practicar habilidades básicas",
            "Son fáciles de repetir y revisar",
            "Proporcionan éxito temprano en el aprendizaje"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los diálogos cortos son perfectos para desarrollar confianza en listening.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Short Dialogues" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los diálogos cortos cubren una variedad de situaciones cotidianas comunes.
        </p>

        <GrammarTable
          caption="Tipos Comunes de Short Dialogues"
          headers={["Tipo", "Situación", "Información Clave", "Preguntas Típicas"]}
          rows={[
            ["Shopping", "Compras en tienda", "Precio, talla, disponibilidad", "How much? What size?"],
            ["Restaurant", "Pedir comida", "Platos, precios, tiempo", "What do you recommend?"],
            ["Directions", "Pedir direcciones", "Ubicación, distancia, tiempo", "How do I get to...?"],
            ["Transport", "Información de transporte", "Horarios, precios, destinos", "What time? How much?"],
            ["Accommodation", "Hotel/hospedaje", "Disponibilidad, precios, servicios", "Do you have rooms?"],
            ["Personal Info", "Información personal", "Nombre, edad, profesión", "What's your name?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Shopping: 'How much does this shirt cost?'"
            english="Shopping: 'How much does this shirt cost?'"
            translation="Compras: '¿Cuánto cuesta esta camisa?'"
          />
          <Example 
            spanish="Restaurant: 'I'd like to order the pasta, please'"
            english="Restaurant: 'I'd like to order the pasta, please'"
            translation="Restaurante: 'Me gustaría pedir la pasta, por favor'"
          />
          <Example 
            spanish="Directions: 'Excuse me, where is the bank?'"
            english="Directions: 'Excuse me, where is the bank?'"
            translation="Direcciones: 'Disculpe, ¿dónde está el banco?'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Familiarízate con estos contextos comunes para mejorar tu comprensión.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Short Dialogues" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen estrategias específicas para maximizar tu comprensión de diálogos cortos.
        </p>

        <GrammarTable
          caption="Estrategias Efectivas"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Pre-lectura", "Leer preguntas antes del audio", "Antes del diálogo", "Saber qué buscar"],
            ["Predicción", "Predecir contenido basado en contexto", "Antes del audio", "Preparar la mente"],
            ["Escucha Activa", "Concentrarse en información clave", "Durante el audio", "Captar detalles importantes"],
            ["Toma de Notas", "Anotar información clave", "Durante el audio", "Retener información"],
            ["Verificación", "Confirmar respuestas después", "Después del audio", "Asegurar precisión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pre-lectura: 'Leer: What is the price of the shirt?'"
            english="Pre-reading: 'Read: What is the price of the shirt?'"
            translation="Pre-lectura: 'Leer: ¿Cuál es el precio de la camisa?'"
          />
          <Example 
            spanish="Predicción: 'Contexto: tienda → buscar precios'"
            english="Prediction: 'Context: shop → look for prices'"
            translation="Predicción: 'Contexto: tienda → buscar precios'"
          />
          <Example 
            spanish="Escucha activa: 'Enfocarse en números y precios'"
            english="Active listening: 'Focus on numbers and prices'"
            translation="Escucha activa: 'Enfocarse en números y precios'"
          />
        </div>

        <Rule 
          title="Proceso Paso a Paso"
          description="Sigue este proceso para diálogos cortos:"
          examples={[
            "1. Lee las preguntas rápidamente",
            "2. Predice el contenido del diálogo",
            "3. Escucha atentamente la primera vez",
            "4. Toma notas de información clave",
            "5. Escucha una segunda vez si es necesario",
            "6. Verifica tus respuestas"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No te distraigas con palabras que no conoces - enfócate en la información que necesitas.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Preguntas Comunes" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los diálogos cortos suelen tener tipos específicos de preguntas que debes reconocer.
        </p>

        <GrammarTable
          caption="Tipos de Preguntas en Short Dialogues"
          headers={["Tipo", "Pregunta Típica", "Qué Buscar", "Ejemplo"]}
          rows={[
            ["Información Específica", "What is the price?", "Números, cantidades", "€25, $50, 10 items"],
            ["Ubicación", "Where does this take place?", "Lugares, contextos", "shop, restaurant, street"],
            ["Tiempo", "What time does it start?", "Horarios, fechas", "3 PM, Monday, tomorrow"],
            ["Personas", "Who is speaking?", "Identidad, roles", "customer, waiter, teacher"],
            ["Acción", "What does the man want?", "Objetivos, acciones", "buy, order, find"],
            ["Sentimiento", "How does she feel?", "Emociones, actitudes", "happy, worried, excited"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Información específica: '¿Cuánto cuesta el libro?'"
            english="Specific information: 'How much does the book cost?'"
            translation="Información específica: '¿Cuánto cuesta el libro?'"
          />
          <Example 
            spanish="Ubicación: '¿Dónde tiene lugar esta conversación?'"
            english="Location: 'Where does this conversation take place?'"
            translation="Ubicación: '¿Dónde tiene lugar esta conversación?'"
          />
          <Example 
            spanish="Tiempo: '¿A qué hora abre la tienda?'"
            english="Time: 'What time does the shop open?'"
            translation="Tiempo: '¿A qué hora abre la tienda?'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Identifica el tipo de pregunta para saber qué información buscar.
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulario Clave por Contexto" icon="🔑">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Cada contexto tiene vocabulario específico que debes reconocer.
        </p>

        <GrammarTable
          caption="Vocabulario Clave por Contexto"
          headers={["Contexto", "Vocabulario Clave", "Números Importantes", "Frases Comunes"]}
          rows={[
            ["Shopping", "price, size, color, buy", "€, $, pounds, sizes", "How much? What size?"],
            ["Restaurant", "menu, order, food, drink", "€, $, time", "I'd like... What do you recommend?"],
            ["Transport", "ticket, time, destination", "times, prices", "What time? How much?"],
            ["Directions", "left, right, straight, turn", "distances, times", "How do I get to...?"],
            ["Hotel", "room, reservation, check-in", "room numbers, prices", "Do you have...?"],
            ["Personal", "name, age, job, country", "ages, years", "What's your...? Where are you from?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Shopping: 'price, size, color, buy'"
            english="Shopping: 'price, size, color, buy'"
            translation="Compras: 'precio, talla, color, comprar'"
          />
          <Example 
            spanish="Restaurant: 'menu, order, food, drink'"
            english="Restaurant: 'menu, order, food, drink'"
            translation="Restaurante: 'menú, pedir, comida, bebida'"
          />
          <Example 
            spanish="Transport: 'ticket, time, destination'"
            english="Transport: 'ticket, time, destination'"
            translation="Transporte: 'boleto, tiempo, destino'"
          />
        </div>

        <Rule 
          title="Consejos para Vocabulario"
          description="Para manejar el vocabulario:"
          examples={[
            "Aprende vocabulario por contexto",
            "Practica números y precios",
            "Familiarízate con frases comunes",
            "No te preocupes por palabras desconocidas",
            "Usa contexto para entender significado"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> El vocabulario contextual es más importante que palabras aisladas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> No leer las preguntas antes del audio ❌<br/>
            <strong>Correcto:</strong> Siempre leer preguntas primero ✅<br/>
            <em>Saber qué buscar mejora la comprensión</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Intentar entender cada palabra ❌<br/>
            <strong>Correcto:</strong> Enfocarse en información clave ✅<br/>
            <em>La comprensión general es más importante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No tomar notas ❌<br/>
            <strong>Correcto:</strong> Anotar información importante ✅<br/>
            <em>Las notas ayudan a recordar detalles</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Preocuparse por el acento ❌<br/>
            <strong>Correcto:</strong> Enfocarse en el mensaje ✅<br/>
            <em>El acento no afecta la comprensión del mensaje</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Preparación es clave"
            description="Siempre prepárate antes de escuchar."
            examples={[
              "Lee las preguntas cuidadosamente",
              "Predice el contenido del diálogo",
              "Identifica qué información necesitas",
              "Prepara tu mente para escuchar"
            ]}
          />

          <Rule 
            title="2. Enfoque en información clave"
            description="No te distraigas con detalles irrelevantes."
            examples={[
              "Identifica palabras clave en las preguntas",
              "Escucha números, precios, horarios",
              "Presta atención a nombres y lugares",
              "Ignora palabras que no conoces"
            ]}
          />

          <Rule 
            title="3. Usa el contexto"
            description="El contexto te ayuda a entender."
            examples={[
              "Identifica la situación del diálogo",
              "Usa vocabulario conocido para inferir",
              "Considera el propósito de la conversación",
              "Relaciona con experiencias similares"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="En short dialogues, debo ___ (leer/escribir) las preguntas antes del audio. Debo enfocarme en ___ (información clave/todas las palabras). Los diálogos cortos duran entre ___ (30 segundos/5 minutos) y ___ (2 minutos/10 minutos)."
      blanks={[
        { answer: "leer" },
        { answer: "información clave" },
        { answer: "30 segundos" },
        { answer: "2 minutos" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la mejor estrategia para short dialogues?"
      options={[
        "Escuchar sin preparación",
        "Leer las preguntas antes del audio",
        "Intentar entender cada palabra",
        "No tomar notas"
      ]}
      correctAnswer={1}
      explanation="Leer las preguntas antes del audio te ayuda a saber qué información buscar, mejorando significativamente la comprensión."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Los short dialogues duran entre 30 segundos y 2 minutos.",
          isTrue: true,
          explanation: "Correcto. Los diálogos cortos son breves, típicamente entre 30 segundos y 2 minutos."
        },
        {
          text: "Es importante entender cada palabra en un diálogo corto.",
          isTrue: false,
          explanation: "Incorrecto. Es más importante entender la información clave que entender cada palabra individual."
        },
        {
          text: "Tomar notas ayuda a recordar información importante.",
          isTrue: true,
          explanation: "Correcto. Las notas te ayudan a retener información específica como precios, horarios y nombres."
        },
        {
          text: "El contexto del diálogo no es importante para la comprensión.",
          isTrue: false,
          explanation: "Incorrecto. El contexto (tienda, restaurante, etc.) es muy importante para entender el propósito del diálogo."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué tipo de información es más común en short dialogues?"
      options={[
        "Información compleja y abstracta",
        "Información específica y concreta",
        "Información histórica",
        "Información científica"
      ]}
      correctAnswer={1}
      explanation="Los short dialogues típicamente contienen información específica y concreta como precios, horarios, ubicaciones y nombres."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es el nivel típico de short dialogues?"
      options={[
        "C1-C2 (avanzado)",
        "B1-B2 (intermedio)",
        "A1-A2 (principiante-elemental)",
        "Nativo"
      ]}
      correctAnswer={2}
      explanation="Los short dialogues están diseñados para niveles A1-A2 (principiante a elemental) con vocabulario simple y situaciones cotidianas."
    />
  ];

  return (
    <TheoryLayout
      title="Short Dialogues"
      description="Domina la comprensión de diálogos cortos en inglés. Aprende estrategias para entender conversaciones breves en situaciones cotidianas como tiendas, restaurantes y transporte."
      level="A1-A2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Basic vocabulary"]}
      estimatedTime="60 min"
    />
  );
};

export default ShortDialoguesPage;



