'use client';
import { buildShortDialoguesExercises } from './shortDialoguesExercises';
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


const ShortDialoguesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Short Dialogues?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Short dialogues</strong> are brief exchanges between two or more people common on listening exams. They are ideal for building basic listening comprehension.
        </p>
        
        <QuickReference items={[
          "Length: roughly 30 seconds to 2 minutes",
          "Speakers: two or three at most",
          "Contexts: everyday situations",
          "Goal: a specific piece of information",
          "Level: beginner to elementary"
        ]} />
      </TheorySection>

      <TheorySection title="Features of Short Dialogues" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Short exchanges share traits that make them friendly for newcomers.
        </p>

        <GrammarTable
          caption="Features of Short Dialogues"
          headers={["Feature", "Description", "Benefit", "Example"]}
          rows={[
            ["Short length", "About 30 seconds to 2 minutes", "Keeps attention", "A quick interaction"],
            ["Simple vocabulary", "Common everyday words", "Easier processing", "Hello, how are you?"],
            ["Clear shape", "Opening, body, closing", "Easy to follow", "Greeting → Question → Answer"],
            ["Familiar setting", "Everyday scenarios", "Intuitive guesses", "Shop, restaurant, street"],
            ["Single focus", "One main fact to locate", "Clear target", "Price, time, location"],
            ["Moderate pace", "Clear, slightly deliberate speech", "Time to process", "Not overly fast"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Context: shop—customer asks the price"
          />
          <Example 
            english="Duration: 45 seconds"
          />
          <Example 
            english="Goal: identify the price of an item"
          />
        </div>

        <Rule 
          title="Why Short Dialogues Help Beginners"
          description="Strengths at early levels:"
          examples={[
            "They rarely overload memory",
            "They train core listening habits",
            "They are easy to replay",
            "They build early wins"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Short clips are ideal for growing confidence with listening tasks.
        </Tip>
      </TheorySection>

      <TheorySection title="Kinds of Short Dialogues" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Listening tasks often recycle a small set of everyday situations.
        </p>

        <GrammarTable
          caption="Common Short-Dialogue Types"
          headers={["Type", "Situation", "Key Information", "Typical Questions"]}
          rows={[
            ["Shopping", "Buying in a store", "Price, size, availability", "How much? What size?"],
            ["Restaurant", "Ordering food", "Dishes, prices, timing", "What do you recommend?"],
            ["Directions", "Asking how to go somewhere", "Place, distance, time", "How do I get to...?"],
            ["Transport", "Travel information", "Schedules, prices, destinations", "What time? How much?"],
            ["Accommodation", "Hotel or lodging", "Availability, rates, services", "Do you have rooms?"],
            ["Personal info", "Small talk basics", "Name, age, job", "What's your name?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Shopping: 'How much does this shirt cost?'"
          />
          <Example 
            english="Restaurant: 'I'd like to order the pasta, please'"
          />
          <Example 
            english="Directions: 'Excuse me, where is the bank?'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Get comfortable with these settings to speed recognition.
        </Tip>
      </TheorySection>

      <TheorySection title="Strategies for Short Dialogues" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Dedicated tactics sharpen performance on brief exchanges.
        </p>

        <GrammarTable
          caption="Effective Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Pre-reading", "Read questions ahead of audio", "Before the clip", "Know your target"],
            ["Prediction", "Guess content from context", "Before play", "Prime attention"],
            ["Active listening", "Lock onto key facts", "While listening", "Catch critical detail"],
            ["Note-taking", "Jot cues quickly", "While listening", "Hold numbers and names"],
            ["Checking", "Verify after listening", "When time allows", "Boost accuracy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Pre-reading: 'Read the prompt: What is the price of the shirt?'"
          />
          <Example 
            english="Prediction: 'Context is a shop → expect prices'"
          />
          <Example 
            english="Active listening: 'Tune in to numbers and prices'"
          />
        </div>

        <Rule 
          title="Step-by-Step Routine"
          description="A simple workflow for short clips:"
          examples={[
            "1. Skim the questions quickly",
            "2. Predict possible content",
            "3. Listen carefully the first time",
            "4. Note key phrases or figures",
            "5. Replay only if permitted",
            "6. Double-check responses"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not fixate on unknown words—prioritize what the items ask for.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Question Types" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Exams recycle predictable question stems—learn to classify them quickly.
        </p>

        <GrammarTable
          caption="Question Types in Short Dialogues"
          headers={["Type", "Typical Question", "What to Listen For", "Example"]}
          rows={[
            ["Specific fact", "What is the price?", "Numbers or amounts", "€25, $50, 10 items"],
            ["Location", "Where does this take place?", "Places, setting", "shop, restaurant, street"],
            ["Time", "What time does it start?", "Schedules or dates", "3 PM, Monday, tomorrow"],
            ["People", "Who is speaking?", "Roles or identities", "customer, waiter, teacher"],
            ["Action / intent", "What does the man want?", "Goals or verbs", "buy, order, find"],
            ["Feeling", "How does she feel?", "Attitude or emotion", "happy, worried, excited"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Specific information: 'How much does the book cost?'"
          />
          <Example 
            english="Location: 'Where does this conversation take place?'"
          />
          <Example 
            english="Time: 'What time does the shop open?'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Naming the question type tells you what signal to chase.
        </Tip>
      </TheorySection>

      <TheorySection title="Key Vocabulary by Context" icon="🔑">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Each scenario carries recurring lexical bundles worth recognizing fast.
        </p>

        <GrammarTable
          caption="Keyword Sets by Scenario"
          headers={["Context", "Keywords", "Typical Figures", "Handy Lines"]}
          rows={[
            ["Shopping", "price, size, color, buy", "€, $, pounds, sizes", "How much? What size?"],
            ["Restaurant", "menu, order, food, drink", "€, $, time", "I'd like... What do you recommend?"],
            ["Transport", "ticket, time, destination", "times, prices", "What time? How much?"],
            ["Directions", "left, right, straight, turn", "distances, times", "How do I get to...?"],
            ["Hotel", "room, reservation, check-in", "room numbers, prices", "Do you have...?"],
            ["Personal", "name, age, job, country", "ages, years", "What's your...? Where are you from?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Shopping cluster: price, size, color, buy"
          />
          <Example 
            english="Restaurant cluster: menu, order, food, drink"
          />
          <Example 
            english="Transport cluster: ticket, time, destination"
          />
        </div>

        <Rule 
          title="Vocabulary Tips"
          description="Managing words under time pressure:"
          examples={[
            "Learn lexical sets by scenario",
            "Drill prices and clock times aloud",
            "Memorize high-frequency formulas",
            "Let unknown tokens go if gist is intact",
            "Use situation to guess meaning"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Contextual bundles beat isolated memorization for listening tasks.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Skipping questions until after audio ❌<br/>
            <strong>Better:</strong> Read prompts first ✅<br/>
            <em>Knowing the target boosts accuracy</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Demanding word-for-word coverage ❌<br/>
            <strong>Better:</strong> Lock onto decisive facts ✅<br/>
            <em>Overall gist plus task focus wins</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Writing nothing down ❌<br/>
            <strong>Better:</strong> Scribble shorthand cues ✅<br/>
            <em>Notes stabilize fragile memory</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Worrying too much about accent ❌<br/>
            <strong>Better:</strong> Chase semantic content ✅<br/>
            <em>Different accents still carry the message</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Preparation matters"
            description="Brief planning multiplies payoff."
            examples={[
              "Study each question wording",
              "Predict topic and probable answers",
              "Decide exactly what datum you need",
              "Reset attention before playback"
            ]}
          />

          <Rule 
            title="2. Focus on decisive cues"
            description="Tune out fluff that distracts."
            examples={[
              "Underline keywords inside stems",
              "Listen for quantities, clocks, sums",
              "Notice names or locations cited",
              "Release unknown lexical noise"
            ]}
          />

          <Rule 
            title="3. Leverage scenario"
            description="Situation primes expectations."
            examples={[
              "Label the backdrop (shop, clinic, transit)",
              "Infer missing words via collocations",
              "Remember each exchange has a pragmatic goal",
              "Link audio to comparable real-life chats"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Short Dialogues"
      description="Understand brief English exchanges with confidence—strategies for shops, eateries, transit, lodging, and other everyday setups."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildShortDialoguesExercises}
      prerequisites={["Basic listening skills", "Basic vocabulary"]}
      estimatedTime="60 min"
    />
  );
};

export default ShortDialoguesPage;
