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

const CollocationsPhrasalVerbsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Collocations and Phrasal Verbs?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Collocations</strong> are natural word combinations that sound right to native speakers. 
          <strong>Phrasal verbs</strong> are verbs combined with prepositions or adverbs that create new meanings.
        </p>
        
        <QuickReference items={[
          "Collocations: natural word combinations",
          "Phrasal verbs: verbs with particles",
          "Essential for sounding natural",
          "They don't translate literally",
          "They improve fluency"
        ]} />
      </TheorySection>

      <TheorySection title="Collocations" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Collocations are word combinations that sound natural to native speakers.
        </p>

        <GrammarTable
          caption="Types of Collocations"
          headers={["Type", "Pattern", "Example", "Meaning"]}
          rows={[
            ["Adjective + Noun", "adj + noun", "heavy rain", "heavy rain"],
            ["Verb + Noun", "verb + noun", "make a decision", "make a decision"],
            ["Noun + Verb", "noun + verb", "rain falls", "it rains"],
            ["Verb + Adverb", "verb + adv", "work hard", "work hard"],
            ["Adverb + Adjective", "adv + adj", "completely wrong", "completely wrong"],
            ["Noun + Noun", "noun + noun", "coffee shop", "coffee shop"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Tomar una decisión (no 'hacer una decisión')"
            english="make a decision (not 'do a decision')"
            translation="Make a decision"
          />
          <Example 
            spanish="Lluvia fuerte (no 'lluvia fuerte')"
            english="heavy rain (not 'strong rain')"
            translation="Heavy rain"
          />
          <Example 
            spanish="Trabajar duro"
            english="work hard"
            translation="Work hard"
          />
        </div>

        <Rule 
          title="Collocations with 'Make' and 'Do'"
          description="Important differences:"
          examples={[
            "Make: make a decision, make money, make progress",
            "Do: do homework, do business, do exercise",
            "Make = create or produce something",
            "Do = activities or tasks"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Collocations can't be translated literally. It's better to learn them as complete units.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Phrasal verbs are verbs combined with prepositions or adverbs that create new meanings.
        </p>

        <GrammarTable
          caption="Types of Phrasal Verbs"
          headers={["Type", "Example", "Object Position"]}
          rows={[
            ["Intransitive", "wake up, sit down", "No object"],
            ["Separable transitive", "turn on, pick up", "Object can go between verb and particle"],
            ["Inseparable transitive", "look after, get over", "Object must go after the particle"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me despierto a las 7 AM"
            english="I wake up at 7 AM"
            translation="I wake up at 7 AM"
          />
          <Example 
            spanish="Enciende la luz / Enciende la luz"
            english="Turn on the light / Turn the light on"
            translation="Turn on the light"
          />
          <Example 
            spanish="Cuido a mis hijos"
            english="I look after my children"
            translation="I look after my children"
          />
        </div>

        <Rule 
          title="Separable vs Inseparable Phrasal Verbs"
          description="Important differences:"
          examples={[
            "Separable: the object can go between the verb and the particle",
            "Inseparable: the object always goes after the particle",
            "Pronouns: always go between verb and particle in separable verbs",
            "Examples: Turn it on (not 'Turn on it')"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> With separable phrasal verbs, if the object is a pronoun, it must go between the verb and the particle.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Phrasal Verbs" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some very common phrasal verbs you should know.
        </p>

        <GrammarTable
          caption="Phrasal Verbs with 'Get'"
          headers={["Phrasal Verb", "Meaning", "Example"]}
          rows={[
            ["get up", "get out of bed", "I get up at 7 AM every day"],
            ["get on", "board (vehicle), continue", "Get on the bus. Let's get on with work"],
            ["get off", "leave (vehicle)", "Get off the train at the next station"],
            ["get over", "recover from", "It took me weeks to get over the flu"],
            ["get along", "have a good relationship", "I get along well with my colleagues"],
            ["get away", "escape, go on holiday", "The thief got away. We need to get away"],
            ["get back", "return, reply", "I'll get back to you tomorrow"],
            ["get through", "finish, reach by phone", "I got through the exam. I can't get through to him"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me levanto a las 7 AM todos los días"
            english="I get up at 7 AM every day"
            translation="I get up at 7 AM every day"
          />
          <Example 
            spanish="Me llevo bien con mis colegas"
            english="I get along well with my colleagues"
            translation="I get along well with my colleagues"
          />
          <Example 
            spanish="Te contactaré mañana"
            english="I'll get back to you tomorrow"
            translation="I'll get back to you tomorrow"
          />
        </div>

        <GrammarTable
          caption="Phrasal Verbs with 'Look'"
          headers={["Phrasal Verb", "Meaning", "Example"]}
          rows={[
            ["look after", "take care of", "I look after my grandmother"],
            ["look for", "search for", "I'm looking for my keys"],
            ["look forward to", "anticipate eagerly", "I look forward to seeing you"],
            ["look up", "search for information", "Look up the word in the dictionary"],
            ["look down on", "despise", "Don't look down on others"],
            ["look into", "investigate", "The police will look into the matter"],
            ["look out", "watch out!", "Look out! There's a car coming"],
            ["look up to", "admire, respect", "Children look up to their parents"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Learn the most common phrasal verbs first. They're the ones used most in everyday conversation.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs with 'Put'" icon="📦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Phrasal verbs with 'put' are very common and useful.
        </p>

        <GrammarTable
          caption="Phrasal Verbs with 'Put'"
          headers={["Phrasal Verb", "Meaning", "Example"]}
          rows={[
            ["put on", "wear, turn on", "Put on your coat. Put on the music"],
            ["put off", "postpone", "Don't put off until tomorrow what you can do today"],
            ["put up with", "tolerate", "I can't put up with this noise anymore"],
            ["put away", "store, tidy away", "Put away your toys"],
            ["put down", "place down, criticise", "Put down the book. Don't put him down"],
            ["put up", "build, accommodate", "Put up a tent. Can you put me up for the night?"],
            ["put out", "extinguish, publish", "Put out the fire. The company put out a statement"],
            ["put through", "connect (phone), put through (stress)", "Put me through to the manager. The exam put students through a lot of stress"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ponte tu abrigo. Enciende la música"
            english="Put on your coat. Put on the music"
            translation="Put on your coat. Put on the music"
          />
          <Example 
            spanish="No pospongas para mañana lo que puedes hacer hoy"
            english="Don't put off until tomorrow what you can do today"
            translation="Don't put off until tomorrow what you can do today"
          />
          <Example 
            spanish="No puedo tolerar este ruido más"
            english="I can't put up with this noise anymore"
            translation="I can't put up with this noise anymore"
          />
        </div>

        <Rule 
          title="Multiple Meanings"
          description="Many phrasal verbs have multiple meanings:"
          examples={[
            "put on: put on clothes / turn on a device",
            "put out: put out a fire / publish news",
            "put through: connect a phone call / put someone through an experience",
            "Context determines the meaning"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Phrasal verbs with multiple meanings are common. Context helps you understand which one to use.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Collocations" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some very common collocations you should know.
        </p>

        <GrammarTable
          caption="Adjective + Noun Collocations"
          headers={["Adjective", "Correct Collocation", "Incorrect"]}
          rows={[
            ["heavy", "heavy rain, heavy traffic", "strong rain, strong traffic"],
            ["strong", "strong coffee, strong wind", "heavy coffee, heavy wind"],
            ["fast", "fast car, fast food", "quick car, quick food"],
            ["quick", "quick decision, quick meal", "fast decision, fast meal"],
            ["deep", "deep sleep, deep thought", "heavy sleep, heavy thought"],
            ["sharp", "sharp knife, sharp turn", "strong knife, strong turn"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Lluvia fuerte, tráfico pesado"
            english="heavy rain, heavy traffic"
            translation="Heavy rain, heavy traffic"
          />
          <Example 
            spanish="Café fuerte, viento fuerte"
            english="strong coffee, strong wind"
            translation="Strong coffee, strong wind"
          />
          <Example 
            spanish="Decisión rápida, comida rápida"
            english="quick decision, fast food"
            translation="Quick decision, fast food"
          />
        </div>

        <Rule 
          title="Collocations with 'Make' and 'Do'"
          description="Important differences:"
          examples={[
            "Make: make a decision, make a mistake, make money, make progress",
            "Do: do homework, do business, do exercise, do research",
            "Make = create or produce something",
            "Do = activities or tasks"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Collocations make your English sound more natural. It's better to memorise them than translate literally.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Incorrect collocations ❌<br/>
            <strong>Correct:</strong> Correct collocations ✅<br/>
            <em>do a decision, strong rain → make a decision, heavy rain</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Wrong pronoun position with separable phrasal verbs ❌<br/>
            <strong>Correct:</strong> Pronouns between verb and particle ✅<br/>
            <em>Turn on it. → Turn it on.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confusing separable and inseparable phrasal verbs ❌<br/>
            <strong>Correct:</strong> Use the correct object position ✅<br/>
            <em>Look the children after. → Look after the children.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Literal translation from your native language ❌<br/>
            <strong>Correct:</strong> Learn collocations as units ✅<br/>
            <em>strong coffee (if you mean 'heavy') → heavy coffee</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignoring context-dependent meanings ❌<br/>
            <strong>Correct:</strong> Consider context for the meaning ✅<br/>
            <em>The car broke down emotionally. → The car broke down mechanically. / She broke down emotionally.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Collocations"
            description="Learn collocations as complete units."
            examples={[
              "Don't translate them literally",
              "Memorise them as full phrases",
              "Practise with real examples",
              "Use collocation dictionaries"
            ]}
          />

          <Rule 
            title="2. Separable Phrasal Verbs"
            description="Handle object position correctly."
            examples={[
              "Object can go between verb and particle OR after",
              "Pronouns ALWAYS go between verb and particle",
              "Examples: Turn on the light / Turn the light on / Turn it on",
              "Never: Turn on it"
            ]}
          />

          <Rule 
            title="3. Inseparable Phrasal Verbs"
            description="The object always goes after the particle."
            examples={[
              "Object ALWAYS after the particle",
              "Never between verb and particle",
              "Examples: Look after the children (never: Look the children after)",
              "Learn which ones are inseparable"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'Please ___ the lights.'"
      options={[
        "turn off",
        "turn on",
        "turn up",
        "turn down"
      ]}
      correctAnswer={1}
      explanation="'Turn on' means to switch something on, such as lights, TV, radio, etc."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Choose the correct collocation: I need to ___ a decision about my future."
      options={[
        "do",
        "make",
        "take",
        "give"
      ]}
      correctAnswer={1}
      explanation="The correct collocation is 'make a decision' - we use 'make' for creating or producing something."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "With separable phrasal verbs, the object can always go between the verb and the particle.",
          isTrue: false,
          explanation: "False. With separable phrasal verbs, the object can go between the verb and particle OR after the particle, but if the object is a pronoun, it MUST go between the verb and particle."
        },
        {
          text: "Collocations are natural word combinations that sound natural to native speakers.",
          isTrue: true,
          explanation: "Correct. Collocations are natural combinations of words that native speakers use instinctively."
        },
        {
          text: "Phrasal verbs always have the same meaning regardless of context.",
          isTrue: false,
          explanation: "False. Many phrasal verbs have multiple meanings depending on context, like 'break down' (stop working vs. lose emotional control)."
        },
        {
          text: "It's okay to translate collocations literally from your native language.",
          isTrue: false,
          explanation: "False. Collocations should be learned as complete units, not translated literally, as they often don't translate directly."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct collocation for 'coffee' when describing its intensity?"
      options={[
        "strong coffee",
        "heavy coffee",
        "powerful coffee",
        "big coffee"
      ]}
      correctAnswer={0}
      explanation="The correct collocation is 'strong coffee' when describing the intensity or flavor of coffee."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence correctly uses a separable phrasal verb?"
      options={[
        "Turn on it.",
        "Turn it on.",
        "Look after it.",
        "Get over it."
      ]}
      correctAnswer={1}
      explanation="'Turn it on' is correct because 'turn on' is separable, so the pronoun 'it' goes between the verb and particle."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Put off' means to postpone something.",
          isTrue: true,
          explanation: "Correct. 'Put off' means to postpone or delay something: 'I put off the meeting'."
        },
        {
          text: "'Look after' and 'look for' have the same meaning.",
          isTrue: false,
          explanation: "Incorrect. 'Look after' means to take care of; 'look for' means to search for."
        },
        {
          text: "We say 'take a photo' not 'make a photo'.",
          isTrue: true,
          explanation: "Correct. In English we say 'take a photo/picture', not 'make'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She ___ her job last month.'"
      options={[
        "gave up",
        "gave in",
        "gave out",
        "gave away"
      ]}
      correctAnswer={0}
      explanation="'Give up' means to quit or abandon something: 'She gave up her job'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Choose the correct collocation: 'Can you ___ me a favor?'"
      options={[
        "make",
        "do",
        "take",
        "give"
      ]}
      correctAnswer={1}
      explanation="'Do someone a favor' is the correct collocation for asking for a favor."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Break down' can mean both 'to stop working' and 'to become emotional'.",
          isTrue: true,
          explanation: "Correct. 'Break down' has multiple meanings: a machine stops working or a person becomes emotional."
        },
        {
          text: "'Run into' means to exercise by running.",
          isTrue: false,
          explanation: "Incorrect. 'Run into' means to meet someone by chance or to collide with something."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I ___ my old friend at the supermarket yesterday.'"
      options={[
        "ran into",
        "ran out of",
        "ran away",
        "ran over"
      ]}
      correctAnswer={0}
      explanation="'Run into' means to meet someone by chance: 'I ran into my old friend'."
    />
  ];

  return (
    <TheoryLayout
      title="Collocations and Phrasal Verbs"
      description="Master collocations and phrasal verbs in English. Learn natural word combinations and verbs with particles to sound more natural and improve your fluency."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate vocabulary", "Understanding of verb patterns"]}
      estimatedTime="90 min"
    />
  );
};

export default CollocationsPhrasalVerbsPage;
