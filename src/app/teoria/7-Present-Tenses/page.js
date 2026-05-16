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

const PresentTensesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Present Tenses?" icon="⏰">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Present tenses</strong> are verb forms used to talk about actions, 
          states, and situations that occur in the present. There are three main present tenses in English.
        </p>
        
        <QuickReference items={[
          "Present Simple: routines, general facts",
          "Present Continuous: actions in progress",
          "Present Perfect: experiences, completed actions",
          "Each tense has specific uses",
          "The choice of tense depends on context"
        ]} />
      </TheorySection>

      <TheorySection title="Present Simple" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used to talk about routines, general facts, habits, and universal truths.
        </p>

        <GrammarTable
          caption="Present Simple Structure"
          headers={["Person", "Affirmative", "Negative", "Interrogative"]}
          rows={[
            ["I/You/We/They", "work", "don't work", "Do you work?"],
            ["He/She/It", "works", "doesn't work", "Does he work?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo trabajo todos los días"
            english="I work every day"
            translation="I work every day"
          />
          <Example 
            spanish="El sol sale por el este"
            english="The sun rises in the east"
            translation="The sun rises in the east"
          />
          <Example 
            spanish="Ella no vive aquí"
            english="She doesn't live here"
            translation="She doesn't live here"
          />
        </div>

        <Rule 
          title="Uses of Present Simple"
          description="When to use Present Simple:"
          examples={[
            "Daily routines: I wake up at 7 AM",
            "General facts: Water boils at 100°C",
            "Habits: She always drinks coffee",
            "Schedules: The train leaves at 8 PM"
          ]}
        />

        <Tip type="info">
          <strong>Remember:</strong> With he/she/it we add -s/-es to the verb. For negatives and questions we use "doesn't" and "does".
        </Tip>
      </TheorySection>

      <TheorySection title="Present Continuous" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used to talk about actions happening right now or around the present moment.
        </p>

        <GrammarTable
          caption="Present Continuous Structure"
          headers={["Person", "Affirmative", "Negative", "Interrogative"]}
          rows={[
            ["I", "am working", "am not working", "Am I working?"],
            ["You/We/They", "are working", "aren't working", "Are you working?"],
            ["He/She/It", "is working", "isn't working", "Is he working?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estoy escribiendo una carta"
            english="I am writing a letter"
            translation="I am writing a letter"
          />
          <Example 
            spanish="Los niños están jugando"
            english="The children are playing"
            translation="The children are playing"
          />
          <Example 
            spanish="¿Qué estás haciendo?"
            english="What are you doing?"
            translation="What are you doing?"
          />
        </div>

        <Rule 
          title="Uses of Present Continuous"
          description="When to use Present Continuous:"
          examples={[
            "Actions now: I'm reading a book",
            "Temporary actions: I'm living in London this year",
            "Future plans: We're meeting tomorrow",
            "Changes in progress: The weather is getting colder"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not use Present Continuous with stative verbs like "like", "know", "want", "need". 
          Use Present Simple: "I like pizza" (not "I am liking pizza").
        </Tip>
      </TheorySection>

      <TheorySection title="Present Perfect" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used to talk about experiences, actions completed at an unspecified time, and actions that started in the past and continue in the present.
        </p>

        <GrammarTable
          caption="Present Perfect Structure"
          headers={["Person", "Affirmative", "Negative", "Interrogative"]}
          rows={[
            ["I/You/We/They", "have worked", "haven't worked", "Have you worked?"],
            ["He/She/It", "has worked", "hasn't worked", "Has he worked?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="He visitado París"
            english="I have visited Paris"
            translation="I have visited Paris"
          />
          <Example 
            spanish="Ella ha vivido aquí por 5 años"
            english="She has lived here for 5 years"
            translation="She has lived here for 5 years"
          />
          <Example 
            spanish="¿Has terminado tu tarea?"
            english="Have you finished your homework?"
            translation="Have you finished your homework?"
          />
        </div>

        <Rule 
          title="Uses of Present Perfect"
          description="When to use Present Perfect:"
          examples={[
            "Experiences: I have been to Japan",
            "Recent actions: I have just finished eating",
            "Duration until now: I have lived here since 2020",
            "Present result: I have lost my keys"
          ]}
        />

        <Tip type="success">
          <strong>Common connectors:</strong> "already", "just", "yet", "ever", "never", "since", "for".
        </Tip>
      </TheorySection>

      <TheorySection title="Comparing Tenses" icon="⚖️">
        <GrammarTable
          caption="When to Use Each Tense"
          headers={["Tense", "When to Use", "Example"]}
          rows={[
            ["Present Simple", "Routines, general facts", "I drink coffee every morning"],
            ["Present Continuous", "Actions now, future plans", "I'm drinking coffee now"],
            ["Present Perfect", "Experiences, completed actions", "I have drunk 3 cups today"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo trabajo en una oficina (hecho general)"
            english="I work in an office"
            translation="I work in an office"
          />
          <Example 
            spanish="Estoy trabajando en un proyecto (ahora mismo)"
            english="I am working on a project"
            translation="I am working on a project"
          />
          <Example 
            spanish="He trabajado aquí por 3 años (experiencia)"
            english="I have worked here for 3 years"
            translation="I have worked here for 3 years"
          />
        </div>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I am liking pizza" ❌<br/>
            <strong>Correct:</strong> "I like pizza" ✅<br/>
            <em>Stative verbs do not use Present Continuous</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I have 25 years old" ❌<br/>
            <strong>Correct:</strong> "I am 25 years old" ✅<br/>
            <em>For age we use 'to be', not 'to have'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am go to school" ❌<br/>
            <strong>Correct:</strong> "I go to school" ✅<br/>
            <em>Do not mix 'am' with verbs in the infinitive</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I have been to Paris yesterday" ❌<br/>
            <strong>Correct:</strong> "I went to Paris yesterday" ✅<br/>
            <em>Present Perfect is not used with a specific past time</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Words" icon="🔑">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Simple:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              always, usually, often, sometimes, rarely, never, every day, on Mondays
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Continuous:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              now, at the moment, currently, right now, today, this week
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Perfect:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              already, just, yet, ever, never, since, for, recently, lately
            </p>
          </div>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'I ___ in a hospital.'"
      options={[
        "am working",
        "work",
        "worked",
        "have worked"
      ]}
      correctAnswer={1}
      explanation="'Work' is Present Simple for a general fact or habitual routine."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which is the correct form to complete: 'She ___ to school every day'?"
      options={[
        "is going",
        "goes",
        "has gone",
        "go"
      ]}
      correctAnswer={1}
      explanation="For daily routines we use Present Simple. With 'she' we add -s to the verb: 'goes'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I am liking this movie' is correct.",
          isTrue: false,
          explanation: "Incorrect. 'Like' is a stative verb; we do not use Present Continuous. Correct: 'I like this movie'."
        },
        {
          text: "'I have been to Paris' means I visited Paris at some point in my life.",
          isTrue: true,
          explanation: "Correct. Present Perfect is used for life experiences without a specific time."
        },
        {
          text: "'I work here since 2020' is correct.",
          isTrue: false,
          explanation: "Incorrect. With 'since' we use Present Perfect: 'I have worked here since 2020'."
        },
        {
          text: "'What are you doing now?' is correct.",
          isTrue: true,
          explanation: "Correct. For actions in progress now we use Present Continuous."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which is the correct form to complete: 'I ___ this book for two hours'?"
      options={[
        "am reading",
        "read",
        "have been reading",
        "have read"
      ]}
      correctAnswer={2}
      explanation="For actions that started in the past and continue in the present we use Present Perfect Continuous: 'have been reading'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the correct form to complete: 'She ___ never ___ to Japan'?"
      options={[
        "is, been",
        "has, been",
        "have, been",
        "was, been"
      ]}
      correctAnswer={1}
      explanation="With 'never' and life experiences we use Present Perfect: 'She has never been to Japan'."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'I ___ my homework right now.'"
      options={[
        "do",
        "am doing",
        "have done",
        "did"
      ]}
      correctAnswer={1}
      explanation="'Right now' indicates an action in progress at this moment, so we use Present Continuous."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is correct?"
      options={[
        "He is having a car",
        "He has a car",
        "He is have a car",
        "He having a car"
      ]}
      correctAnswer={1}
      explanation="'Have' for possession is not used in the continuous. We use Present Simple: 'He has a car'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'How long ___ you ___ English?'"
      options={[
        "do, study",
        "are, studying",
        "have, studied",
        "did, study"
      ]}
      correctAnswer={2}
      explanation="'How long' with an action that started in the past and continues requires Present Perfect."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Which is the correct form?"
      options={[
        "She always is complaining",
        "She is always complaining",
        "She always complains",
        "Both B and C are correct"
      ]}
      correctAnswer={3}
      explanation="Both are correct: 'always complains' (habit) and 'is always complaining' (annoyance)."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I ___ three cups of coffee today.'"
      options={[
        "drink",
        "am drinking",
        "have drunk",
        "drank"
      ]}
      correctAnswer={2}
      explanation="'Today' is a period that has not finished yet, so we use Present Perfect."
    />
  ];

  return (
    <TheoryLayout
      title="Present Tenses"
      description="Master the three English present tenses: Simple, Continuous, and Perfect. Learn when to use each one and avoid common mistakes."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Verb to be", "Pronouns", "Basic vocabulary"]}
      estimatedTime="60 min"
    />
  );
};

export default PresentTensesPage;
