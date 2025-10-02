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

const ArticlesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Articles, Determiners y Quantifiers?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>articles</strong>, <strong>determiners</strong> y <strong>quantifiers</strong> son palabras pequeñas pero muy importantes en inglés. 
          Nos ayudan a especificar qué tipo de información estamos dando sobre un sustantivo.
        </p>
        
        <QuickReference items={[
          "Articles: a, an, the",
          "Determiners: this, that, these, those, my, your, his, her, etc.",
          "Quantifiers: some, any, many, much, few, little, all, every, etc.",
          "Van ANTES del sustantivo",
          "Nos dicen cuánto o qué tipo de cosa"
        ]} />
      </TheorySection>

      <TheorySection title="Articles (Artículos)" icon="📰">
        <Rule 
          title="The Articles: a, an, the"
          description="Los artículos son palabras que van antes de los sustantivos para indicar si nos referimos a algo específico o general."
        />
        
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🔤 A / An (Artículos Indefinidos)</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.75rem' }}>
              Se usan con sustantivos singulares contables cuando hablamos de algo por primera vez o de manera general.
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: '#4a5568' }}>
              <li><strong>A:</strong> Se usa antes de palabras que empiezan con consonante</li>
              <li><strong>An:</strong> Se usa antes de palabras que empiezan con vocal (a, e, i, o, u)</li>
            </ul>
            
            <Example 
              spanish="Un perro está en el jardín"
              english="A dog is in the garden"
              translation="Un perro está en el jardín"
            />
            <Example 
              spanish="Una manzana es roja"
              english="An apple is red"
              translation="Una manzana es roja"
            />
            
            <Tip type="warning">
              <strong>¡Cuidado!</strong> Se usa "an" antes de palabras que empiezan con vocal, no necesariamente con la letra. 
              Por ejemplo: "an hour" (una hora) porque "hour" se pronuncia /aʊər/.
            </Tip>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🎯 The (Artículo Definido)</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.75rem' }}>
              Se usa cuando nos referimos a algo específico que ya conocemos o que es único.
            </p>
            
            <Example 
              spanish="El perro que vimos ayer está aquí"
              english="The dog we saw yesterday is here"
              translation="El perro que vimos ayer está aquí"
            />
            <Example 
              spanish="El sol brilla"
              english="The sun is shining"
              translation="El sol brilla"
            />
            
            <Tip type="info">
              <strong>Recuerda:</strong> "The" se puede usar con sustantivos singulares y plurales, contables e incontables.
            </Tip>
          </div>
        </div>
      </TheorySection>

      <TheorySection title="Determiners (Determinantes)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1.5rem' }}>
          Los determinantes nos ayudan a identificar o especificar a qué sustantivo nos referimos.
        </p>

        <GrammarTable
          caption="Tipos de Determinantes"
          headers={["Tipo", "Ejemplos", "Uso"]}
          rows={[
            ["Demostrativos", "this, that, these, those", "Señalan distancia y número"],
            ["Posesivos", "my, your, his, her, its, our, their", "Indican posesión"],
            ["Interrogativos", "which, what, whose", "Hacen preguntas"],
            ["Indefinidos", "some, any, no, every", "Cantidad indefinida"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este libro es mío"
            english="This book is mine"
            translation="Este libro es mío"
          />
          <Example 
            spanish="¿Cuál es tu nombre?"
            english="What is your name?"
            translation="¿Cuál es tu nombre?"
          />
        </div>
      </TheorySection>

      <TheorySection title="Quantifiers (Cuantificadores)" icon="📊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1.5rem' }}>
          Los cuantificadores nos dicen cuánto o cuántos de algo hay. Son muy importantes para expresar cantidad.
        </p>

        <GrammarTable
          caption="Cuantificadores Comunes"
          headers={["Cuantificador", "Con Contables", "Con Incontables", "Ejemplo"]}
          rows={[
            ["some", "✅", "✅", "I have some books"],
            ["any", "✅", "✅", "Do you have any money?"],
            ["many", "✅", "❌", "Many students"],
            ["much", "❌", "✅", "Much water"],
            ["few", "✅", "❌", "Few people"],
            ["little", "❌", "✅", "Little time"],
            ["all", "✅", "✅", "All students"],
            ["every", "✅", "❌", "Every day"]
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Para preguntas negativas y oraciones negativas, generalmente usamos "any" en lugar de "some".
        </Tip>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Hay muchos libros en la biblioteca"
            english="There are many books in the library"
            translation="Hay muchos libros en la biblioteca"
          />
          <Example 
            spanish="No hay mucha agua"
            english="There isn't much water"
            translation="No hay mucha agua"
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. No uses artículos con sustantivos plurales generales"
            description="Cuando hablamos de sustantivos plurales de manera general, no usamos artículo."
            examples={[
              "Dogs are friendly (Los perros son amigables)",
              "Children like toys (A los niños les gustan los juguetes)"
            ]}
          />

          <Rule 
            title="2. Usa 'the' con cosas únicas"
            description="Para cosas que solo existen una vez en el mundo."
            examples={[
              "The moon is beautiful (La luna es hermosa)",
              "The president is speaking (El presidente está hablando)"
            ]}
          />

          <Rule 
            title="3. Much vs Many"
            description="Much para incontables, many para contables."
            examples={[
              "Much time (mucho tiempo)",
              "Many friends (muchos amigos)"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I have a money" ❌<br/>
            <strong>Correcto:</strong> "I have some money" o "I have money" ✅
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I need many advices" ❌<br/>
            <strong>Correcto:</strong> "I need much advice" ✅
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The happiness is important" ❌<br/>
            <strong>Correcto:</strong> "Happiness is important" ✅
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la forma correcta?"
      options={[
        "I have a money",
        "I have some money",
        "I have many money",
        "I have much money"
      ]}
      correctAnswer={1}
      explanation="'Money' es incontable, por lo que usamos 'some' o no usamos cuantificador. 'Much' también es correcto, pero 'some' es más natural en este contexto."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Complete: 'I need ___ book for school.'"
      options={[
        "the",
        "a",
        "an",
        "some"
      ]}
      correctAnswer={1}
      explanation="'A' se usa con sustantivos contables singulares cuando hablamos de algo por primera vez o en general."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We use 'a' before words that start with a vowel sound.",
          isTrue: false,
          explanation: "Usamos 'an' antes de palabras que empiezan con vocal, no 'a'."
        },
        {
          text: "'Much' can be used with countable nouns.",
          isTrue: false,
          explanation: "'Much' se usa solo con sustantivos incontables. Para contables usamos 'many'."
        },
        {
          text: "'The' can be used with both singular and plural nouns.",
          isTrue: true,
          explanation: "Correcto. 'The' se puede usar con sustantivos singulares y plurales."
        },
        {
          text: "We don't use articles with plural nouns when speaking generally.",
          isTrue: true,
          explanation: "Correcto. No usamos artículos con sustantivos plurales cuando hablamos de manera general."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar esta oración: '___ students in my class are very intelligent'?"
      options={[
        "The",
        "A",
        "An",
        "No article needed"
      ]}
      correctAnswer={3}
      explanation="Cuando hablamos de estudiantes en general (plural), no necesitamos artículo. Si dijéramos 'the students in my class', estaríamos hablando de estudiantes específicos."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál cuantificador es correcto para 'time'?"
      options={[
        "many",
        "much",
        "few",
        "little (with 'a')"
      ]}
      correctAnswer={1}
      explanation="'Time' es incontable, por lo que usamos 'much'. También podríamos usar 'a little' para decir 'un poco de tiempo'."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'There are ___ students in the classroom.'"
      options={[
        "a",
        "an",
        "some",
        "much"
      ]}
      correctAnswer={2}
      explanation="'Students' es contable plural, por lo que usamos 'some' en oraciones afirmativas."
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es correcto?"
      options={[
        "I need an advice",
        "I need some advice",
        "I need many advice",
        "I need few advice"
      ]}
      correctAnswer={1}
      explanation="'Advice' es incontable, por lo que usamos 'some' y no lleva artículo indefinido."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'Do you have ___ money?'"
      options={[
        "some",
        "any",
        "many",
        "few"
      ]}
      correctAnswer={1}
      explanation="En preguntas usamos 'any' con sustantivos incontables como 'money'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="¿Cuál artículo es correcto: '___ university'?"
      options={[
        "a",
        "an",
        "the",
        "no article"
      ]}
      correctAnswer={0}
      explanation="'University' empieza con sonido consonántico /j/, por lo que usamos 'a'."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'There isn't ___ water left.'"
      options={[
        "some",
        "any",
        "many",
        "few"
      ]}
      correctAnswer={1}
      explanation="En oraciones negativas usamos 'any' con sustantivos incontables como 'water'."
    />
  ];

  return (
    <TheoryLayout
      title="Articles, Determiners and Quantifiers"
      description="Aprende a usar correctamente los artículos (a, an, the), determinantes (this, that, my, your) y cuantificadores (some, any, many, much) en inglés."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Nociones básicas de sustantivos"]}
      estimatedTime="45 min"
    />
  );
};

export default ArticlesPage;






















