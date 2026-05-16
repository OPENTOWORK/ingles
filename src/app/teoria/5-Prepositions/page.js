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

const PrepositionsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What are Prepositions?" icon="📍">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Prepositions</strong> are words that show the relationship between a noun or pronoun 
          and other words in the sentence. They indicate location, time, direction, cause, and other relationships.
        </p>
        
        <QuickReference items={[
          "Place: in, on, at, under, over, between",
          "Time: in, on, at, for, since, during",
          "Direction: to, from, into, out of, through",
          "Cause: because of, due to, thanks to",
          "They are always followed by nouns/pronouns"
        ]} />
      </TheorySection>

      <TheorySection title="Prepositions of Place" icon="🏠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          They show where something or someone is in relation to another object or place.
        </p>

        <GrammarTable
          caption="Main Prepositions of Place"
          headers={["Preposition", "Use", "Example", "Meaning"]}
          rows={[
            ["in", "Inside enclosed spaces", "in the room", "in the room"],
            ["on", "On surfaces", "on the table", "on the table"],
            ["at", "Specific point", "at the station", "at the station"],
            ["under", "Below", "under the bed", "under the bed"],
            ["over", "Above (without touching)", "over the bridge", "over the bridge"],
            ["between", "Between two things", "between the cars", "between the cars"],
            ["next to", "Next to", "next to the park", "next to the park"],
            ["behind", "Behind", "behind the house", "behind the house"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El libro está en la mesa"
            english="The book is on the table"
            translation="The book is on the table"
          />
          <Example 
            spanish="Estoy en la cocina"
            english="I am in the kitchen"
            translation="I am in the kitchen"
          />
          <Example 
            spanish="El gato está debajo de la silla"
            english="The cat is under the chair"
            translation="The cat is under the chair"
          />
        </div>

        <Rule 
          title="Using In, On, At for Place"
          description="When to use each one:"
          examples={[
            "In: enclosed spaces (in the car, in the room)",
            "On: surfaces (on the table, on the wall)",
            "At: specific points (at home, at school, at work)"
          ]}
        />

        <Tip type="info">
          <strong>Remember:</strong> &quot;At home&quot; is an exception — we use &quot;at&quot; even though it is an enclosed space.
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions of Time" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          They show when something happens in relation to time.
        </p>

        <GrammarTable
          caption="Main Prepositions of Time"
          headers={["Preposition", "Use", "Example", "Meaning"]}
          rows={[
            ["in", "Months, years, seasons", "in January, in 2023", "in January, in 2023"],
            ["on", "Specific days, dates", "on Monday, on July 4th", "on Monday, on July 4th"],
            ["at", "Specific times", "at 3 PM, at night", "at 3 PM, at night"],
            ["for", "Duration", "for 2 hours, for a week", "for 2 hours, for a week"],
            ["since", "From a specific point", "since Monday, since 2020", "since Monday, since 2020"],
            ["during", "During a period", "during the summer", "during the summer"],
            ["until", "Until a moment", "until 5 PM", "until 5 PM"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy al trabajo los lunes"
            english="I go to work on Mondays"
            translation="I go to work on Mondays"
          />
          <Example 
            spanish="Nací en 1990"
            english="I was born in 1990"
            translation="I was born in 1990"
          />
          <Example 
            spanish="La reunión es a las 3 PM"
            english="The meeting is at 3 PM"
            translation="The meeting is at 3 PM"
          />
        </div>

        <Rule 
          title="Using In, On, At for Time"
          description="When to use each one:"
          examples={[
            "In: longer periods (in January, in the morning)",
            "On: specific days (on Monday, on Christmas Day)",
            "At: specific moments (at 3 PM, at midnight)"
          ]}
        />

        <Tip type="warning">
          <strong>Exceptions:</strong> &quot;At night&quot;, &quot;at the weekend&quot;, &quot;in the morning/afternoon/evening&quot;.
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions of Direction" icon="➡️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          They show where something or someone is moving to or from.
        </p>

        <GrammarTable
          caption="Prepositions of Direction"
          headers={["Preposition", "Use", "Example", "Meaning"]}
          rows={[
            ["to", "Toward a place", "go to school", "go to school"],
            ["from", "From a place", "come from Spain", "come from Spain"],
            ["into", "Enter a place", "walk into the room", "walk into the room"],
            ["out of", "Leave a place", "get out of the car", "get out of the car"],
            ["through", "Through", "walk through the park", "walk through the park"],
            ["across", "Across", "walk across the street", "walk across the street"],
            ["up", "Upward", "go up the stairs", "go up the stairs"],
            ["down", "Downward", "go down the hill", "go down the hill"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy a la tienda"
            english="I go to the store"
            translation="I go to the store"
          />
          <Example 
            spanish="Vengo de la oficina"
            english="I come from the office"
            translation="I come from the office"
          />
          <Example 
            spanish="Camino por el parque"
            english="I walk through the park"
            translation="I walk through the park"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> &quot;To&quot; shows movement toward a place; &quot;from&quot; shows movement away from a place.
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions with Verbs" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some verbs are always followed by specific prepositions.
        </p>

        <GrammarTable
          caption="Common Verbs with Prepositions"
          headers={["Verb", "Preposition", "Example", "Meaning"]}
          rows={[
            ["listen", "to", "listen to music", "listen to music"],
            ["look", "at", "look at the picture", "look at the picture"],
            ["wait", "for", "wait for the bus", "wait for the bus"],
            ["depend", "on", "depend on you", "depend on you"],
            ["believe", "in", "believe in God", "believe in God"],
            ["think", "about", "think about it", "think about it"],
            ["talk", "to/with", "talk to my friend", "talk to my friend"],
            ["arrive", "at/in", "arrive at the station", "arrive at the station"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Escucho música todos los días"
            english="I listen to music every day"
            translation="I listen to music every day"
          />
          <Example 
            spanish="Espero el autobús"
            english="I wait for the bus"
            translation="I wait for the bus"
          />
          <Example 
            spanish="Pienso en mi familia"
            english="I think about my family"
            translation="I think about my family"
          />
        </div>

        <Tip type="warning">
          <strong>Important!</strong> These combinations are fixed. You cannot change the preposition.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I am in Monday" ❌<br/>
            <strong>Correct:</strong> "I am on Monday" ✅<br/>
            <em>For specific days we use &apos;on&apos;</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I listen music" ❌<br/>
            <strong>Correct:</strong> "I listen to music" ✅<br/>
            <em>The verb &apos;listen&apos; always goes with &apos;to&apos;</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I go to home" ❌<br/>
            <strong>Correct:</strong> "I go home" ✅<br/>
            <em>With &apos;home&apos; we do not use &apos;to&apos;</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am at the bed" ❌<br/>
            <strong>Correct:</strong> "I am in bed" ✅<br/>
            <em>To be in bed we use &apos;in&apos;</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Fixed prepositions"
            description="Some verb-preposition combinations are fixed."
            examples={[
              "Listen to (listen)",
              "Wait for (wait)",
              "Believe in (believe in)"
            ]}
          />

          <Rule 
            title="2. No preposition"
            description="Some verbs do not need a preposition."
            examples={[
              "Go home (go home)",
              "Arrive here (arrive here)",
              "Enter the room (enter the room)"
            ]}
          />

          <Rule 
            title="3. Difference between 'in' and 'at'"
            description="'In' for enclosed spaces, 'at' for specific points."
            examples={[
              "In the car (in the car)",
              "At the car (by the car)",
              "In the hospital (in the hospital as a patient)",
              "At the hospital (at the hospital as a visitor)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'I live _____ Spain _____ 2020.'"
      options={[
        "in, from",
        "in, since",
        "at, from",
        "on, since"
      ]}
      correctAnswer={1}
      explanation="We use 'in' for countries and 'since' for a specific point in time."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which is the correct form to complete: 'I listen ___ music every day'?"
      options={[
        "at",
        "to",
        "in",
        "on"
      ]}
      correctAnswer={1}
      explanation="The verb 'listen' is always followed by 'to': 'I listen to music every day'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I am at the bed' is correct.",
          isTrue: false,
          explanation: "Incorrect. To be in bed we use 'in': 'I am in bed'."
        },
        {
          text: "'I go to home' is correct.",
          isTrue: false,
          explanation: "Incorrect. With 'home' we do not use 'to': 'I go home'."
        },
        {
          text: "'The meeting is on Monday' is correct.",
          isTrue: true,
          explanation: "Correct. For specific days we use 'on'."
        },
        {
          text: "'I wait for the bus' is correct.",
          isTrue: true,
          explanation: "Correct. The verb 'wait' goes with 'for'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which is the correct form to complete: 'I was born ___ 1990'?"
      options={[
        "on",
        "at",
        "in",
        "for"
      ]}
      correctAnswer={2}
      explanation="For years we use 'in': 'I was born in 1990'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the correct form to complete: 'The book is ___ the table'?"
      options={[
        "in",
        "on",
        "at",
        "under"
      ]}
      correctAnswer={1}
      explanation="For surfaces we use 'on': 'The book is on the table'."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "We use 'in' for months and years.",
          isTrue: true,
          explanation: "Correct. We use 'in' for months (in January) and years (in 2023)."
        },
        {
          text: "We say 'at night' but 'in the morning'.",
          isTrue: true,
          explanation: "Correct. We say 'at night' but 'in the morning/afternoon/evening'."
        },
        {
          text: "'I'm interested about music' is correct.",
          isTrue: false,
          explanation: "Incorrect. We say 'interested IN music', not 'about'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I'll see you ___ Friday ___ 3 PM.'"
      options={[
        "in / at",
        "on / at",
        "at / in",
        "on / in"
      ]}
      correctAnswer={1}
      explanation="We use 'on' for days (on Friday) and 'at' for specific times (at 3 PM)."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which is the correct preposition: 'She is good ___ mathematics'?"
      options={[
        "in",
        "at",
        "on",
        "with"
      ]}
      correctAnswer={1}
      explanation="We say 'good AT' something: 'She is good at mathematics'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'I go to work by car' means I drive to work.",
          isTrue: true,
          explanation: "Correct. 'By car' indicates the means of transport used."
        },
        {
          text: "We can say 'I live in London' and 'I live at London'.",
          isTrue: false,
          explanation: "Incorrect. For cities we use 'in': 'I live IN London'. 'At' is used for specific addresses."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'The cat is hiding ___ the bed.'"
      options={[
        "on",
        "in",
        "under",
        "at"
      ]}
      correctAnswer={2}
      explanation="'Under' means below: 'The cat is hiding under the bed'."
    />
  ];

  return (
    <TheoryLayout
      title="Prepositions"
      description="Master prepositions in English: place, time, direction, and verbs with prepositions. Essential for expressing spatial and temporal relationships."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of nouns and verbs"]}
      estimatedTime="60 min"
    />
  );
};

export default PrepositionsPage;






















