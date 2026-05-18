'use client';
import { build8PastTensesExercises } from './pasttensesExercises';
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


const PastTensesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Past Tenses?" icon="⏰">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Past tenses</strong> are verb forms used to talk about actions, 
          states, and situations that occurred in the past. There are several past tenses in English, each with specific uses.
        </p>
        
        <QuickReference items={[
          "Past Simple: completed actions in the past",
          "Past Continuous: actions in progress in the past",
          "Past Perfect: actions that happened before another",
          "Past Perfect Continuous: duration before another action",
          "The choice of tense depends on context"
        ]} />
      </TheorySection>

      <TheorySection title="Past Simple" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used to talk about actions completed at a specific time in the past.
        </p>

        <GrammarTable
          caption="Past Simple Structure"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Affirmative", "Subject + past tense verb", "I worked yesterday"],
            ["Negative", "Subject + didn't + base verb", "I didn't work yesterday"],
            ["Interrogative", "Did + subject + base verb", "Did you work yesterday?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ayer trabajé hasta tarde"
            english="Yesterday I worked until late"
          />
          <Example 
            spanish="Ella no fue a la fiesta"
            english="She didn't go to the party"
          />
          <Example 
            spanish="¿Viste la película?"
            english="Did you see the movie?"
          />
        </div>

        <Rule 
          title="Uses of Past Simple"
          description="When to use Past Simple:"
          examples={[
            "Completed actions: I finished my homework",
            "Specific events: She was born in 1990",
            "Sequence of events: I woke up, had breakfast, and left",
            "With specific time: I saw him last week"
          ]}
        />

        <Tip type="info">
          <strong>Irregular verbs:</strong> Many English verbs are irregular in the past (go → went, see → saw, be → was/were). 
          It is important to memorize them.
        </Tip>
      </TheorySection>

      <TheorySection title="Past Continuous" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used to talk about actions that were in progress at a specific moment in the past.
        </p>

        <GrammarTable
          caption="Past Continuous Structure"
          headers={["Person", "Affirmative", "Negative", "Interrogative"]}
          rows={[
            ["I/He/She/It", "was working", "wasn't working", "Was I working?"],
            ["You/We/They", "were working", "weren't working", "Were you working?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="A las 8 PM estaba estudiando"
            english="At 8 PM I was studying"
          />
          <Example 
            spanish="Los niños estaban jugando cuando llegué"
            english="The children were playing when I arrived"
          />
          <Example 
            spanish="¿Qué estabas haciendo ayer?"
            english="What were you doing yesterday?"
          />
        </div>

        <Rule 
          title="Uses of Past Continuous"
          description="When to use Past Continuous:"
          examples={[
            "Actions in progress: I was reading when you called",
            "Context for another action: While I was cooking, the phone rang",
            "Scene description: The sun was shining, birds were singing",
            "Interrupted actions: I was sleeping when the alarm went off"
          ]}
        />

        <Tip type="success">
          <strong>Common connectors:</strong> "while", "when", "as", "at that time", "at that moment".
        </Tip>
      </TheorySection>

      <TheorySection title="Past Perfect" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used to talk about actions that happened before another action in the past.
        </p>

        <GrammarTable
          caption="Past Perfect Structure"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Affirmative", "Subject + had + past participle", "I had finished my work"],
            ["Negative", "Subject + hadn't + past participle", "I hadn't finished my work"],
            ["Interrogative", "Had + subject + past participle", "Had you finished your work?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ya había terminado cuando llegaste"
            english="I had already finished when you arrived"
          />
          <Example 
            spanish="No había visto esa película antes"
            english="I hadn't seen that movie before"
          />
          <Example 
            spanish="¿Habías estado en París antes?"
            english="Had you been to Paris before?"
          />
        </div>

        <Rule 
          title="Uses of Past Perfect"
          description="When to use Past Perfect:"
          examples={[
            "Earlier action: I had eaten before I went to the party",
            "Previous experiences: She had never seen snow before",
            "Past result: I was tired because I had worked all day",
            "With 'by the time': By the time we arrived, they had left"
          ]}
        />

        <Tip type="warning">
          <strong>Order of events:</strong> Past Perfect = earlier action, Past Simple = more recent action.
        </Tip>
      </TheorySection>

      <TheorySection title="Comparing Past Tenses" icon="⚖️">
        <GrammarTable
          caption="When to Use Each Past Tense"
          headers={["Tense", "When to Use", "Example"]}
          rows={[
            ["Past Simple", "Completed actions", "I worked yesterday"],
            ["Past Continuous", "Actions in progress", "I was working at 3 PM"],
            ["Past Perfect", "Action before another", "I had worked before I left"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Llegué a casa a las 6 PM (acción completada)"
            english="I arrived home at 6 PM"
          />
          <Example 
            spanish="Estaba cocinando cuando llegaste (acción en progreso)"
            english="I was cooking when you arrived"
          />
          <Example 
            spanish="Ya había cocinado cuando llegaste (acción anterior)"
            english="I had already cooked when you arrived"
          />
        </div>
      </TheorySection>

      <TheorySection title="Important Irregular Verbs" icon="📚">
        <GrammarTable
          caption="Common Irregular Verbs"
          headers={["Infinitive", "Past Simple", "Past Participle", "Meaning"]}
          rows={[
            ["be", "was/were", "been", "to be"],
            ["have", "had", "had", "to have"],
            ["do", "did", "done", "to do"],
            ["go", "went", "gone", "to go"],
            ["see", "saw", "seen", "to see"],
            ["take", "took", "taken", "to take"],
            ["come", "came", "come", "to come"],
            ["get", "got", "gotten", "to get"],
            ["make", "made", "made", "to make"],
            ["know", "knew", "known", "to know"]
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Irregular verbs are essential. Practice the most common ones until you know them completely.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I did went to school" ❌<br/>
            <strong>Correct:</strong> "I went to school" ✅<br/>
            <em>With 'did' we use the base form, not the past tense</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I was go to the store" ❌<br/>
            <strong>Correct:</strong> "I was going to the store" ✅<br/>
            <em>Past Continuous uses 'was/were + ing'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I had went to Paris" ❌<br/>
            <strong>Correct:</strong> "I had gone to Paris" ✅<br/>
            <em>Past Perfect uses 'had + past participle'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Yesterday I have seen him" ❌<br/>
            <strong>Correct:</strong> "Yesterday I saw him" ✅<br/>
            <em>With a specific past time we use Past Simple</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Words" icon="🔑">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Past Simple:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              yesterday, last week, ago, in 2020, when I was young, once upon a time
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Past Continuous:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              while, when, at that time, at that moment, during, as
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Past Perfect:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              already, just, never, before, by the time, until
            </p>
          </div>
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Past Tenses"
      description="Master all English past tenses: Simple, Continuous, and Perfect. Learn when to use each one and practice irregular verbs."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build8PastTensesExercises}
      prerequisites={["Present Tenses", "Verb to be", "Basic vocabulary"]}
      estimatedTime="70 min"
    />
  );
};

export default PastTensesPage;
