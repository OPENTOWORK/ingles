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

const FunctionalAndThematicVocabularyPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is Functional and Thematic Vocabulary?" icon="🗣️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Functional and thematic vocabulary</strong> means words and expressions organized by communicative function 
          and specific topics. It is essential for speaking effectively in different situations.
        </p>
        
        <QuickReference items={[
          "Vocabulary organized by communicative function",
          "Words grouped by specific topics",
          "Expressions for different situations",
          "Contextual and situational vocabulary",
          "Tools for effective communication"
        ]} />
      </TheorySection>

      <TheorySection title="Functional Vocabulary" icon="⚙️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Functional vocabulary is organized according to the communicative role it plays in conversation.
        </p>

        <GrammarTable
          caption="Functional Vocabulary Categories"
          headers={["Function", "Purpose", "Examples", "When to Use"]}
          rows={[
            ["Greeting", "Start a conversation", "Hello, Hi, Good morning", "When you meet someone"],
            ["Saying goodbye", "End a conversation", "Goodbye, See you later, Take care", "When you end an encounter"],
            ["Asking for information", "Get information", "Could you tell me...?, What time...?", "When you need information"],
            ["Giving information", "Provide information", "It's..., The time is..., According to...", "When you answer questions"],
            ["Expressing an opinion", "Share viewpoints", "I think..., In my opinion..., I believe...", "When you give your perspective"],
            ["Agreeing / disagreeing", "Show agreement or disagreement", "I agree..., I disagree..., That's true", "When you respond to opinions"],
            ["Suggesting", "Propose ideas", "How about...?, Why don't we...?, I suggest...", "When you propose actions"],
            ["Thanking", "Show gratitude", "Thank you, Thanks, I appreciate...", "When you receive help"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Greeting: 'Hello, how are you?'"
          />
          <Example 
            english="Asking for information: 'Could you tell me the time?'"
          />
          <Example 
            english="Expressing opinion: 'I think it's a good idea'"
          />
        </div>

        <Rule 
          title="Using Functional Vocabulary"
          description="To use it effectively:"
          examples={[
            "Choose expressions that fit the situation",
            "Consider the level of formality",
            "Adapt to your relationship with the other person",
            "Use variety to avoid repetition"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Functional vocabulary helps you move through different communicative situations with confidence.
        </Tip>
      </TheorySection>

      <TheorySection title="Thematic Vocabulary" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Thematic vocabulary is organized by specific topics that often come up in conversation.
        </p>

        <GrammarTable
          caption="Common Thematic Vocabulary Topics"
          headers={["Topic", "Key Vocabulary", "Situations", "Example"]}
          rows={[
            ["Work", "job, career, salary, meeting", "Interviews, meetings", "I have a meeting at 3 PM"],
            ["Education", "school, university, exam, study", "Academic conversations", "The exam is next week"],
            ["Travel", "trip, vacation, hotel, flight", "Trip planning", "My flight leaves at 6 AM"],
            ["Health", "doctor, hospital, medicine, symptoms", "Medical appointments", "I have a headache"],
            ["Food", "restaurant, menu, delicious, hungry", "Dining out, restaurants", "This food is delicious"],
            ["Technology", "computer, internet, software, app", "Technical discussions", "I use this app daily"],
            ["Sports", "football, basketball, team, score", "Sports conversations", "The team won the game"],
            ["Music", "concert, band, song, instrument", "Music discussions", "I love this song"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Work: 'I have a meeting at 3 PM'"
          />
          <Example 
            english="Travel: 'My flight leaves at 6 AM'"
          />
          <Example 
            english="Technology: 'I use this app daily'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Get comfortable with vocabulary for topics you care about or that come up often in your life.
        </Tip>
      </TheorySection>

      <TheorySection title="Expressions by Situation" icon="🏢">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different situations call for specific vocabulary and expressions.
        </p>

        <GrammarTable
          caption="Vocabulary by Situation"
          headers={["Situation", "Specific Vocabulary", "Key Expressions", "Example"]}
          rows={[
            ["Job interview", "experience, skills, qualifications", "Tell me about yourself", "I have 5 years of experience"],
            ["Doctor's appointment", "symptoms, pain, medication", "How are you feeling?", "I have a headache"],
            ["Restaurant reservation", "table, reservation, menu", "Table for two, please", "We have a reservation"],
            ["Shopping in a store", "price, size, color, discount", "How much does it cost?", "This shirt costs $25"],
            ["At the airport", "flight, gate, departure, arrival", "Where is gate 15?", "Gate 15 is on the left"],
            ["At a party", "party, fun, music, dance", "Are you having fun?", "This party is great"],
            ["Work meeting", "agenda, discussion, decision", "Let's discuss this", "I agree with your proposal"],
            ["Chatting with friends", "casual, relaxed, informal", "What's up?", "Nothing much, you?"]                                                  
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Interview: 'I have 5 years of experience'"
          />
          <Example 
            english="Medical consultation: 'I have a headache'"
          />
          <Example 
            english="Restaurant: 'Table for two, please'"
          />
        </div>

        <Rule 
          title="Adapting to Situations"
          description="To adapt to different situations:"
          examples={[
            "Identify the context and level of formality",
            "Use vocabulary appropriate to the situation",
            "Consider your relationship with the other person",
            "Adapt your tone and communication style"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Using vocabulary that does not fit the situation can cause misunderstandings.
        </Tip>
      </TheorySection>

      <TheorySection title="Levels of Formality" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Formality level determines which vocabulary and expressions to use in different contexts.
        </p>

        <GrammarTable
          caption="Levels of Formality"
          headers={["Level", "Context", "Vocabulary", "Example"]}
          rows={[
            ["Very formal", "Presentations, speeches", "distinguished, esteemed", "Distinguished guests, thank you"],
            ["Formal", "Work, business", "please, thank you, sir/madam", "Please send me the report"],
            ["Neutral", "Acquaintances, colleagues", "standard vocabulary", "Could you help me with this?"],
            ["Informal", "Friends, family", "casual expressions", "Can you help me with this?"],
            ["Very informal", "Close friends", "slang, contractions", "Hey, can ya help me with this?"],
            ["Colloquial", "Casual conversation", "everyday expressions", "What's up? How's it going?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Very formal: 'Distinguished guests, thank you'"
          />
          <Example 
            english="Formal: 'Please send me the report'"
          />
          <Example 
            english="Informal: 'Can you help me with this?'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Notice how others speak in different settings to learn appropriate levels of formality.
        </Tip>
      </TheorySection>

      <TheorySection title="Colloquial Expressions" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Colloquial expressions are an important part of functional vocabulary for natural conversation.
        </p>

        <GrammarTable
          caption="Common Colloquial Expressions"
          headers={["Expression", "Meaning", "Use", "Example"]}
          rows={[
            ["What's up?", "How are things? / What's new?", "Informal greeting", "Hey, what's up?"],
            ["How's it going?", "How is everything going?", "Asking how someone is", "How's it going with your job?"],
            ["That's cool", "That's great / I like that", "Casual approval", "That's cool, I like it"],
            ["No way!", "I can't believe it!", "Surprise", "No way! Really?"],
            ["I'm in", "I'm on board / Count me in", "Accepting a proposal", "Count me in, I'm in"],
            ["That sucks", "That's bad / That's a shame", "Disapproval", "That sucks, I'm sorry"],
            ["I'm down", "I'm willing / I'm up for it", "Accepting an idea", "I'm down for pizza"],
            ["That rocks", "That's awesome", "Enthusiastic approval", "That rocks, let's do it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Greeting: 'Hey, what's up?'"
          />
          <Example 
            english="Approval: 'That's cool, I like it'"
          />
          <Example 
            english="Accepting: 'Count me in, I'm in'"
          />
        </div>

        <Rule 
          title="Using Colloquial Expressions"
          description="To use them effectively:"
          examples={[
            "Use them only in appropriate contexts",
            "Consider your relationship with the other person",
            "Do not use them in formal situations",
            "Learn the appropriate cultural context"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Colloquial expressions may not be appropriate in formal or professional contexts.
        </Tip>
      </TheorySection>

      <TheorySection title="Learning Strategies" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          There are specific strategies for learning and using functional and thematic vocabulary effectively.
        </p>

        <GrammarTable
          caption="Learning Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Context-based learning", "Learn vocabulary in context", "Daily study", "Better retention"],
            ["Situational practice", "Practice in specific situations", "Preparing for real situations", "Confidence in real contexts"],
            ["Thematic grouping", "Group vocabulary by topic", "Organized study", "Clearer mental organization"],
            ["Active use", "Use vocabulary in conversation", "Regular practice", "Natural fluency"],
            ["Register variation", "Practice different formality levels", "Adapting to context", "Communicative flexibility"],
            ["Feedback loop", "Get feedback on how you use words", "Ongoing improvement", "Correction and progress"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Context-based learning: 'Learn vocabulary in context'"
          />
          <Example 
            english="Situational practice: 'Practice in specific situations'"
          />
          <Example 
            english="Active use: 'Use vocabulary in conversations'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Active practice in real contexts is the best way to build functional vocabulary.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Using formal vocabulary in informal contexts ❌<br/>
            <strong>Correct:</strong> Match vocabulary to the context ✅<br/>
            <em>Context determines the appropriate level of formality</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using colloquial expressions in formal contexts ❌<br/>
            <strong>Correct:</strong> Use expressions that fit the situation ✅<br/>
            <em>Colloquial expressions are not appropriate in formal settings</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignoring your relationship with the other person ❌<br/>
            <strong>Correct:</strong> Adapt vocabulary to the relationship ✅<br/>
            <em>The relationship helps determine the right level of formality</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Not practicing in real contexts ❌<br/>
            <strong>Correct:</strong> Practice in real-life situations ✅<br/>
            <em>Practice in context builds natural fluency</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Context determines usage"
            description="Context tells you which vocabulary to use."
            examples={[
              "Identify the context and level of formality",
              "Consider your relationship with the other person",
              "Adapt your vocabulary appropriately",
              "Notice how others speak in that context"
            ]}
          />

          <Rule 
            title="2. Variety and flexibility"
            description="Develop variety in your vocabulary."
            examples={[
              "Learn different ways to express the same idea",
              "Practice different levels of formality",
              "Build vocabulary for different topics",
              "Use variety to avoid repetition"
            ]}
          />

          <Rule 
            title="3. Active practice"
            description="Practice actively in real contexts."
            examples={[
              "Use vocabulary in real conversations",
              "Practice in different situations",
              "Get feedback on your usage",
              "Adjust based on context and feedback"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="How is functional vocabulary organized?"
      options={[
        "By topic",
        "By communicative function",
        "By level",
        "By frequency"
      ]}
      correctAnswer={1}
      explanation="Functional vocabulary is organized by communicative function, grouping words according to their role in communication."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What mainly determines which functional vocabulary to use?"
      options={[
        "How long the conversation is",
        "Context and level of formality",
        "How fast people speak",
        "The other person's accent"
      ]}
      correctAnswer={1}
      explanation="Context and formality determine which functional vocabulary to use. Different situations require different levels of formality."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Colloquial expressions are appropriate in formal contexts.",
          isTrue: false,
          explanation: "Incorrect. Colloquial expressions are not appropriate in formal contexts. Use them only in informal situations."
        },
        {
          text: "Thematic vocabulary is organized by specific topics.",
          isTrue: true,
          explanation: "Correct. Thematic vocabulary is grouped by topics such as work, education, travel, health, and so on."
        },
        {
          text: "Active practice in real contexts is important for building functional vocabulary.",
          isTrue: true,
          explanation: "Correct. Active practice in real contexts is the best way to build fluency with functional vocabulary."
        },
        {
          text: "You should always use the same level of formality in every situation.",
          isTrue: false,
          explanation: "Incorrect. You should adapt your level of formality to the context and your relationship with the other person."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the best strategy for learning functional vocabulary?"
      options={[
        "Memorize long word lists",
        "Practice in real contexts",
        "Only read about vocabulary",
        "Always use the same level of formality"
      ]}
      correctAnswer={1}
      explanation="Practicing in real contexts is the best strategy because it builds natural fluency and helps you adapt to different situations."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which expression is most appropriate for an informal conversation with friends?"
      options={[
        "Distinguished guests, thank you",
        "Please send me the report",
        "What's up? How's it going?",
        "I respectfully disagree"
      ]}
      correctAnswer={2}
      explanation="'What's up? How's it going?' fits informal conversations with friends; the other options are much more formal."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Functional vocabulary focuses on what you can do with language.",
          isTrue: true,
          explanation: "Correct. Functional vocabulary focuses on communicative functions: asking, suggesting, agreeing, and so on."
        },
        {
          text: "Thematic vocabulary is organized by topics or subjects.",
          isTrue: true,
          explanation: "Correct. Thematic vocabulary is organized by topics such as health, work, travel, and so on."
        },
        {
          text: "You should learn vocabulary in isolation without context.",
          isTrue: false,
          explanation: "Incorrect. It is better to learn vocabulary in context so you understand how to use it appropriately."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I _____ you to consider this option.' (suggesting)"
      options={[
        "order",
        "recommend",
        "demand",
        "force"
      ]}
      correctAnswer={1}
      explanation="'Recommend' is appropriate for suggesting. 'Order' and 'demand' are too forceful; 'force' is coercive."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which thematic vocabulary do you need to talk about the environment?"
      options={[
        "Cooking terms",
        "Pollution, recycling, climate change",
        "Sports equipment",
        "Fashion vocabulary"
      ]}
      correctAnswer={1}
      explanation="For the environment you need vocabulary such as 'pollution', 'recycling', 'climate change', and 'sustainability'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Functional vocabulary changes depending on the level of formality.",
          isTrue: true,
          explanation: "Correct. For example, 'Could you please...' (formal) versus 'Can you...' (informal) for the same function of asking."
        },
        {
          text: "Thematic vocabulary is the same in all languages.",
          isTrue: false,
          explanation: "Incorrect. Each language has its own thematic vocabulary and culturally specific expressions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I'm afraid I have to _____ with you on this.' (disagreeing politely)"
      options={[
        "fight",
        "disagree",
        "argue",
        "battle"
      ]}
      correctAnswer={1}
      explanation="'Disagree' is a polite way to express disagreement. The other options sound too aggressive."
    />
  ];

  return (
    <TheoryLayout
      title="Functional and Thematic Vocabulary"
      description="Master functional and thematic vocabulary in English. Learn words organized by communicative function and by topic so you can communicate effectively in different situations."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of formal vs informal language"]}
      estimatedTime="75 min"
    />
  );
};

export default FunctionalAndThematicVocabularyPage;
