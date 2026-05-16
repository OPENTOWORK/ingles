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

const FalseFriendsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are False Friends?" icon="👥">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>False friends</strong> are words that look very similar in English and Spanish 
          but have completely different meanings. They are one of the most common sources of errors for 
          Spanish speakers, because they may seem familiar but actually mean something different.
        </p>
        
        <QuickReference items={[
          "Words that look alike but mean different things",
          "A common source of mistakes",
          "They can confuse Spanish speakers",
          "It's important to memorise the differences",
          "Context helps identify the meaning"
        ]} />
      </TheorySection>

      <TheorySection title="Common False Friends – Part 1" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some of the most common and confusing false friends.
        </p>

        <GrammarTable
          caption="Common False Friends"
          headers={["English Word", "English Meaning", "Spanish Word", "Spanish Meaning"]}
          rows={[
            ["actual", "real, current", "actual", "current, present"],
            ["actually", "really, in fact", "actualmente", "currently, now"],
            ["assist", "help, attend", "asistir", "attend, be present"],
            ["attend", "go to, be present", "atender", "serve, take care of"],
            ["carpet", "floor covering", "carpeta", "folder, file"],
            ["casual", "informal, relaxed", "casual", "by chance, accidental"],
            ["complexion", "skin appearance", "complexión", "physical build"],
            ["constipated", "having bowel problems", "constipado", "having a cold"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La situación actual es difícil"
            english="The actual situation is difficult"
            translation="The real situation is difficult"
          />
          <Example 
            spanish="Actualmente estoy trabajando"
            english="I'm actually working"
            translation="I'm actually working"
          />
          <Example 
            spanish="Voy a asistir a la reunión"
            english="I'm going to attend the meeting"
            translation="I'm going to attend the meeting"
          />
        </div>

        <Rule 
          title="Tips for Identifying False Friends"
          description="To avoid confusion:"
          examples={[
            "Don't assume they mean the same thing",
            "Always check the context",
            "Use bilingual dictionaries",
            "Learn the most common pairs"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> 'Actual' in English means 'real', not 'current'. Use 'current' for 'actual'.
        </Tip>
      </TheorySection>

      <TheorySection title="Common False Friends – Part 2" icon="📖">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          More false friends that can cause confusion.
        </p>

        <GrammarTable
          caption="More False Friends"
          headers={["English Word", "English Meaning", "Spanish Word", "Spanish Meaning"]}
          rows={[
            ["deceive", "trick, mislead", "decepcionar", "disappoint"],
            ["disappoint", "let down", "desapuntar", "remove from target"],
            ["embarrassed", "ashamed", "embarazada", "pregnant"],
            ["exit", "way out", "éxito", "success"],
            ["fabric", "material, cloth", "fábrica", "factory"],
            ["library", "place with books", "librería", "bookstore"],
            ["mayor", "head of city", "mayor", "older, bigger"],
            ["miserable", "very unhappy", "miserable", "mean, stingy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estoy decepcionado con los resultados"
            english="I'm disappointed with the results"
            translation="I'm disappointed with the results"
          />
          <Example 
            spanish="Estoy embarazada (pregnant)"
            english="I'm pregnant"
            translation="I'm pregnant"
          />
          <Example 
            spanish="El éxito de la película fue grande"
            english="The movie's success was great"
            translation="The movie was a great success"
          />
        </div>

        <Tip type="error">
          <strong>Common mistake:</strong> 'Embarrassed' does not mean 'embarazada'. It means 'ashamed' or 'feeling embarrassed'.
        </Tip>
      </TheorySection>

      <TheorySection title="Common False Friends – Part 3" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          More false friend pairs to complete your knowledge.
        </p>

        <GrammarTable
          caption="Additional False Friends"
          headers={["English Word", "English Meaning", "Spanish Word", "Spanish Meaning"]}
          rows={[
            ["nervous", "anxious, worried", "nervioso", "anxious, worried"],
            ["notice", "observe, see", "noticia", "news"],
            ["parents", "mother and father", "parientes", "relatives"],
            ["policy", "plan, rules", "policía", "police"],
            ["realize", "understand, become aware", "realizar", "carry out, do"],
            ["record", "document, evidence", "recordar", "remember"],
            ["resume", "continue, CV", "resumir", "summarize"],
            ["sensible", "reasonable, practical", "sensible", "sensitive"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me di cuenta de mi error"
            english="I realized my mistake"
            translation="I realised my mistake"
          />
          <Example 
            spanish="Recordé la cita"
            english="I remembered the appointment"
            translation="I remembered the appointment"
          />
          <Example 
            spanish="Es una persona sensible"
            english="He's a sensitive person"
            translation="He's a sensitive person"
          />
        </div>

        <Rule 
          title="Strategies to Remember"
          description="Useful techniques:"
          examples={[
            "Create mental associations",
            "Practise with sentences",
            "Use flashcards",
            "Read in context"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> 'Realize' means 'to become aware of', not 'to carry out'. For 'realizar' use 'carry out' or 'do'.
        </Tip>
      </TheorySection>

      <TheorySection title="False Friends with Similar Pronunciation" icon="🔊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Words that sound similar but mean different things.
        </p>

        <GrammarTable
          caption="False Friends by Pronunciation"
          headers={["English Word", "Pronunciation", "Meaning", "Confused with"]}
          rows={[
            ["dessert", "/dɪˈzɜːrt/", "sweet food after meal", "desert (desert)"],
            ["desert", "/ˈdezərt/", "dry, sandy area", "dessert (dessert)"],
            ["loose", "/luːs/", "not tight", "lose (perder)"],
            ["lose", "/luːz/", "not win, misplace", "loose (suelto)"],
            ["advice", "/ədˈvaɪs/", "recommendation", "advise (aconsejar)"],
            ["advise", "/ədˈvaɪz/", "give advice", "advice (consejo)"],
            ["effect", "/ɪˈfekt/", "result, consequence", "affect (afectar)"],
            ["affect", "/əˈfekt/", "influence, impact", "effect (efecto)"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el postre"
            english="I like dessert"
            translation="I like dessert"
          />
          <Example 
            spanish="El desierto es muy seco"
            english="The desert is very dry"
            translation="The desert is very dry"
          />
          <Example 
            spanish="Necesito consejo"
            english="I need advice"
            translation="I need advice"
          />
          <Example 
            spanish="Te aconsejo estudiar"
            english="I advise you to study"
            translation="I advise you to study"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> 'Advice' is a noun; 'advise' is a verb. The difference is in the 's' and 'c'.
        </Tip>
      </TheorySection>

      <TheorySection title="Context and Usage" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Context is key to identifying and using words correctly.
        </p>

        <GrammarTable
          caption="Context Strategies"
          headers={["Strategy", "Example", "Explanation"]}
          rows={[
            ["Read the full sentence", "The actual problem is...", "Context helps you understand 'real'"],
            ["Look for related words", "Library books are...", "Books indicate a place for reading"],
            ["Consider the topic", "Fabric production...", "Production indicates the textile industry"],
            ["Check the dictionary", "When in doubt, check", "Always verify the meaning"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El problema actual es la inflación"
            english="The current problem is inflation"
            translation="The current problem is inflation"
          />
          <Example 
            spanish="Voy a la biblioteca para estudiar"
            english="I go to the library to study"
            translation="I go to the library to study"
          />
          <Example 
            spanish="Esta fábrica produce telas"
            english="This factory produces fabrics"
            translation="This factory produces fabric"
          />
        </div>

        <Rule 
          title="Context Rules"
          description="To use context effectively:"
          examples={[
            "Read the whole sentence",
            "Consider surrounding words",
            "Think about the general topic",
            "If unsure, verify"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Context is your best friend for avoiding false friend mistakes.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Using 'actual' for 'current' ❌<br/>
            <strong>Correct:</strong> 'Actual' = real, 'Current' = present ✅<br/>
            <em>My actual job → My current job</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using 'library' for 'bookstore' ❌<br/>
            <strong>Correct:</strong> 'Library' = library (borrow books), 'Bookstore' = bookshop ✅<br/>
            <em>I buy books at the library → I buy books at the bookstore</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using 'realize' for 'carry out' ❌<br/>
            <strong>Correct:</strong> 'Realize' = become aware of, 'Carry out' = do/execute ✅<br/>
            <em>I realized the project → I carried out the project</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using 'embarrassed' for 'pregnant' ❌<br/>
            <strong>Correct:</strong> 'Embarrassed' = ashamed, 'Pregnant' = pregnant ✅<br/>
            <em>She is embarrassed → She is pregnant</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using 'exit' for 'success' ❌<br/>
            <strong>Correct:</strong> 'Exit' = way out, 'Success' = success ✅<br/>
            <em>The exit of the movie → The success of the movie</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Don't assume similarity"
            description="Words that look alike can mean very different things."
            examples={[
              "Always verify the meaning",
              "Don't translate literally",
              "Use reliable dictionaries",
              "Practise in context"
            ]}
          />

          <Rule 
            title="2. Context is key"
            description="Context helps you understand the correct meaning."
            examples={[
              "Read full sentences",
              "Consider the general topic",
              "Look for related words",
              "Think logically"
            ]}
          />

          <Rule 
            title="3. Learn the most common pairs"
            description="Memorise the most frequent false friends."
            examples={[
              "Actual vs Current",
              "Library vs Bookstore",
              "Realize vs Carry out",
              "Embarrassed vs Pregnant",
              "Exit vs Success"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'The _____ situation is difficult.' (present/current)"
      options={[
        "actual",
        "current",
        "real",
        "true"
      ]}
      correctAnswer={1}
      explanation="'Current' means present. 'Actual' in English means real or true."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What does 'actual' mean in English?"
      options={[
        "current",
        "real, existing",
        "present",
        "modern"
      ]}
      correctAnswer={1}
      explanation="'Actual' in English means 'real' or 'existing', not 'current'. For 'current' or 'present', use 'current'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Library' in English means the same as 'librería' in Spanish.",
          isTrue: false,
          explanation: "Incorrect. 'Library' in English means 'biblioteca' (place with books to borrow), while 'librería' means 'bookstore' (place to buy books)."
        },
        {
          text: "'Realize' means 'to become aware of something' in English.",
          isTrue: true,
          explanation: "Correct. 'Realize' means 'to become aware of' or 'to understand'. It does not mean 'to carry out' (realizar)."
        },
        {
          text: "'Embarrassed' means 'pregnant' in English.",
          isTrue: false,
          explanation: "Incorrect. 'Embarrassed' means 'ashamed' or 'feeling shame'. 'Pregnant' means 'embarazada'."
        },
        {
          text: "False friends are words that look similar but have different meanings.",
          isTrue: true,
          explanation: "Correct. False friends are words that appear similar in two languages but have different meanings."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which word means 'to carry out' or 'to do' in English?"
      options={[
        "realize",
        "carry out",
        "actual",
        "library"
      ]}
      correctAnswer={1}
      explanation="'Carry out' means 'to do' or 'to execute'. 'Realize' means 'to become aware of', 'actual' means 'real', and 'library' means 'biblioteca'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the correct English word for 'éxito' (success)?"
      options={[
        "exit",
        "success",
        "access",
        "excess"
      ]}
      correctAnswer={1}
      explanation="The correct English word for 'éxito' (success) is 'success'. 'Exit' means 'salida' (way out)."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Success' in English means the same as 'suceso' in Spanish.",
          isTrue: false,
          explanation: "Incorrect. 'Success' means success, while 'suceso' means event or occurrence."
        },
        {
          text: "'Fabric' in English refers to cloth or textile material.",
          isTrue: true,
          explanation: "Correct. 'Fabric' means cloth or textile material, not factory (fábrica)."
        },
        {
          text: "'Sensible' in English means the same as 'sensible' in Spanish.",
          isTrue: false,
          explanation: "Incorrect. 'Sensible' in English means practical/reasonable, not sensitive (sensible in Spanish)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She is very _____ about her appearance.' (sensitive)"
      options={[
        "sensible",
        "sensitive",
        "sensual",
        "sense"
      ]}
      correctAnswer={1}
      explanation="'Sensitive' means easily offended or emotionally responsive. 'Sensible' means practical or reasonable."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What does 'exit' mean in English?"
      options={[
        "success",
        "way out",
        "entrance",
        "failure"
      ]}
      correctAnswer={1}
      explanation="'Exit' means way out. 'Éxito' in Spanish is 'success' in English."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Attend' in English means to be present at an event.",
          isTrue: true,
          explanation: "Correct. 'Attend' means to be present at an event, not to serve or help (atender)."
        },
        {
          text: "'Carpet' and 'carpeta' refer to the same object.",
          isTrue: false,
          explanation: "Incorrect. 'Carpet' is a floor covering; 'carpeta' is a folder in English."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I need to _____ the meeting tomorrow.' (attend)"
      options={[
        "assist",
        "attend",
        "help",
        "support"
      ]}
      correctAnswer={1}
      explanation="'Attend' means to be present at an event. 'Assist' means to help."
    />
  ];

  return (
    <TheoryLayout
      title="False Friends"
      description="Master false friends between English and Spanish. Learn to avoid common confusions and use the right word for each context."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of word formation"]}
      estimatedTime="75 min"
    />
  );
};

export default FalseFriendsPage;