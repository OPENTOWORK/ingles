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

const ActiveListeningStrategiesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Active Listening Strategies?" icon="🎧">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>active listening strategies</strong> (estrategias de escucha activa) son técnicas específicas que 
          te permiten participar activamente en el proceso de comprensión auditiva, mejorando significativamente tu capacidad de entender.
        </p>
        
        <QuickReference items={[
          "Técnicas para participar activamente en el listening",
          "Estrategias de predicción y anticipación",
          "Métodos de verificación y confirmación",
          "Técnicas de inferencia y deducción",
          "Estrategias de gestión de atención y concentración"
        ]} />
      </TheorySection>

      <TheorySection title="Diferencias entre Escucha Pasiva y Activa" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Entender la diferencia entre escucha pasiva y activa es fundamental para mejorar tu comprensión auditiva.
        </p>

        <GrammarTable
          caption="Escucha Pasiva vs Activa"
          headers={["Aspecto", "Escucha Pasiva", "Escucha Activa", "Resultado"]}
          rows={[
            ["Participación", "Recibe información", "Participa en el proceso", "Mayor comprensión"],
            ["Atención", "Atención limitada", "Atención total", "Mejor retención"],
            ["Predicción", "No anticipa", "Predice contenido", "Mejor preparación"],
            ["Verificación", "No verifica", "Verifica comprensión", "Mayor precisión"],
            ["Inferencia", "Comprensión literal", "Inferencia activa", "Comprensión profunda"],
            ["Gestión", "Sin estrategias", "Usa estrategias", "Control del proceso"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Escucha pasiva: 'Solo escucha sin participar'"
            english="Passive listening: 'Just listens without participating'"
            translation="Escucha pasiva: 'Solo escucha sin participar'"
          />
          <Example 
            spanish="Escucha activa: 'Predice, verifica, infiere'"
            english="Active listening: 'Predicts, verifies, infers'"
            translation="Escucha activa: 'Predice, verifica, infiere'"
          />
          <Example 
            spanish="Resultado: 'Mayor comprensión y retención'"
            english="Result: 'Better comprehension and retention'"
            translation="Resultado: 'Mayor comprensión y retención'"
          />
        </div>

        <Rule 
          title="Características de la Escucha Activa"
          description="La escucha activa incluye:"
          examples={[
            "Predicción del contenido",
            "Verificación continua de comprensión",
            "Inferencia de significado",
            "Gestión de la atención",
            "Uso de estrategias específicas"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> La escucha activa transforma el listening de un proceso pasivo a uno activo y controlado.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Predicción" icon="🔮">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La predicción te prepara mentalmente para lo que vas a escuchar y mejora tu comprensión.
        </p>

        <GrammarTable
          caption="Estrategias de Predicción"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Ejemplo"]}
          rows={[
            ["Predicción por Preguntas", "Predecir basado en preguntas", "Antes del audio", "Pregunta sobre precio → buscar números"],
            ["Predicción por Contexto", "Predecir basado en situación", "Antes del audio", "Aeropuerto → buscar horarios, puertas"],
            ["Predicción por Título", "Predecir basado en título", "Antes del audio", "Título sobre tecnología → buscar términos técnicos"],
            ["Predicción por Imágenes", "Predecir basado en imágenes", "Antes del audio", "Imagen de restaurante → buscar comida, precios"],
            ["Predicción por Vocabulario", "Predecir basado en palabras clave", "Durante el audio", "Escuchar 'beneficios' → buscar ventajas"],
            ["Predicción por Estructura", "Predecir basado en estructura", "Durante el audio", "Escuchar 'primero' → buscar lista"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Predicción por preguntas: 'Pregunta sobre precio → buscar números'"
            english="Prediction by questions: 'Question about price → look for numbers'"
            translation="Predicción por preguntas: 'Pregunta sobre precio → buscar números'"
          />
          <Example 
            spanish="Predicción por contexto: 'Aeropuerto → buscar horarios, puertas'"
            english="Prediction by context: 'Airport → look for times, gates'"
            translation="Predicción por contexto: 'Aeropuerto → buscar horarios, puertas'"
          />
          <Example 
            spanish="Predicción por vocabulario: 'Escuchar beneficios → buscar ventajas'"
            english="Prediction by vocabulary: 'Hear benefits → look for advantages'"
            translation="Predicción por vocabulario: 'Escuchar beneficios → buscar ventajas'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> La predicción prepara tu mente para procesar información específica.                                                 
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Verificación" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La verificación continua te ayuda a confirmar tu comprensión y corregir malentendidos.
        </p>

        <GrammarTable
          caption="Estrategias de Verificación"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Verificación Inmediata", "Confirmar comprensión inmediatamente", "Durante el audio", "Corregir errores temprano"],
            ["Verificación Cruzada", "Comparar con información previa", "Durante el audio", "Consistencia de comprensión"],
            ["Verificación por Contexto", "Usar contexto para confirmar", "Durante el audio", "Validar interpretación"],
            ["Verificación por Coherencia", "Verificar lógica interna", "Durante el audio", "Detectar inconsistencias"],
            ["Verificación por Preguntas", "Confirmar con preguntas específicas", "Después del audio", "Validar respuestas"],
            ["Verificación por Predicción", "Comparar con predicciones", "Después del audio", "Evaluar precisión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Verificación inmediata: 'Confirmar comprensión durante el audio'"
            english="Immediate verification: 'Confirm understanding during audio'"
            translation="Verificación inmediata: 'Confirmar comprensión durante el audio'"
          />
          <Example 
            spanish="Verificación cruzada: 'Comparar con información previa'"
            english="Cross-verification: 'Compare with previous information'"
            translation="Verificación cruzada: 'Comparar con información previa'"
          />
          <Example 
            spanish="Verificación por contexto: 'Usar contexto para confirmar'"
            english="Context verification: 'Use context to confirm'"
            translation="Verificación por contexto: 'Usar contexto para confirmar'"
          />
        </div>

        <Rule 
          title="Consejos para Verificación"
          description="Para verificar efectivamente:"
          examples={[
            "Verifica continuamente durante el audio",
            "Usa múltiples fuentes de verificación",
            "No dudes en revisar tu comprensión",
            "Corrige errores tan pronto como los detectes"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> La verificación excesiva puede distraerte - encuentra el equilibrio.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Inferencia" icon="🧠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La inferencia te permite entender información implícita y llenar vacíos en tu comprensión.
        </p>

        <GrammarTable
          caption="Estrategias de Inferencia"
          headers={["Tipo", "Descripción", "Ejemplo", "Cuándo Usar"]}
          rows={[
            ["Inferencia Contextual", "Inferir basado en contexto", "Hospital → surgery probablemente cirugía", "Palabras desconocidas"],
            ["Inferencia Lógica", "Inferir basado en lógica", "Lluvia → cancelación de evento", "Información implícita"],
            ["Inferencia Cultural", "Inferir basado en cultura", "Thanksgiving → turkey", "Referencias culturales"],
            ["Inferencia Temporal", "Inferir basado en tiempo", "Mañana → evento futuro", "Relaciones temporales"],
            ["Inferencia Causal", "Inferir causa y efecto", "Accidente → tráfico", "Relaciones causales"],
            ["Inferencia Emocional", "Inferir emociones", "Tono triste → malas noticias", "Información emocional"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Inferencia contextual: 'Hospital → surgery probablemente cirugía'"
            english="Contextual inference: 'Hospital → surgery probably surgery'"
            translation="Inferencia contextual: 'Hospital → surgery probablemente cirugía'"
          />
          <Example 
            spanish="Inferencia lógica: 'Lluvia → cancelación de evento'"
            english="Logical inference: 'Rain → event cancellation'"
            translation="Inferencia lógica: 'Lluvia → cancelación de evento'"
          />
          <Example 
            spanish="Inferencia cultural: 'Thanksgiving → turkey'"
            english="Cultural inference: 'Thanksgiving → turkey'"
            translation="Inferencia cultural: 'Thanksgiving → turkey'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> La inferencia te permite entender más de lo que se dice explícitamente.
        </Tip>
      </TheorySection>

      <TheorySection title="Gestión de Atención y Concentración" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Gestionar tu atención y concentración es crucial para mantener la escucha activa.
        </p>

        <GrammarTable
          caption="Estrategias de Gestión de Atención"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Enfoque Selectivo", "Enfocarse en información relevante", "Durante todo el audio", "Evitar distracciones"],
            ["Gestión de Fatiga", "Manejar cansancio mental", "Audios largos", "Mantener rendimiento"],
            ["Recuperación de Atención", "Recuperar atención perdida", "Cuando te distraes", "No perder información"],
            ["Anticipación de Distracciones", "Prepararse para distracciones", "Antes del audio", "Minimizar interrupciones"],
            ["Técnicas de Relajación", "Mantener calma y concentración", "Antes del audio", "Reducir ansiedad"],
            ["Gestión de Tiempo", "Usar tiempo efectivamente", "Durante el audio", "Maximizar eficiencia"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Enfoque selectivo: 'Enfocarse en información relevante'"
            english="Selective focus: 'Focus on relevant information'"
            translation="Enfoque selectivo: 'Enfocarse en información relevante'"
          />
          <Example 
            spanish="Gestión de fatiga: 'Manejar cansancio mental'"
            english="Fatigue management: 'Manage mental tiredness'"
            translation="Gestión de fatiga: 'Manejar cansancio mental'"
          />
          <Example 
            spanish="Recuperación: 'Recuperar atención perdida'"
            english="Recovery: 'Recover lost attention'"
            translation="Recuperación: 'Recuperar atención perdida'"
          />
        </div>

        <Rule 
          title="Consejos para Gestión de Atención"
          description="Para gestionar tu atención:"
          examples={[
            "Identifica y minimiza distracciones",
            "Usa técnicas de respiración para relajarte",
            "Toma descansos mentales cuando sea posible",
            "Mantén una actitud positiva y confiada"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La gestión de atención es una habilidad que se puede desarrollar con la práctica.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Procesamiento" icon="⚙️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El procesamiento activo de información mejora significativamente tu comprensión.
        </p>

        <GrammarTable
          caption="Estrategias de Procesamiento"
          headers={["Estrategia", "Descripción", "Ejemplo", "Beneficio"]}
          rows={[
            ["Procesamiento Paralelo", "Procesar múltiples elementos", "Escuchar + tomar notas + inferir", "Eficiencia máxima"],
            ["Procesamiento Secuencial", "Procesar paso a paso", "Escuchar → entender → recordar", "Comprensión profunda"],
            ["Procesamiento por Chunks", "Procesar en grupos", "Agrupar información relacionada", "Mejor organización"],
            ["Procesamiento por Prioridad", "Priorizar información", "Información clave primero", "Enfoque en lo importante"],
            ["Procesamiento por Patrones", "Reconocer patrones", "Identificar estructuras comunes", "Anticipación"],
            ["Procesamiento por Conexiones", "Conectar información", "Relacionar ideas", "Comprensión integral"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Procesamiento paralelo: 'Escuchar + tomar notas + inferir'"
            english="Parallel processing: 'Listen + take notes + infer'"
            translation="Procesamiento paralelo: 'Escuchar + tomar notas + inferir'"
          />
          <Example 
            spanish="Procesamiento por chunks: 'Agrupar información relacionada'"
            english="Chunk processing: 'Group related information'"
            translation="Procesamiento por chunks: 'Agrupar información relacionada'"
          />
          <Example 
            spanish="Procesamiento por prioridad: 'Información clave primero'"
            english="Priority processing: 'Key information first'"
            translation="Procesamiento por prioridad: 'Información clave primero'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> El procesamiento activo transforma la información auditiva en comprensión significativa.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Escuchar pasivamente sin participar ❌<br/>
            <strong>Correcto:</strong> Participar activamente en el proceso ✅<br/>
            <em>La escucha activa mejora significativamente la comprensión</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No predecir contenido ❌<br/>
            <strong>Correcto:</strong> Predecir basado en contexto ✅<br/>
            <em>La predicción prepara tu mente para procesar información</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No verificar comprensión ❌<br/>
            <strong>Correcto:</strong> Verificar continuamente ✅<br/>
            <em>La verificación asegura precisión en la comprensión</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No inferir información implícita ❌<br/>
            <strong>Correcto:</strong> Usar inferencia para entender más ✅<br/>
            <em>La inferencia te permite entender información no explícita</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Participación activa"
            description="Participa activamente en el proceso de listening."
            examples={[
              "Predice contenido antes de escuchar",
              "Verifica comprensión continuamente",
              "Infiere información implícita",
              "Gestiona tu atención y concentración"
            ]}
          />

          <Rule 
            title="2. Uso de múltiples estrategias"
            description="Combina diferentes estrategias para máxima efectividad."
            examples={[
              "Predicción + verificación + inferencia",
              "Gestión de atención + procesamiento activo",
              "Estrategias específicas por tipo de listening",
              "Adaptación según el contexto"
            ]}
          />

          <Rule 
            title="3. Práctica regular"
            description="Practica las estrategias regularmente para desarrollarlas."
            examples={[
              "Practica con diferentes tipos de audio",
              "Desarrolla habilidades gradualmente",
              "Reflexiona sobre tu progreso",
              "Ajusta estrategias según necesidades"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="La escucha ___ (activa/pasiva) mejora la comprensión. La ___ (predicción/verificación) prepara la mente. La ___ (inferencia/escucha) permite entender información implícita."
      blanks={[
        { answer: "activa" },
        { answer: "predicción" },
        { answer: "inferencia" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la diferencia principal entre escucha pasiva y activa?"
      options={[
        "La velocidad de escucha",
        "La participación en el proceso",
        "El volumen del audio",
        "La duración del audio"
      ]}
      correctAnswer={1}
      explanation="La diferencia principal es la participación en el proceso. La escucha activa involucra predicción, verificación e inferencia, mientras que la pasiva solo recibe información."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "La predicción prepara la mente para procesar información específica.",
          isTrue: true,
          explanation: "Correcto. La predicción basada en preguntas, contexto o vocabulario prepara tu mente para buscar y procesar información específica."
        },
        {
          text: "La verificación continua puede distraer de la comprensión.",
          isTrue: false,
          explanation: "Incorrecto. La verificación continua mejora la comprensión al permitir corregir errores y confirmar interpretaciones."
        },
        {
          text: "La inferencia permite entender información no explícita.",
          isTrue: true,
          explanation: "Correcto. La inferencia contextual, lógica y cultural te permite entender información implícita y llenar vacíos en la comprensión."
        },
        {
          text: "La gestión de atención no es importante para la escucha activa.",
          isTrue: false,
          explanation: "Incorrecto. La gestión de atención es crucial para mantener la escucha activa y evitar distracciones."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es el beneficio principal de la inferencia en listening?"
      options={[
        "Mejorar la pronunciación",
        "Entender información implícita",
        "Aumentar la velocidad de escucha",
        "Reducir el vocabulario necesario"
      ]}
      correctAnswer={1}
      explanation="El beneficio principal de la inferencia es entender información implícita que no se dice explícitamente, mejorando la comprensión profunda."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estrategia es más importante para mantener la concentración en audios largos?"
      options={[
        "Escuchar más rápido",
        "Gestión de atención y concentración",
        "Tomar más notas",
        "Ignorar las distracciones"
      ]}
      correctAnswer={1}
      explanation="La gestión de atención y concentración es más importante, ya que incluye técnicas para manejar fatiga, recuperar atención perdida y mantener el enfoque."
    />
  ];

  return (
    <TheoryLayout
      title="Active Listening Strategies"
      description="Domina las estrategias de escucha activa en inglés. Aprende técnicas de predicción, verificación, inferencia y gestión de atención para mejorar tu comprensión auditiva."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Understanding of listening process"]}
      estimatedTime="80 min"
    />
  );
};

export default ActiveListeningStrategiesPage;

