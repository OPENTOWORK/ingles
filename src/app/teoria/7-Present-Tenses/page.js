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
import { buildPresentTensesExercises } from './presentTensesExercises';
import {
  PresentTensesPracticeHub,
  PresentTensesFillPractice,
  PresentTensesKeywordPractice,
} from '@/components/theory/present-tenses/PresentTensesInteractive';

const PresentTensesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Present Tenses?" icon="🎯">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Present tenses</strong> are verb forms used to talk about actions, 
          states, and situations that occur in the present. There are three main present tenses in English.
        </p>
        
        <QuickReference
          variant="green"
          items={[
            {
              title: 'Present Simple: routines, general facts',
              description:
                'Used for habits, daily routines, and things that are always true.',
              example: (
                <>
                  I <strong>go</strong> to work every day.
                </>
              ),
            },
            {
              title: 'Present Continuous: actions in progress',
              description: 'Used for actions happening now or around now.',
              example: (
                <>
                  I <strong>am studying</strong> right now.
                </>
              ),
            },
            {
              title: 'Present Perfect: experiences, completed actions',
              description:
                'Used for past actions with a result in the present or life experiences.',
              example: (
                <>
                  I <strong>have visited</strong> Paris.
                </>
              ),
            },
            {
              title: 'Each tense has specific uses',
              description: 'Knowing when and how to use each tense helps your communication.',
              example: (
                <>
                  Use the right tense to be <strong>clear</strong> and <strong>natural</strong>.
                </>
              ),
            },
            {
              title: 'The choice of tense depends on context',
              description: 'Time expressions and the situation help you decide.',
              example: (
                <>
                  Think about <strong>when the action happens</strong> and its{' '}
                  <strong>connection to now</strong>.
                </>
              ),
            },
          ]}
        />

        <PresentTensesPracticeHub embedded />
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
            useTag="Daily routine"
            english="I work every day"
            spanish="Yo trabajo todos los días"
            why="The action repeats on a regular schedule. It is part of your everyday life, not something happening only at this moment."
            whyLabel="Why Present Simple?"
          />
          <Example
            useTag="General fact"
            english="The sun rises in the east"
            spanish="El sol sale por el este"
            why="Present Simple expresses truths that are always true — scientific facts and laws of nature do not change with time."
            whyLabel="Why Present Simple?"
          />
          <Example
            useTag="Permanent situation"
            english="She doesn't live here"
            spanish="Ella no vive aquí"
            why="We describe a stable state that stays true over a long period. Where someone lives is a long-term situation, not a temporary action in progress."
            whyLabel="Why Present Simple?"
          />
        </div>

        <Rule
          title="Uses of Present Simple"
          description="When to use Present Simple (each use links to the examples above):"
          examples={[
            'Daily routines → "I work every day" — repeated actions in your normal week',
            'General facts → "The sun rises in the east" — truths that are always valid',
            'Permanent situations → "She doesn\'t live here" — states that continue over time',
            'Habits: She always drinks coffee — repeated behaviour with always / usually / often',
            'Schedules: The train leaves at 8 PM — fixed timetables and programmes',
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
            useTag="Action in progress"
            english="I am writing a letter"
            spanish="Estoy escribiendo una carta"
            why="Am/is/are + -ing shows the action is unfinished and happening around now — at the moment of speaking."
            whyLabel="Why Present Continuous?"
          />
          <Example
            useTag="Happening now"
            english="The children are playing"
            spanish="Los niños están jugando"
            why="We focus on the activity as it unfolds right now, not on a habit or a finished event."
            whyLabel="Why Present Continuous?"
          />
          <Example
            useTag="Question about now"
            english="What are you doing?"
            spanish="¿Qué estás haciendo?"
            why="Questions with am/is/are + -ing ask about someone's current activity, not their routine or past experience."
            whyLabel="Why Present Continuous?"
          />
        </div>

        <Rule 
          title="Uses of Present Continuous"
          description="When to use Present Continuous (linked to the examples above):"
          examples={[
            'Action in progress → "I am writing a letter" — the action is ongoing now',
            'Happening now → "The children are playing" — activity at this moment',
            'Questions about now → "What are you doing?" — asking about the current activity',
            "Temporary situations: I'm living in London this year — not permanent",
            "Future arrangements: We're meeting tomorrow — planned near future",
            "Changing situations: The weather is getting colder — development in progress",
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
            useTag="Life experience"
            english="I have visited Paris"
            spanish="He visitado París"
            why="Have/has + past participle can describe something you have done at some point in your life — the exact time is not important."
            whyLabel="Why Present Perfect?"
          />
          <Example
            useTag="Duration until now"
            english="She has lived here for 5 years"
            spanish="Ella ha vivido aquí por 5 años"
            why="With for or since, Present Perfect connects a past start time to the present — the situation still continues now."
            whyLabel="Why Present Perfect?"
          />
          <Example
            useTag="Recent result"
            english="Have you finished your homework?"
            spanish="¿Has terminado tu tarea?"
            why="We often use Present Perfect for actions completed recently when the result matters now — e.g. whether the homework is done."
            whyLabel="Why Present Perfect?"
          />
        </div>

        <Rule 
          title="Uses of Present Perfect"
          description="When to use Present Perfect (linked to the examples above):"
          examples={[
            'Life experience → "I have visited Paris" — when the time is unspecified',
            'Duration until now → "She has lived here for 5 years" — past start, still true now',
            'Recent result → "Have you finished your homework?" — completed action with present relevance',
            "Present result: I have lost my keys — you cannot find them now",
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
            useTag="Present Simple"
            english="I work in an office"
            spanish="Yo trabajo en una oficina"
            why="This is your normal job — a general fact about your life, not an action in progress at this second."
            whyLabel="Why Present Simple?"
          />
          <Example
            useTag="Present Continuous"
            english="I am working on a project"
            spanish="Estoy trabajando en un proyecto"
            why="The -ing form shows a temporary focus: you are busy with this project around now, even if your job in general is the same."
            whyLabel="Why Present Continuous?"
          />
          <Example
            useTag="Present Perfect"
            english="I have worked here for 3 years"
            spanish="He trabajado aquí por 3 años"
            why="Have + past participle + for links past time to the present: you started before and you are still here — the period includes now."
            whyLabel="Why Present Perfect?"
          />
        </div>

        <div className="pt-section-practice">
          <PresentTensesFillPractice />
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
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          Study the lists below, then practise matching keywords to the correct tense.
        </p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <h4 style={{ color: '#4338ca', margin: '0 0 0.35rem', fontSize: '0.95rem' }}>Present Simple</h4>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>
              always, usually, often, sometimes, rarely, never, every day, on Mondays
            </p>
          </div>
          <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: '#ecfeff', border: '1px solid #a5f3fc' }}>
            <h4 style={{ color: '#0e7490', margin: '0 0 0.35rem', fontSize: '0.95rem' }}>Present Continuous</h4>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>
              now, at the moment, currently, right now, today, this week
            </p>
          </div>
          <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
            <h4 style={{ color: '#6d28d9', margin: '0 0 0.35rem', fontSize: '0.95rem' }}>Present Perfect</h4>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>
              already, just, yet, ever, never, since, for, recently, lately
            </p>
          </div>
        </div>
        <PresentTensesKeywordPractice />
      </TheorySection>
    </>
  );

  return (
    <TheoryLayout
      enableInlinePractice={false}
      title="Present Tenses"
      description="Master the three English present tenses: Simple, Continuous, and Perfect. Learn when to use each one and avoid common mistakes."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildPresentTensesExercises}
      prerequisites={["Verb to be", "Pronouns", "Basic vocabulary"]}
      estimatedTime="60 min"
    />
  );
};

export default PresentTensesPage;
