'use client';
import { buildListeningTypesExercises } from './listeningTypesExercises';
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


const ListeningTypesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Types of Understanding?" icon="👂">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Types of understanding</strong> in listening are the different skills you need to fully understand what you hear. Each type calls for specific strategies.
        </p>
        
        <QuickReference items={[
          "Main idea: grasp the central topic",
          "Details: catch specific information",
          "Contrast: spot differences and oppositions",
          "Tone: recognize the speaker’s tone and attitude",
          "Specific strategies for each type"
        ]} />
      </TheorySection>

      <TheorySection title="Main Idea" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The main idea is the central theme or most important message of what you hear.
        </p>

        <GrammarTable
          caption="Strategies for Identifying the Main Idea"
          headers={["Strategy", "Description", "Example", "When to Use"]}
          rows={[
            ["Listen for keywords", "Spot repeated terms", "Technology, innovation, future", "Early in the audio"],
            ["Focus on the opening", "The main idea often comes at the start", "Today I'll talk about...", "First 30 seconds"],
            ["Identify the general topic", "What is the talk about overall?", "Health, education, work", "Throughout the clip"],
            ["Ignore specific detail", "Do not fixate on numbers or dates", "Stay with the overall message", "To keep a global focus"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Question: 'What is the main topic of the audio?'"
          />
          <Example 
            english="Answer: 'The audio discusses the benefits of technology'"
          />
          <Example 
            english="Keywords: 'technology', 'benefits', 'improves', 'future'"
          />
        </div>

        <Rule 
          title="Typical Main-Idea Questions"
          description="These questions ask for the general theme:"
          examples={[
            "What is the main topic?",
            "What is the speaker talking about?",
            "What is the general theme?",
            "What is the main idea?"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> The main idea is like the headline of an article—it sums up the whole piece.
        </Tip>
      </TheorySection>

      <TheorySection title="Details" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Details are specific information such as names, dates, numbers, places, and concrete facts.
        </p>

        <GrammarTable
          caption="Types of Detail and How to Catch Them"
          headers={["Type of Detail", "What to Listen For", "Strategy", "Example"]}
          rows={[
            ["Proper nouns", "People, places, organizations", "Listen for “capital-letter” cues", "John Smith, London, UNESCO"],
            ["Numbers", "Dates, quantities, prices", "Listen carefully", "2023, 50 students, $100"],
            ["Descriptive adjectives", "Specific characteristics", "Notice descriptions", "Big, expensive, beautiful"],
            ["Action verbs", "What is done specifically", "Listen for concrete actions", "Buy, sell, travel, study"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Question: 'How many students are in the class?'"
          />
          <Example 
            english="Answer: 'There are 25 students'"
          />
          <Example 
            english="Question: 'Where was the conference held?'"
          />
          <Example 
            english="Answer: 'At the convention center'"
          />
        </div>

        <Rule 
          title="Strategies for Catching Details"
          description="To understand specific detail:"
          examples={[
            "Read the questions before you listen",
            "Identify what kind of information you need",
            "Listen for keywords tied to the question",
            "Do not get sidetracked by irrelevant information"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Details can be distractors—make sure they match the question.
        </Tip>
      </TheorySection>

      <TheorySection title="Contrast" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Contrast means noticing differences, oppositions, or comparisons between ideas, people, or situations.
        </p>

        <GrammarTable
          caption="Keywords for Spotting Contrast"
          headers={["Word / Expression", "Role", "Example", "Strategy"]}
          rows={[
            ["However", "Introduces opposition", "It's expensive, however it's worth it", "Listen for what follows 'however'"],
            ["But", "Shows contrast", "I like it, but it's too expensive", "Identify the clash"],
            ["On the other hand", "Offers an alternative", "On the other hand, it's difficult", "Catch the second side"],
            ["Unlike", "Highlights difference", "Unlike cars, bikes are eco-friendly", "Compare contrasts"],
            ["While", "Simultaneous contrast", "While some like it, others don't", "Two views at once"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Question: 'What's the difference between A and B?'"
          />
          <Example 
            english="Audio: 'A is fast, but B is slower'"
          />
          <Example 
            english="Answer: 'A is faster than B'"
          />
        </div>

        <Rule 
          title="Strategies for Identifying Contrast"
          description="To recognize contrast:"
          examples={[
            "Listen for contrast markers (but, however, unlike)",
            "Identify two opposing ideas",
            "Compare the features mentioned",
            "Pay attention to comparisons"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Contrasts often come in pairs—identify both sides.
        </Tip>
      </TheorySection>

      <TheorySection title="Tone" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Tone is the attitude or emotion the speaker conveys through voice and word choice.
        </p>

        <GrammarTable
          caption="Types of Tone and How to Spot Them"
          headers={["Tone", "Characteristics", "Keywords", "Example"]}
          rows={[
            ["Optimistic", "Upbeat voice, positive words", "Great, wonderful, amazing", "This is amazing!"],
            ["Pessimistic", "Low energy, negative words", "Terrible, awful, disappointing", "This is terrible"],
            ["Neutral", "Even delivery, factual", "According to, it seems", "According to statistics"],
            ["Critical", "Firm tone, judgment words", "Wrong, incorrect, mistake", "This is wrong"],
            ["Enthusiastic", "Excited delivery, emphasis", "Fantastic, incredible, love", "I love this!"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Question: 'What is the speaker's tone?'"
          />
          <Example 
            english="Audio: 'This is fantastic! I love this idea'"
          />
          <Example 
            english="Answer: 'Enthusiastic and positive'"
          />
        </div>

        <Rule 
          title="Strategies for Identifying Tone"
          description="To recognize tone:"
          examples={[
            "Listen to intonation and rhythm",
            "Notice words that express emotion",
            "Pay attention to exclamations or questions",
            "Watch descriptive adjectives"
          ]}
        />

        <Tip type="info">
          <strong>Note:</strong> Tone can shift during a clip—notice changes as you listen.
        </Tip>
      </TheorySection>

      <TheorySection title="General Strategies" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Strategies that work across all listening comprehension types.
        </p>

        <GrammarTable
          caption="Universal Listening Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Pre-reading", "Read questions before listening", "Always", "Know what to listen for"],
            ["Prediction", "Guess content from context", "Before the audio", "Prime your mind"],
            ["Note-taking", "Jot down key points", "While listening", "Retain information"],
            ["Inference", "Fill in unstated meaning", "When audio is unclear", "Complete the picture"],
            ["Checking", "Verify answers afterward", "After the clip", "Improve accuracy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Before: Read questions and predict content"
          />
          <Example 
            english="During: Take notes on key information"
          />
          <Example 
            english="After: Check answers and infer where needed"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Combine these tactics depending on the question type you need to answer.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Focusing only on words you know ❌<br/>
            <strong>Better:</strong> Listen for the overall message ✅<br/>
            <em>Do not get lost in unknown vocabulary</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Skipping questions before listening ❌<br/>
            <strong>Better:</strong> Read the questions first ✅<br/>
            <em>Knowing what to hunt for sharpens focus</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Trying to understand every word ❌<br/>
            <strong>Better:</strong> Aim for gist and needed detail ✅<br/>
            <em>The goal is comprehension, not word-for-word translation</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Taking no notes ❌<br/>
            <strong>Better:</strong> Note key facts ✅<br/>
            <em>Notes anchor important details</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Prepare first"
            description="Always set yourself up before you listen."
            examples={[
              "Read questions carefully",
              "Predict audio content",
              "Decide what type of information you need",
              "Get ready to attend"
            ]}
          />

          <Rule 
            title="2. Listen actively"
            description="Stay focused throughout."
            examples={[
              "Do not drift into unrelated thoughts",
              "Catch keywords and important phrases",
              "Take notes on relevant points",
              "Hold concentration for the whole clip"
            ]}
          />

          <Rule 
            title="3. Match strategy to question type"
            description="Adjust approach to the task."
            examples={[
              "Main idea: stay with global theme",
              "Details: target specific facts",
              "Contrast: spot differences and oppositions",
              "Tone: attend to speaker attitude"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Types of Understanding: Main Idea, Details, Contrast, Tone"
      description="Master different listening comprehension types: main idea, details, contrast, and tone—with targeted strategies for each."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildListeningTypesExercises}
      prerequisites={["Basic listening skills", "Understanding of question types"]}
      estimatedTime="70 min"
    />
  );
};

export default ListeningTypesPage;
