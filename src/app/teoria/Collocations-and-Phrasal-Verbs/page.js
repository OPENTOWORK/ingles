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

const CollocationsandPhrasalVerbsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Collocations and Phrasal Verbs?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Collocations</strong> are natural word combinations that sound right to native speakers. 
          <strong>Phrasal verbs</strong> are verbs combined with prepositions or particles that create new meanings.
        </p>
        
        <QuickReference items={[
          "Collocations: natural word combinations",
          "Phrasal verbs: verbs with particles",
          "Essential for sounding natural",
          "They do not translate literally",
          "They improve fluency"
        ]} />
      </TheorySection>

      <TheorySection title="Collocations" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Collocations are word pairs or groups that native speakers use instinctively.
        </p>

        <GrammarTable
          caption="Types of Collocations"
          headers={["Type", "Pattern", "Example", "Meaning"]}
          rows={[
            ["Adjective + noun", "adj + noun", "heavy rain", "intense rain"],
            ["Verb + noun", "verb + noun", "make a decision", "decide"],
            ["Noun + verb", "noun + verb", "rain falls", "it rains"],
            ["Verb + adverb", "verb + adv", "work hard", "work intensely"],
            ["Adverb + adjective", "adv + adj", "completely wrong", "totally wrong"],
            ["Noun + noun", "noun + noun", "coffee shop", "café"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="make a decision (not 'do a decision')" />
          <Example english="heavy rain (not 'strong rain')" />
          <Example english="work hard" />
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
          <strong>Tip:</strong> Collocations cannot be translated word for word. Learn them as complete units.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Phrasal verbs combine a verb with a particle to create a new meaning.
        </p>

        <GrammarTable
          caption="Types of Phrasal Verbs"
          headers={["Type", "Example", "Object Position"]}
          rows={[
            ["Intransitive", "wake up, sit down", "No object"],
            ["Transitive separable", "turn on, pick up", "Object can go between verb and particle"],
            ["Transitive inseparable", "look after, get over", "Object must follow the particle"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="I wake up at 7 AM" />
          <Example english="Turn on the light / Turn the light on" />
          <Example english="I look after my children" />
        </div>

        <Rule 
          title="Separable vs Inseparable Phrasal Verbs"
          description="Important differences:"
          examples={[
            "Separable: the object can go between verb and particle",
            "Inseparable: the object always follows the particle",
            "Pronouns always go between verb and particle in separable verbs",
            "Example: Turn it on (not 'Turn on it')"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> With separable phrasal verbs, pronouns must go between the verb and the particle.
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
            ["get on", "board / continue", "Get on the bus. Let's get on with work"],
            ["get off", "leave a vehicle", "Get off the train at the next station"],
            ["get over", "recover from", "It took me weeks to get over the flu"],
            ["get along", "have a good relationship", "I get along well with my colleagues"],
            ["get away", "escape / take a break", "The thief got away. We need to get away"],
            ["get back", "return / reply", "I'll get back to you tomorrow"],
            ["get through", "finish / reach by phone", "I got through the exam. I can't get through to him"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="I get up at 7 AM every day" />
          <Example english="I get along well with my colleagues" />
          <Example english="I'll get back to you tomorrow" />
        </div>

        <GrammarTable
          caption="Phrasal Verbs with 'Look'"
          headers={["Phrasal Verb", "Meaning", "Example"]}
          rows={[
            ["look after", "take care of", "I look after my grandmother"],
            ["look for", "search for", "I'm looking for my keys"],
            ["look forward to", "anticipate eagerly", "I look forward to seeing you"],
            ["look up", "search for information", "Look up the word in the dictionary"],
            ["look down on", "disrespect", "Don't look down on others"],
            ["look into", "investigate", "The police will look into the matter"],
            ["look out", "be careful", "Look out! There's a car coming"],
            ["look up to", "admire", "Children look up to their parents"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Learn the most common phrasal verbs first — they appear constantly in everyday conversation.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs with 'Put'" icon="📦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Phrasal verbs with <em>put</em> are very common and useful.
        </p>

        <GrammarTable
          caption="Phrasal Verbs with 'Put'"
          headers={["Phrasal Verb", "Meaning", "Example"]}
          rows={[
            ["put on", "wear / switch on", "Put on your coat. Put on the music"],
            ["put off", "postpone", "Don't put off until tomorrow what you can do today"],
            ["put up with", "tolerate", "I can't put up with this noise anymore"],
            ["put away", "store / tidy", "Put away your toys"],
            ["put down", "place down / criticize", "Put down the book. Don't put him down"],
            ["put up", "build / accommodate", "Put up a tent. Can you put me up for the night?"],
            ["put out", "extinguish / publish", "Put out the fire. The company put out a statement"],
            ["put through", "connect by phone / cause to experience", "Put me through to the manager"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Put on your coat. Put on the music" />
          <Example english="Don't put off until tomorrow what you can do today" />
          <Example english="I can't put up with this noise anymore" />
        </div>

        <Rule 
          title="Multiple Meanings"
          description="Many phrasal verbs have more than one meaning:"
          examples={[
            "put on: wear clothes / switch on a device",
            "put out: extinguish a fire / publish news",
            "put through: connect a call / put someone through an experience",
            "Context determines the meaning"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Multi-meaning phrasal verbs are common. Context tells you which meaning is intended.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Collocations" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some collocations you should know well.
        </p>

        <GrammarTable
          caption="Adjective + Noun Collocations"
          headers={["Adjective", "Correct Collocation", "Incorrect"]}
          rows={[
            ["heavy", "heavy rain, heavy traffic", "strong rain, strong traffic"],
            ["strong", "strong coffee, strong wind", "heavy coffee, heavy wind"],
            ["fast", "fast car, fast food", "quick car (for vehicles)"],
            ["quick", "quick decision, quick meal", "fast decision"],
            ["deep", "deep sleep, deep thought", "heavy sleep"],
            ["sharp", "sharp knife, sharp turn", "strong knife"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="heavy rain, heavy traffic" />
          <Example english="strong coffee, strong wind" />
          <Example english="quick decision, fast food" />
        </div>

        <Rule 
          title="Collocations with 'Make' and 'Do'"
          description="Important differences:"
          examples={[
            "Make: make a decision, make a mistake, make money, make progress",
            "Do: do homework, do business, do exercise, do research",
            "Make = create or produce",
            "Do = activities or tasks"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Collocations make your English sound natural. Memorize them rather than translating literally.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Wrong collocations ❌<br/>
            <strong>Correct:</strong> Natural collocations ✅<br/>
            <em>do a decision, strong rain → make a decision, heavy rain</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Wrong pronoun position with separable phrasal verbs ❌<br/>
            <strong>Correct:</strong> Pronoun between verb and particle ✅<br/>
            <em>Turn on it. → Turn it on.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mixing separable and inseparable patterns ❌<br/>
            <strong>Correct:</strong> Use the correct object position ✅<br/>
            <em>Look the children after. → Look after the children.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Literal translation from your native language ❌<br/>
            <strong>Correct:</strong> Learn collocations as units ✅<br/>
            <em>Translate by meaning, not word by word</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Collocations"
            description="Learn collocations as complete units."
            examples={[
              "Do not translate them literally",
              "Memorize them as phrases",
              "Practice with real examples",
              "Use collocation dictionaries"
            ]}
          />

          <Rule 
            title="2. Separable phrasal verbs"
            description="Use the correct object position."
            examples={[
              "Object: between verb and particle OR after the particle",
              "Pronoun: ALWAYS between verb and particle",
              "Turn on the light / Turn the light on / Turn it on",
              "Never: Turn on it"
            ]}
          />

          <Rule 
            title="3. Inseparable phrasal verbs"
            description="The object always follows the particle."
            examples={[
              "Object ALWAYS after the particle",
              "Never between verb and particle",
              "Look after the children (never: Look the children after)",
              "Learn which verbs are inseparable"
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
      options={["turn off", "turn on", "turn up", "turn down"]}
      correctAnswer={1}
      explanation="'Turn on' means to switch something on, such as lights, TV, or radio."
    />,
    <MultipleChoiceExercise
      key="2"
      question="Choose the correct collocation: I need to ___ a decision about my future."
      options={["do", "make", "take", "give"]}
      correctAnswer={1}
      explanation="The correct collocation is 'make a decision' — we use 'make' when creating or producing something."
    />,
    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "With separable phrasal verbs, the object can always go between the verb and the particle.",
          isTrue: false,
          explanation: "False. The object can go between the verb and particle OR after it, but pronouns must go between the verb and particle."
        },
        {
          text: "Collocations are natural word combinations that sound natural to native speakers.",
          isTrue: true,
          explanation: "Correct. Collocations are combinations native speakers use instinctively."
        },
        {
          text: "Phrasal verbs always have the same meaning regardless of context.",
          isTrue: false,
          explanation: "False. Many phrasal verbs have multiple meanings depending on context."
        },
        {
          text: "It's okay to translate collocations literally from your native language.",
          isTrue: false,
          explanation: "False. Learn collocations as complete units; they often do not translate directly."
        }
      ]}
    />,
    <MultipleChoiceExercise
      key="4"
      question="What is the correct collocation for 'coffee' when describing its intensity?"
      options={["strong coffee", "heavy coffee", "powerful coffee", "big coffee"]}
      correctAnswer={0}
      explanation="The correct collocation is 'strong coffee' when describing intensity or flavor."
    />,
    <MultipleChoiceExercise
      key="5"
      question="Which sentence correctly uses a separable phrasal verb?"
      options={["Turn on it.", "Turn it on.", "Look after it.", "Get over it."]}
      correctAnswer={1}
      explanation="'Turn it on' is correct because 'turn on' is separable, so the pronoun goes between the verb and particle."
    />,
    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Put off' means to postpone something.",
          isTrue: true,
          explanation: "Correct. 'Put off' means to postpone or delay something."
        },
        {
          text: "'Look after' and 'look for' have the same meaning.",
          isTrue: false,
          explanation: "Incorrect. 'Look after' means take care of; 'look for' means search for."
        },
        {
          text: "We say 'take a photo' not 'make a photo'.",
          isTrue: true,
          explanation: "Correct. In English we say 'take a photo/picture'."
        }
      ]}
    />,
    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She ___ her job last month.'"
      options={["gave up", "gave in", "gave out", "gave away"]}
      correctAnswer={0}
      explanation="'Give up' means to quit or stop doing something: 'She gave up her job'."
    />,
    <MultipleChoiceExercise
      key="8"
      question="Choose the correct collocation: 'Can you ___ me a favor?'"
      options={["make", "do", "take", "give"]}
      correctAnswer={1}
      explanation="'Do someone a favor' is the correct collocation."
    />,
    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Break down' can mean both 'to stop working' and 'to become emotional'.",
          isTrue: true,
          explanation: "Correct. 'Break down' can describe a machine failing or someone becoming upset."
        },
        {
          text: "'Run into' means to exercise by running.",
          isTrue: false,
          explanation: "Incorrect. 'Run into' means to meet someone by chance or collide with something."
        }
      ]}
    />,
    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I need to ___ early tomorrow for my flight.'"
      options={["get up", "get on", "get off", "get over"]}
      correctAnswer={0}
      explanation="'Get up' means to get out of bed: 'I need to get up early'."
    />
  ];

  return (
    <TheoryLayout
      title="Collocations and Phrasal Verbs"
      description="Master collocations and phrasal verbs in English. Learn natural word combinations and verb–particle patterns to sound more fluent."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate vocabulary", "Understanding of verb patterns"]}
      estimatedTime="90 min"
    />
  );
};

export default CollocationsandPhrasalVerbsPage;
