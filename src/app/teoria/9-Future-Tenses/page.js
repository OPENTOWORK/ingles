'use client';
import { build9FutureTensesExercises } from './futureTensesExercises';
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


const FutureTensesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Future Tenses?" icon="🔮">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Future tenses</strong> are verb forms used to talk about actions, 
          events, and situations that will happen in the future. English has several ways to express the future, each with specific uses.
        </p>
        
        <QuickReference items={[
          "Will: spontaneous decisions, predictions",
          "Going to: plans, intentions, evidence",
          "Present Continuous: fixed plans, arrangements",
          "Present Simple: schedules, timetables",
          "Future Continuous: actions in progress in the future"
        ]} />
      </TheorySection>

      <TheorySection title="Will (Simple Future)" icon="✨">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for spontaneous decisions, predictions, promises, and offers.
        </p>

        <GrammarTable
          caption="Will Structure"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Affirmative", "Subject + will + base verb", "I will help you"],
            ["Negative", "Subject + won't + base verb", "I won't be late"],
            ["Interrogative", "Will + subject + base verb", "Will you come tomorrow?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Te ayudaré con tu tarea"
            english="I will help you with your homework"
          />
          <Example 
            spanish="Creo que lloverá mañana"
            english="I think it will rain tomorrow"
          />
          <Example 
            spanish="¿Vendrás a la fiesta?"
            english="Will you come to the party?"
          />
        </div>

        <Rule 
          title="Uses of Will"
          description="When to use Will:"
          examples={[
            "Spontaneous decisions: I'll have a coffee, please",
            "Predictions: It will be sunny tomorrow",
            "Promises: I will call you later",
            "Offers: I'll help you with that"
          ]}
        />

        <Tip type="info">
          <strong>Contractions:</strong> "I will" = "I'll", "you will" = "you'll", "will not" = "won't".
        </Tip>
      </TheorySection>

      <TheorySection title="Going to (Future with Intention)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for plans and intentions, and for predictions based on present evidence.
        </p>

        <GrammarTable
          caption="Going to Structure"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Affirmative", "Subject + am/is/are + going to + verb", "I am going to study"],
            ["Negative", "Subject + am/is/are + not + going to + verb", "I am not going to go"],
            ["Interrogative", "Am/Is/Are + subject + going to + verb", "Are you going to come?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy a estudiar medicina"
            english="I am going to study medicine"
          />
          <Example 
            spanish="Mira esas nubes, va a llover"
            english="Look at those clouds, it's going to rain"
          />
          <Example 
            spanish="¿Vas a venir a la reunión?"
            english="Are you going to come to the meeting?"
          />
        </div>

        <Rule 
          title="Uses of Going to"
          description="When to use Going to:"
          examples={[
            "Plans and intentions: I'm going to buy a new car",
            "Predictions with evidence: Look! It's going to rain",
            "Prior decisions: I'm going to visit my parents",
            "Preparations: We're going to have a party"
          ]}
        />

        <Tip type="warning">
          <strong>Difference from Will:</strong> "Going to" for prior plans, "will" for spontaneous decisions.
        </Tip>
      </TheorySection>

      <TheorySection title="Present Continuous (Future with Arrangements)" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for fixed plans and arrangements already confirmed for the future.
        </p>

        <GrammarTable
          caption="Present Continuous for the Future"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Affirmative", "Subject + am/is/are + verb + ing", "I am meeting my boss tomorrow"],
            ["Negative", "Subject + am/is/are + not + verb + ing", "I am not working next week"],
            ["Interrogative", "Am/Is/Are + subject + verb + ing", "Are you leaving tonight?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mañana me reúno con el jefe"
            english="Tomorrow I am meeting with my boss"
          />
          <Example 
            spanish="Nos vamos de vacaciones el viernes"
            english="We are going on vacation on Friday"
          />
          <Example 
            spanish="¿Cuándo te vas?"
            english="When are you leaving?"
          />
        </div>

        <Rule 
          title="Uses of Present Continuous (Future)"
          description="When to use Present Continuous for the future:"
          examples={[
            "Confirmed arrangements: I'm seeing the doctor at 3 PM",
            "Fixed plans: We're flying to Paris next month",
            "Organized events: The concert is starting at 8 PM",
            "Commitments: I'm having dinner with friends tonight"
          ]}
        />

        <Tip type="success">
          <strong>Time markers:</strong> "tomorrow", "next week", "tonight", "at 3 PM", "on Friday".
        </Tip>
      </TheorySection>

      <TheorySection title="Present Simple (Future with Schedules)" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for fixed schedules, timetables, and events on a calendar.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El tren sale a las 6 PM"
            english="The train leaves at 6 PM"
          />
          <Example 
            spanish="Las clases empiezan en septiembre"
            english="Classes start in September"
          />
          <Example 
            spanish="¿A qué hora llega el avión?"
            english="What time does the plane arrive?"
          />
        </div>

        <Rule 
          title="Uses of Present Simple (Future)"
          description="When to use Present Simple for the future:"
          examples={[
            "Transport: The bus leaves at 8 AM",
            "Schedules: The store opens at 9 AM",
            "Programs: The movie starts at 7 PM",
            "Official events: The conference begins on Monday"
          ]}
        />

        <Tip type="info">
          <strong>Common verbs:</strong> "start", "begin", "finish", "end", "open", "close", "leave", "arrive", "depart".
        </Tip>
      </TheorySection>

      <TheorySection title="Future Continuous" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for actions that will be in progress at a specific moment in the future.
        </p>

        <GrammarTable
          caption="Future Continuous Structure"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Affirmative", "Subject + will be + verb + ing", "I will be working"],
            ["Negative", "Subject + won't be + verb + ing", "I won't be sleeping"],
            ["Interrogative", "Will + subject + be + verb + ing", "Will you be studying?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="A las 8 PM estaré trabajando"
            english="At 8 PM I will be working"
          />
          <Example 
            spanish="¿Estarás estudiando esta noche?"
            english="Will you be studying tonight?"
          />
          <Example 
            spanish="No estaré durmiendo a esa hora"
            english="I won't be sleeping at that time"
          />
        </div>

        <Rule 
          title="Uses of Future Continuous"
          description="When to use Future Continuous:"
          examples={[
            "Future actions in progress: I'll be studying at 3 PM",
            "Questions about plans: Will you be working tomorrow?",
            "Polite actions: I'll be waiting for you",
            "Predictions about progress: This time next year I'll be living in London"
          ]}
        />

        <Tip type="success">
          <strong>Markers:</strong> "at 3 PM", "this time tomorrow", "next year at this time".
        </Tip>
      </TheorySection>

      <TheorySection title="Comparing Future Forms" icon="⚖️">
        <GrammarTable
          caption="When to Use Each Future Form"
          headers={["Form", "Use", "Example"]}
          rows={[
            ["Will", "Spontaneous decisions, predictions", "I'll help you"],
            ["Going to", "Plans and intentions", "I'm going to study"],
            ["Present Continuous", "Fixed arrangements", "I'm meeting her tomorrow"],
            ["Present Simple", "Schedules and timetables", "The train leaves at 6 PM"],
            ["Future Continuous", "Future actions in progress", "I'll be working at 3 PM"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Te ayudo (decisión espontánea)"
            english="I'll help you"
          />
          <Example 
            spanish="Voy a ayudarte (plan previo)"
            english="I'm going to help you"
          />
          <Example 
            spanish="Me reúno contigo mañana (arreglo fijo)"
            english="I'm meeting with you tomorrow"
          />
        </div>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I will going to the store" ❌<br/>
            <strong>Correct:</strong> "I will go to the store" or "I am going to the store" ✅<br/>
            <em>Do not mix 'will' with 'going to'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I will be go to school" ❌<br/>
            <strong>Correct:</strong> "I will be going to school" ✅<br/>
            <em>Future Continuous uses 'will be + verb + ing'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The train will leave at 6 PM" ❌<br/>
            <strong>Correct:</strong> "The train leaves at 6 PM" ✅<br/>
            <em>For fixed schedules we use Present Simple</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am going to help you" (spontaneous decision) ❌<br/>
            <strong>Correct:</strong> "I'll help you" ✅<br/>
            <em>For spontaneous decisions we use 'will'</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Words" icon="🔑">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Will:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              I think, probably, perhaps, maybe, in my opinion
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Going to:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              I plan to, I intend to, look at, watch out, be careful
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Continuous (Future):</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              tomorrow, next week, tonight, this weekend, on Monday
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Simple (Future):</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              at 6 PM, on schedule, according to the timetable
            </p>
          </div>
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Future Tenses"
      description="Master all ways to express the future in English: will, going to, Present Continuous, Present Simple, and Future Continuous. Learn when to use each one."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build9FutureTensesExercises}
      prerequisites={["Present Tenses", "Past Tenses", "Verb to be"]}
      estimatedTime="65 min"
    />
  );
};

export default FutureTensesPage;






















