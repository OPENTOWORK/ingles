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

const PronounsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Pronouns?" icon="👥">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>pronouns</strong> (pronombres) son palabras que reemplazan a los sustantivos para evitar repetir las mismas palabras. 
          Son fundamentales para hablar de manera natural y fluida en inglés.
        </p>
        
        <QuickReference items={[
          "Personal: I, you, he, she, it, we, they",
          "Possessive: my, your, his, her, its, our, their",
          "Object: me, you, him, her, it, us, them",
          "Reflexive: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves",
          "Demonstrative: this, that, these, those"
        ]} />
      </TheorySection>

      <TheorySection title="Personal Pronouns (Pronombres Personales)" icon="👤">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres personales reemplazan a las personas o cosas de las que hablamos.
        </p>

        <GrammarTable
          caption="Pronombres Personales"
          headers={["Persona", "Singular", "Plural", "Significado"]}
          rows={[
            ["1ª persona", "I", "we", "Yo / Nosotros"],
            ["2ª persona", "you", "you", "Tú / Ustedes"],
            ["3ª persona", "he/she/it", "they", "Él/Ella/Eso / Ellos"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo soy estudiante"
            english="I am a student"
            translation="Yo soy estudiante"
          />
          <Example 
            spanish="Ella es doctora"
            english="She is a doctor"
            translation="Ella es doctora"
          />
          <Example 
            spanish="Nosotros vivimos aquí"
            english="We live here"
            translation="Nosotros vivimos aquí"
          />
        </div>

        <Tip type="info">
          <strong>Nota:</strong> En inglés no hay diferencia entre "tú" y "usted" - ambos se dicen "you". 
          El contexto y el tono indican el nivel de formalidad.
        </Tip>
      </TheorySection>

      <TheorySection title="Possessive Pronouns (Pronombres Posesivos)" icon="🏠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres posesivos muestran a quién pertenece algo. Hay dos tipos: determinantes posesivos y pronombres posesivos.
        </p>

        <GrammarTable
          caption="Determinantes Posesivos (van antes del sustantivo)"
          headers={["Persona", "Singular", "Plural"]}
          rows={[
            ["1ª persona", "my", "our"],
            ["2ª persona", "your", "your"],
            ["3ª persona", "his/her/its", "their"]
          ]}
        />

        <GrammarTable
          caption="Pronombres Posesivos (reemplazan al sustantivo)"
          headers={["Persona", "Singular", "Plural"]}
          rows={[
            ["1ª persona", "mine", "ours"],
            ["2ª persona", "yours", "yours"],
            ["3ª persona", "his/hers/its", "theirs"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mi libro es azul"
            english="My book is blue"
            translation="Mi libro es azul"
          />
          <Example 
            spanish="Este libro es mío"
            english="This book is mine"
            translation="Este libro es mío"
          />
          <Example 
            spanish="Su casa es grande"
            english="Her house is big"
            translation="Su casa es grande (de ella)"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No confundas "its" (posesivo) con "it's" (contracción de "it is"). 
          "Its" no lleva apóstrofe cuando es posesivo.
        </Tip>
      </TheorySection>

      <TheorySection title="Object Pronouns (Pronombres de Objeto)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres de objeto se usan cuando la persona o cosa es el objeto de la acción (recibe la acción).
        </p>

        <GrammarTable
          caption="Pronombres de Objeto"
          headers={["Persona", "Singular", "Plural"]}
          rows={[
            ["1ª persona", "me", "us"],
            ["2ª persona", "you", "you"],
            ["3ª persona", "him/her/it", "them"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ella me ve"
            english="She sees me"
            translation="Ella me ve"
          />
          <Example 
            spanish="Yo los conozco"
            english="I know them"
            translation="Yo los conozco"
          />
          <Example 
            spanish="El libro me gusta"
            english="I like the book"
            translation="Me gusta el libro (literalmente: El libro me gusta)"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Los pronombres de objeto van después del verbo o después de preposiciones.
        </Tip>
      </TheorySection>

      <TheorySection title="Reflexive Pronouns (Pronombres Reflexivos)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres reflexivos se usan cuando el sujeto y el objeto son la misma persona o cosa.
        </p>

        <GrammarTable
          caption="Pronombres Reflexivos"
          headers={["Persona", "Singular", "Plural"]}
          rows={[
            ["1ª persona", "myself", "ourselves"],
            ["2ª persona", "yourself", "yourselves"],
            ["3ª persona", "himself/herself/itself", "themselves"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo me lavo las manos"
            english="I wash my hands"
            translation="Yo me lavo las manos"
          />
          <Example 
            spanish="Ella se peina"
            english="She combs her hair"
            translation="Ella se peina"
          />
          <Example 
            spanish="Nosotros nos divertimos"
            english="We enjoy ourselves"
            translation="Nosotros nos divertimos"
          />
        </div>

        <Tip type="info">
          <strong>Uso común:</strong> Los pronombres reflexivos también se usan para enfatizar: "I myself did it" (Yo mismo lo hice).
        </Tip>
      </TheorySection>

      <TheorySection title="Demonstrative Pronouns (Pronombres Demostrativos)" icon="👉">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres demostrativos señalan o indican personas o cosas específicas.
        </p>

        <GrammarTable
          caption="Pronombres Demostrativos"
          headers={["Distancia", "Singular", "Plural", "Significado"]}
          rows={[
            ["Cerca", "this", "these", "Este/Esta / Estos/Estas"],
            ["Lejos", "that", "those", "Ese/Esa / Esos/Esas"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este es mi libro"
            english="This is my book"
            translation="Este es mi libro"
          />
          <Example 
            spanish="Esos son mis zapatos"
            english="Those are my shoes"
            translation="Esos son mis zapatos"
          />
          <Example 
            spanish="¿Qué es esto?"
            english="What is this?"
            translation="¿Qué es esto?"
          />
        </div>

        <Tip type="warning">
          <strong>Diferencia:</strong> "This/these" para cosas cercanas, "that/those" para cosas lejanas. 
          También se usan para referirse a tiempo: "this week" (esta semana), "that year" (ese año).
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "Me and him are friends" ❌<br/>
            <strong>Correcto:</strong> "He and I are friends" ✅<br/>
            <em>En sujeto usamos pronombres personales, no de objeto</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "This book is her" ❌<br/>
            <strong>Correcto:</strong> "This book is hers" ✅<br/>
            <em>Después de "is" usamos pronombre posesivo, no determinante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I hurt me" ❌<br/>
            <strong>Correcto:</strong> "I hurt myself" ✅<br/>
            <em>Para acciones reflexivas usamos pronombres reflexivos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Its a beautiful day" ❌<br/>
            <strong>Correcto:</strong> "It's a beautiful day" ✅<br/>
            <em>"It's" = "it is", "its" = posesivo</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Orden de cortesía"
            description="Cuando hablamos de nosotros y otra persona, siempre ponemos a la otra persona primero."
            examples={[
              "You and I are friends (Tú y yo somos amigos)",
              "He and she are married (Él y ella están casados)"
            ]}
          />

          <Rule 
            title="2. Pronombres después de preposiciones"
            description="Después de preposiciones siempre usamos pronombres de objeto."
            examples={[
              "This is for you (Esto es para ti)",
              "Come with me (Ven conmigo)"
            ]}
          />

          <Rule 
            title="3. Pronombres posesivos vs determinantes"
            description="Determinantes van antes del sustantivo, pronombres reemplazan al sustantivo."
            examples={[
              "My book (mi libro) vs This is mine (esto es mío)",
              "Her car (su coche) vs The car is hers (el coche es suyo)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____ am a teacher. _____ name is Sarah.'"
      options={[
        "I, My",
        "Me, My",
        "I, Mine",
        "Me, Mine"
      ]}
      correctAnswer={0}
      explanation="Como sujeto usamos 'I' y como determinante posesivo usamos 'My'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'This book is ___'?"
      options={[
        "my",
        "mine",
        "me",
        "myself"
      ]}
      correctAnswer={1}
      explanation="Después de 'is' necesitamos un pronombre posesivo que reemplace al sustantivo. 'Mine' significa 'mío'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Me and him went to the store' is correct.",
          isTrue: false,
          explanation: "Incorrecto. En sujeto usamos pronombres personales: 'He and I went to the store'."
        },
        {
          text: "'This is my book' and 'This book is mine' are both correct.",
          isTrue: true,
          explanation: "Correcto. 'My' es determinante posesivo, 'mine' es pronombre posesivo."
        },
        {
          text: "'Its' and 'it's' mean the same thing.",
          isTrue: false,
          explanation: "Incorrecto. 'Its' es posesivo (su/suyo), 'it's' es contracción de 'it is'."
        },
        {
          text: "'I hurt myself' is correct for reflexive actions.",
          isTrue: true,
          explanation: "Correcto. Para acciones reflexivas usamos pronombres reflexivos."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'She gave the book to ___'?"
      options={[
        "I",
        "me",
        "myself",
        "mine"
      ]}
      correctAnswer={1}
      explanation="Después de la preposición 'to' usamos pronombres de objeto. 'Me' es el pronombre de objeto para 'I'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: '___ and ___ are going to the party'?"
      options={[
        "Me, him",
        "I, he",
        "Myself, himself",
        "Mine, his"
      ]}
      correctAnswer={1}
      explanation="En sujeto usamos pronombres personales: 'I' y 'he'. Además, seguimos el orden de cortesía poniendo 'I' al final."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'She hurt _____ while playing tennis.'"
      options={[
        "her",
        "herself",
        "hers",
        "she"
      ]}
      correctAnswer={1}
      explanation="Para acciones reflexivas usamos pronombres reflexivos: 'herself'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es correcto?"
      options={[
        "This car is her",
        "This car is hers",
        "This car is she",
        "This car is herself"
      ]}
      correctAnswer={1}
      explanation="'Hers' es el pronombre posesivo que reemplaza al sustantivo. 'Her' sería determinante: 'her car'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'Between you and ___, I think he's wrong.'"
      options={[
        "I",
        "me",
        "my",
        "mine"
      ]}
      correctAnswer={1}
      explanation="Después de preposiciones como 'between' usamos pronombres de objeto: 'me'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: '_____ house is bigger than _____.' (comparing two houses)"
      options={[
        "Their, ours",
        "They, us",
        "Them, we",
        "Theirs, our"
      ]}
      correctAnswer={0}
      explanation="'Their house' (determinante) y 'ours' (pronombre posesivo que reemplaza 'our house')."
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la forma correcta?"
      options={[
        "Who's book is this?",
        "Whose book is this?",
        "Who book is this?",
        "Whos book is this?"
      ]}
      correctAnswer={1}
      explanation="'Whose' es el pronombre interrogativo posesivo. 'Who's' = 'who is'."
    />
  ];

  return (
    <TheoryLayout
      title="Pronouns"
      description="Domina todos los tipos de pronombres en inglés: personales, posesivos, de objeto, reflexivos y demostrativos. Esencial para hablar con fluidez."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Verb to be", "Nociones básicas de sustantivos"]}
      estimatedTime="50 min"
    />
  );
};

export default PronounsPage;






















