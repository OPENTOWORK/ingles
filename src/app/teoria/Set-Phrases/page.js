'use client';
import { buildSetPhrasesExercises } from './setPhrasesExercises';
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


const SetPhrasesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Set Phrases?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Set phrases</strong> (idiomatic expressions) are fixed expressions commonly used in spoken English. 
          They are word combinations with a specific meaning that are used as a single unit.
        </p>
        
        <QuickReference items={[
          "Fixed phrases with a specific meaning",
          "Used as one complete unit",
          "Common in everyday conversation",
          "Help you sound more natural",
          "Include: greetings, goodbyes, courtesy expressions"
        ]} />
      </TheorySection>

      <TheorySection title="Greetings and Goodbyes" icon="👋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Greetings and goodbyes are essential phrases for basic social interaction.
        </p>

        <GrammarTable
          caption="Common Greetings and Goodbyes"
          headers={["Situation", "Phrase", "Typical Response", "Formality Level"]}
          rows={[
            ["Informal greeting", "Hi there!", "Hi! How are you?", "Informal"],
            ["Formal greeting", "Good morning", "Good morning to you too", "Formal"],
            ["Casual greeting", "Hey, what's up?", "Not much, you?", "Very informal"],
            ["Informal goodbye", "See you later!", "See you!", "Informal"],
            ["Formal goodbye", "Have a good day", "Thank you, you too", "Formal"],
            ["Casual goodbye", "Catch you later!", "Sure thing!", "Very informal"],
            ["Goodbye with future plans", "Talk to you soon", "Looking forward to it", "Neutral"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Informal greeting: 'Hi there! How are you?'"
          />
          <Example 
            english="Formal greeting: 'Good morning'"
          />
          <Example 
            english="Informal goodbye: 'See you later!'"
          />
        </div>

        <Rule 
          title="Using Greetings and Goodbyes"
          description="To use them effectively:"
          examples={[
            "Choose the appropriate level of formality",
            "Respond in an appropriate way",
            "Consider your relationship with the person",
            "Use natural, authentic expressions"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Greetings and goodbyes set the tone of the conversation.
        </Tip>
      </TheorySection>

      <TheorySection title="Courtesy Expressions" icon="🙏">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Courtesy expressions are fundamental for maintaining positive social relationships.
        </p>

        <GrammarTable
          caption="Courtesy Expressions"
          headers={["Situation", "Phrase", "Typical Response", "When to Use"]}
          rows={[
            ["Gratitude", "Thanks a lot!", "You're welcome!", "After receiving help"],
            ["Excuse me (attention)", "Excuse me", "That's okay", "When interrupting or asking for something"],
            ["Apology", "I'm sorry", "No problem", "When you make a mistake"],
            ["Permission", "May I...?", "Of course", "When asking for permission"],
            ["Request", "Could you...?", "Sure, no problem", "When asking for a favor"],
            ["Congratulations", "Congratulations!", "Thank you!", "When celebrating achievements"],
            ["Sympathy", "I'm sorry for your loss", "Thank you", "In sad situations"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Gratitude: 'Thanks a lot!'"
          />
          <Example 
            english="Excuse me: 'Excuse me, may I pass?'"
          />
          <Example 
            english="Permission: 'May I use your phone?'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Courtesy expressions show respect and consideration for others.
        </Tip>
      </TheorySection>

      <TheorySection title="Giving Opinions" icon="💭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These phrases help you share your opinion in a natural, appropriate way.
        </p>

        <GrammarTable
          caption="Phrases for Giving Opinions"
          headers={["Certainty Level", "Phrase", "Use", "Example"]}
          rows={[
            ["Very sure", "I'm absolutely sure", "When you are very confident", "I'm absolutely sure it's true"],
            ["Sure", "I'm convinced that", "When you hold a strong belief", "I'm convinced that it works"],
            ["Moderate", "I think that", "Personal opinion", "I think that's a good idea"],
            ["Unsure", "I'm not sure, but", "When you are not certain", "I'm not sure, but it might work"],
            ["Very unsure", "I have no idea", "When you do not know", "I have no idea what to do"],
            ["Neutral", "It seems to me", "Neutral opinion", "It seems to me it's okay"],
            ["Personal", "In my view", "Personal perspective", "In my view, it's important"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Very sure: 'I'm absolutely sure it's true'"
          />
          <Example 
            english="Moderate: 'I think that's a good idea'"
          />
          <Example 
            english="Uncertain: 'I'm not sure, but it might work'"
          />
        </div>

        <Rule 
          title="Using Opinion Phrases"
          description="To express opinions effectively:"
          examples={[
            "Choose the right level of certainty",
            "Consider the context and your audience",
            "Be honest about how much you know",
            "Use phrases that match how you really feel"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not use expressions of absolute certainty when you are not sure.
        </Tip>
      </TheorySection>

      <TheorySection title="Agreeing and Disagreeing" icon="🤝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These phrases help you express agreement or disagreement politely.
        </p>

        <GrammarTable
          caption="Agreement and Disagreement"
          headers={["Type", "Phrase", "Intensity Level", "Example"]}
          rows={[
            ["Full agreement", "I completely agree", "Very strong", "I completely agree with you"],
            ["Strong agreement", "I totally agree", "Strong", "I totally agree on that point"],
            ["Moderate agreement", "I agree with you", "Moderate", "I agree with you on this"],
            ["Partial agreement", "I partly agree", "Weak", "I partly agree with your idea"],
            ["Soft disagreement", "I'm not sure I agree", "Soft", "I'm not sure I agree with that"],
            ["Moderate disagreement", "I disagree", "Moderate", "I disagree with your opinion"],
            ["Strong disagreement", "I completely disagree", "Strong", "I completely disagree with that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Full agreement: 'I completely agree with you'"
          />
          <Example 
            english="Moderate agreement: 'I agree with you on this'"
          />
          <Example 
            english="Soft disagreement: 'I'm not sure I agree with that'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Choose phrases that match how strongly you disagree and your relationship with the person.
        </Tip>
      </TheorySection>

      <TheorySection title="Changing the Topic" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These phrases help you move to a new topic in a natural, polite way.
        </p>

        <GrammarTable
          caption="Phrases for Changing the Topic"
          headers={["Phrase", "Formality Level", "Use", "Example"]}
          rows={[
            ["By the way", "Informal", "Casual topic shift", "By the way, did you hear about...?"],
            ["Speaking of which", "Neutral", "Related shift", "Speaking of which, how is your job?"],
            ["That reminds me", "Neutral", "Remember something related", "That reminds me, I need to call..."],
            ["On a different note", "Formal", "Formal topic shift", "On a different note, let's discuss..."],
            ["Incidentally", "Formal", "Additional information", "Incidentally, I heard that..."],
            ["Before I forget", "Neutral", "Remember something important", "Before I forget, don't forget to..."],
            ["Oh, I almost forgot", "Informal", "Remember something you forgot", "Oh, I almost forgot to tell you..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Casual change: 'By the way, did you hear about...?'"
          />
          <Example 
            english="Related change: 'Speaking of which, how is your job?'"
          />
          <Example 
            english="Reminder: 'That reminds me, I need to call...'"
          />
        </div>

        <Rule 
          title="Changing the Topic"
          description="To change topics effectively:"
          examples={[
            "Use phrases that fit the formality level",
            "Make sure the shift feels natural",
            "Consider whether a change is appropriate",
            "Use phrases that smooth the transition"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Natural topic changes keep the conversation flowing.
        </Tip>
      </TheorySection>

      <TheorySection title="Showing Interest" icon="😊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These phrases help you show interest and keep the conversation active.
        </p>

        <GrammarTable
          caption="Phrases for Showing Interest"
          headers={["Phrase", "Use", "Expected Response", "Enthusiasm Level"]}
          rows={[
            ["That's interesting!", "Show interest", "They continue explaining", "Moderate"],
            ["Really?", "Show surprise", "They confirm or explain", "High"],
            ["Wow!", "Show amazement", "They continue the story", "Very high"],
            ["I see", "Show understanding", "They continue explaining", "Low"],
            ["That's amazing!", "Show admiration", "They continue explaining", "High"],
            ["No way!", "Show disbelief", "They confirm or explain", "Very high"],
            ["That's cool!", "Show approval", "They continue explaining", "Moderate"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Interest: 'That's interesting!'"
          />
          <Example 
            english="Surprise: 'Really?'"
          />
          <Example 
            english="Amazement: 'Wow!'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Showing genuine interest makes the conversation more pleasant for everyone.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Using expressions that are too formal in informal contexts ❌<br/>
            <strong>Correct:</strong> Match formality to the situation ✅<br/>
            <em>Context determines the right level</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Not responding appropriately to set phrases ❌<br/>
            <strong>Correct:</strong> Reply in a natural, appropriate way ✅<br/>
            <em>Good back-and-forth keeps conversation flowing</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using certainty phrases when you are not sure ❌<br/>
            <strong>Correct:</strong> Use phrases that match your real level of certainty ✅<br/>
            <em>Being honest about what you know matters</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignoring your relationship with the person ❌<br/>
            <strong>Correct:</strong> Pick phrases that fit the relationship ✅<br/>
            <em>Relationship often sets how formal you should be</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Context drives usage"
            description="Choose phrases that fit the situation."
            examples={[
              "Formal: meetings, presentations, interviews",
              "Informal: friends, family, casual chat",
              "Neutral: colleagues, acquaintances, mixed settings",
              "Consider your relationship with the person"
            ]}
          />

          <Rule 
            title="2. Appropriate responses"
            description="Answer in a natural, fitting way."
            examples={[
              "Greetings invite greeting replies",
              "Questions invite informative answers",
              "Courtesy phrases invite courteous replies",
              "Keep formality consistent"
            ]}
          />

          <Rule 
            title="3. Authenticity and naturalness"
            description="Use phrases that sound natural for you."
            examples={[
              "Practice until they feel natural",
              "Do not force phrases that feel wrong for you",
              "Adapt expressions to your personality",
              "Authenticity matters more than perfection"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Set Phrases"
      description="Master fixed expressions in English: greetings, goodbyes, courtesy, opinions, agreement and disagreement, and changing the topic. Learn to sound more natural in conversation."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildSetPhrasesExercises}
      prerequisites={["Basic speaking skills", "Understanding of formal vs informal language"]}
      estimatedTime="65 min"
    />
  );
};

export default SetPhrasesPage;
