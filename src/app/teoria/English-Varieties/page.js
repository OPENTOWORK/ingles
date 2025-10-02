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

const EnglishVarietiesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las English Varieties?" icon="🌍">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>English varieties</strong> (variedades del inglés) son las diferentes formas en que se habla el inglés 
          en diferentes países y regiones del mundo. Cada variedad tiene sus propias características de pronunciación, vocabulario y gramática.
        </p>
        
        <QuickReference items={[
          "British English: Reino Unido, Irlanda, Australia, Nueva Zelanda",
          "American English: Estados Unidos, Canadá",
          "Diferencias en pronunciación, vocabulario y ortografía",
          "Todas las variedades son correctas y válidas",
          "Importante para comprensión auditiva y cultural"
        ]} />
      </TheorySection>

      <TheorySection title="British English vs American English" icon="🇬🇧🇺🇸">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las dos variedades más importantes son el inglés británico y el inglés americano, cada una con características distintivas.
        </p>

        <GrammarTable
          caption="Principales Diferencias entre British y American English"
          headers={["Aspecto", "British English", "American English", "Ejemplo"]}
          rows={[
            ["Pronunciación /r/", "No se pronuncia al final", "Se pronuncia siempre", "car /kɑː/ vs /kɑr/"],
            ["Vocabulario", "lift, lorry, trousers", "elevator, truck, pants", "lift vs elevator"],
            ["Ortografía", "colour, centre, realise", "color, center, realize", "colour vs color"],
            ["Gramática", "have got, at the weekend", "have, on the weekend", "at vs on weekend"],
            ["Pronunciación /a/", "/ɑː/ en bath, dance", "/æ/ en bath, dance", "/bɑːθ/ vs /bæθ/"],
            ["Verbos irregulares", "learnt, burnt, dreamt", "learned, burned, dreamed", "learnt vs learned"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="British: 'I'll take the lift to the first floor'"
            english="British: 'I'll take the lift to the first floor'"
            translation="British: 'Tomaré el ascensor al primer piso'"
          />
          <Example 
            spanish="American: 'I'll take the elevator to the second floor'"
            english="American: 'I'll take the elevator to the second floor'"
            translation="American: 'Tomaré el elevador al segundo piso'"
          />
          <Example 
            spanish="British: 'What colour is your car?'"
            english="British: 'What colour is your car?'"
            translation="British: '¿De qué color es tu coche?'"
          />
          <Example 
            spanish="American: 'What color is your car?'"
            english="American: 'What color is your car?'"
            translation="American: '¿De qué color es tu coche?'"
          />
        </div>

        <Rule 
          title="Características de Pronunciación"
          description="Diferencias principales en pronunciación:"
          examples={[
            "British: /r/ silenciosa al final de sílabas",
            "American: /r/ pronunciada siempre",
            "British: /ɑː/ en palabras como 'bath', 'dance'",
            "American: /æ/ en las mismas palabras"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Ambas variedades son correctas - elige una y sé consistente, pero entiende ambas.
        </Tip>
      </TheorySection>

      <TheorySection title="Otras Variedades Importantes" icon="🌏">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Además del británico y americano, existen otras variedades importantes del inglés.
        </p>

        <GrammarTable
          caption="Otras Variedades del Inglés"
          headers={["Variedad", "Países/Regiones", "Características", "Ejemplo"]}
          rows={[
            ["Australian English", "Australia", "Influencia británica, vocabulario único", "arvo (afternoon), barbie (barbecue)"],
            ["Canadian English", "Canadá", "Mezcla de británico y americano", "eh? (partícula), tuque (hat)"],
            ["New Zealand English", "Nueva Zelanda", "Influencia maorí, acento distintivo", "jandals (flip-flops), dairy (convenience store)"],
            ["South African English", "Sudáfrica", "Influencia africana, vocabulario local", "robot (traffic light), braai (barbecue)"],
            ["Indian English", "India", "Influencia de lenguas locales", "prepone (opposite of postpone), cousin-brother"],
            ["Singapore English", "Singapur", "Mezcla de variedades, Singlish", "lah (particle), can (yes)"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Australian: 'Let's have a barbie this arvo'"
            english="Australian: 'Let's have a barbie this arvo'"
            translation="Australian: 'Hagamos una barbacoa esta tarde'"
          />
          <Example 
            spanish="Canadian: 'It's cold, eh? Don't forget your tuque'"
            english="Canadian: 'It's cold, eh? Don't forget your tuque'"
            translation="Canadian: 'Hace frío, ¿eh? No olvides tu gorro'"
          />
          <Example 
            spanish="Indian: 'I'll prepone the meeting'"
            english="Indian: 'I'll prepone the meeting'"
            translation="Indian: 'Adelantaré la reunión'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Familiarízate con estas variedades para mejorar tu comprensión auditiva global.
        </Tip>
      </TheorySection>

      <TheorySection title="Diferencias en Vocabulario" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las diferencias en vocabulario son una de las características más notables entre las variedades del inglés.
        </p>

        <GrammarTable
          caption="Vocabulario Diferente por Variedad"
          headers={["Categoría", "British English", "American English", "Significado"]}
          rows={[
            ["Transporte", "lorry, underground, petrol", "truck, subway, gas", "camión, metro, gasolina"],
            ["Ropa", "trousers, jumper, trainers", "pants, sweater, sneakers", "pantalones, jersey, zapatillas"],
            ["Comida", "biscuit, chips, aubergine", "cookie, fries, eggplant", "galleta, patatas, berenjena"],
            ["Casa", "flat, tap, rubbish", "apartment, faucet, garbage", "apartamento, grifo, basura"],
            ["Educación", "university, mark, rubber", "college, grade, eraser", "universidad, nota, goma"],
            ["Tiempo", "autumn, holiday", "fall, vacation", "otoño, vacaciones"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="British: 'I'll take the underground to buy some biscuits'"
            english="British: 'I'll take the underground to buy some biscuits'"
            translation="British: 'Tomaré el metro para comprar galletas'"
          />
          <Example 
            spanish="American: 'I'll take the subway to buy some cookies'"
            english="American: 'I'll take the subway to buy some cookies'"
            translation="American: 'Tomaré el metro para comprar galletas'"
          />
          <Example 
            spanish="British: 'I live in a flat and wear trainers'"
            english="British: 'I live in a flat and wear trainers'"
            translation="British: 'Vivo en un apartamento y uso zapatillas'"
          />
          <Example 
            spanish="American: 'I live in an apartment and wear sneakers'"
            english="American: 'I live in an apartment and wear sneakers'"
            translation="American: 'Vivo en un apartamento y uso zapatillas'"
          />
        </div>

        <Rule 
          title="Consejos para Vocabulario"
          description="Para manejar diferencias de vocabulario:"
          examples={[
            "Aprende ambas versiones de palabras comunes",
            "Usa contexto para entender palabras desconocidas",
            "No te preocupes si no conoces todas las variantes",
            "Pregunta si no entiendes algo específico"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Algunas palabras pueden tener significados diferentes o incluso ofensivos en otras variedades.
        </Tip>
      </TheorySection>

      <TheorySection title="Diferencias en Gramática" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Aunque las diferencias gramaticales son menores, existen algunas variaciones importantes entre las variedades.
        </p>

        <GrammarTable
          caption="Diferencias Gramaticales Principales"
          headers={["Aspecto", "British English", "American English", "Ejemplo"]}
          rows={[
            ["Present Perfect", "Se usa más frecuentemente", "Se usa menos", "I've just eaten vs I just ate"],
            ["Preposiciones", "at the weekend", "on the weekend", "at vs on weekend"],
            ["Verbos colectivos", "The team are", "The team is", "plural vs singular"],
            ["Have vs Have got", "Have got (más común)", "Have (más común)", "I've got vs I have"],
            ["Shall", "Se usa frecuentemente", "Raramente se usa", "Shall we go? vs Should we go?"],
            ["Verbos irregulares", "burnt, dreamt, learnt", "burned, dreamed, learned", "t vs ed endings"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="British: 'I've just finished my homework'"
            english="British: 'I've just finished my homework'"
            translation="British: 'Acabo de terminar mi tarea'"
          />
          <Example 
            spanish="American: 'I just finished my homework'"
            english="American: 'I just finished my homework'"
            translation="American: 'Acabo de terminar mi tarea'"
          />
          <Example 
            spanish="British: 'The team are playing well'"
            english="British: 'The team are playing well'"
            translation="British: 'El equipo está jugando bien'"
          />
          <Example 
            spanish="American: 'The team is playing well'"
            english="American: 'The team is playing well'"
            translation="American: 'El equipo está jugando bien'"
          />
        </div>

        <Tip type="info">
          <strong>Nota:</strong> Las diferencias gramaticales son sutiles y no afectan la comprensión general.                                           
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Entender Diferentes Variedades" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen estrategias específicas para mejorar tu comprensión de diferentes variedades del inglés.
        </p>

        <GrammarTable
          caption="Estrategias de Comprensión"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficios"]}
          rows={[
            ["Exposición Variada", "Escuchar diferentes acentos", "Estudio regular", "Familiaridad con variedades"],
            ["Contexto", "Usar contexto para entender", "Palabras desconocidas", "Comprensión general"],
            ["Preguntar", "Pedir aclaraciones", "Confusión específica", "Comprensión precisa"],
            ["Práctica Activa", "Hablar con nativos de diferentes países", "Conversación", "Fluidez y comprensión"],
            ["Recursos Específicos", "Usar materiales de diferentes variedades", "Estudio", "Conocimiento cultural"],
            ["Paciencia", "No preocuparse por entender todo", "Siempre", "Reducción de ansiedad"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Exposición: 'Escuchar podcasts de diferentes países'"
            english="Exposure: 'Listen to podcasts from different countries'"
            translation="Exposición: 'Escuchar podcasts de diferentes países'"
          />
          <Example 
            spanish="Contexto: 'Usar el contexto para entender palabras nuevas'"
            english="Context: 'Use context to understand new words'"
            translation="Contexto: 'Usar el contexto para entender palabras nuevas'"
          />
          <Example 
            spanish="Práctica: 'Conversar con nativos de diferentes países'"
            english="Practice: 'Converse with natives from different countries'"
            translation="Práctica: 'Conversar con nativos de diferentes países'"
          />
        </div>

        <Rule 
          title="Consejos Prácticos"
          description="Para mejorar tu comprensión:"
          examples={[
            "Escucha noticias de diferentes países",
            "Ve películas y series de diferentes regiones",
            "Practica con hablantes nativos de diferentes países",
            "No te preocupes por entender cada palabra",
            "Enfócate en el mensaje general"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La comprensión mejora con la exposición - cuanto más escuches, mejor entenderás.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Pensar que una variedad es mejor que otra ❌<br/>
            <strong>Correcto:</strong> Todas las variedades son válidas ✅<br/>
            <em>No hay una variedad 'correcta' - todas son legítimas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mezclar variedades inconsistentemente ❌<br/>
            <strong>Correcto:</strong> Ser consistente con una variedad ✅<br/>
            <em>Elige una variedad y sé consistente</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Preocuparse por entender cada palabra ❌<br/>
            <strong>Correcto:</strong> Enfocarse en el mensaje general ✅<br/>
            <em>La comprensión general es más importante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Evitar hablar con nativos de otras variedades ❌<br/>
            <strong>Correcto:</strong> Practicar con diferentes variedades ✅<br/>
            <em>La exposición mejora la comprensión</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Todas las variedades son correctas"
            description="No hay una variedad 'mejor' o 'correcta'."
            examples={[
              "British English es tan válido como American English",
              "Las variedades reflejan diferencias culturales",
              "La elección depende del contexto y audiencia",
              "Lo importante es la comunicación efectiva"
            ]}
          />

          <Rule 
            title="2. Consistencia es clave"
            description="Sé consistente con la variedad que elijas."
            examples={[
              "Elige una variedad y manténla",
              "No mezcles características de diferentes variedades",
              "Adapta según el contexto si es necesario",
              "La consistencia mejora la claridad"
            ]}
          />

          <Rule 
            title="3. Exposición mejora comprensión"
            description="Escucha diferentes variedades para mejorar tu comprensión."
            examples={[
              "Expón tu oído a diferentes acentos",
              "Practica con hablantes de diferentes países",
              "Usa recursos de diferentes variedades",
              "No te preocupes por entender todo perfectamente"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="En British English, ¿qué significa 'lift'?"
      options={[
        "Truck",
        "Elevator",
        "Car",
        "Bus"
      ]}
      correctAnswer={1}
      explanation="En British English, 'lift' significa 'elevator' (ascensor), mientras que en American English se usa directamente 'elevator'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la diferencia principal en pronunciación entre British y American English?"
      options={[
        "La pronunciación de la letra 'a'",
        "La pronunciación de la letra 'r' al final de sílabas",
        "La pronunciación de la letra 't'",
        "La pronunciación de la letra 'h'"
      ]}
      correctAnswer={1}
      explanation="La diferencia principal es la pronunciación de 'r' al final de sílabas: British English no la pronuncia, American English sí."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "American English es mejor que British English.",
          isTrue: false,
          explanation: "Incorrecto. Todas las variedades del inglés son correctas y válidas. No hay una 'mejor' que otra."
        },
        {
          text: "Es importante ser consistente con la variedad de inglés que elijas.",
          isTrue: true,
          explanation: "Correcto. La consistencia mejora la claridad y evita confusión. Mezclar variedades puede ser confuso."
        },
        {
          text: "Las diferencias entre variedades solo afectan la pronunciación.",
          isTrue: false,
          explanation: "Incorrecto. Las diferencias incluyen pronunciación, vocabulario, ortografía y algunas diferencias gramaticales."
        },
        {
          text: "Exponerse a diferentes variedades mejora la comprensión auditiva.",
          isTrue: true,
          explanation: "Correcto. La exposición a diferentes variedades familiariza tu oído con diferentes acentos y vocabulario."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la palabra americana para 'biscuit' en British English?"
      options={[
        "cookie",
        "cracker",
        "bread",
        "cake"
      ]}
      correctAnswer={0}
      explanation="'Cookie' es la palabra americana para 'biscuit' en British English. Ambas se refieren a galletas dulces."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estrategia es más efectiva para entender diferentes variedades del inglés?"
      options={[
        "Evitar hablar con nativos de otras variedades",
        "Exponerse a diferentes variedades regularmente",
        "Solo escuchar una variedad específica",
        "Memorizar todas las diferencias de vocabulario"
      ]}
      correctAnswer={1}
      explanation="Exponerse regularmente a diferentes variedades mejora la comprensión auditiva y familiariza tu oído con diferentes acentos y vocabulario."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Australian English has unique vocabulary and expressions.",
          isTrue: true,
          explanation: "Correcto. El inglés australiano tiene vocabulario único como 'arvo' (afternoon), 'barbie' (barbecue), y 'mate' (friend)."
        },
        {
          text: "All English varieties use the same spelling system.",
          isTrue: false,
          explanation: "Incorrecto. British English usa 'colour', 'centre'; American English usa 'color', 'center'."
        },
        {
          text: "Understanding different varieties improves global communication.",
          isTrue: true,
          explanation: "Correcto. Conocer diferentes variedades del inglés mejora la comunicación con hablantes de todo el mundo."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="In American English, what do you call the 'boot' of a car?"
      options={[
        "Hood",
        "Trunk",
        "Bonnet",
        "Bumper"
      ]}
      correctAnswer={1}
      explanation="En American English, el 'boot' (British) se llama 'trunk'. 'Hood' es el capó, 'bonnet' es British para capó."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es una característica del inglés canadiense?"
      options={[
        "Es idéntico al americano",
        "Combina elementos británicos y americanos",
        "Solo usa vocabulario francés",
        "No tiene características propias"
      ]}
      correctAnswer={1}
      explanation="El inglés canadiense combina elementos británicos (spelling: 'colour') y americanos (pronunciation), con algunas características únicas."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Indian English is considered a legitimate variety of English.",
          isTrue: true,
          explanation: "Correcto. El inglés indio es una variedad legítima con sus propias características fonológicas, léxicas y gramaticales."
        },
        {
          text: "You should avoid learning about different English accents.",
          isTrue: false,
          explanation: "Incorrecto. Exponerse a diferentes acentos mejora la comprensión auditiva y prepara para la comunicación internacional."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: In South African English, 'now now' means:"
      options={[
        "Right now",
        "Very soon",
        "Never",
        "Sometimes"
      ]}
      correctAnswer={1}
      explanation="En South African English, 'now now' significa 'very soon' (muy pronto), no 'right now' (ahora mismo)."
    />
  ];

  return (
    <TheoryLayout
      title="English Varieties"
      description="Comprende las diferentes variedades del inglés: British, American y otras. Aprende sobre diferencias en pronunciación, vocabulario y gramática, y estrategias para entenderlas."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate listening skills", "Basic understanding of English varieties"]}
      estimatedTime="70 min"
    />
  );
};

export default EnglishVarietiesPage;

