'use client';
import { buildInteractionAndConversationalStrategiesExercises } from './interactionAndConversationalStrategiesExercises';
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


const InteractionAndConversationalStrategiesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Interaction and Conversational Strategies?" icon="🤝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Interaction and conversational strategies</strong> are specific techniques that help you take part effectively in conversations, keep communication flowing, and build successful interactions.
        </p>
        
        <QuickReference items={[
          "Techniques for starting and sustaining conversations",
          "Strategies for managing turn-taking",
          "Techniques for showing interest and engagement",
          "Strategies for handling interruptions and topic changes",
          "Tools for building successful interactions"
        ]} />
      </TheorySection>

      <TheorySection title="Starting Conversations" icon="🚀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Starting conversations effectively is essential for successful interactions.
        </p>

        <GrammarTable
          caption="Strategies for Starting Conversations"
          headers={["Strategy", "Description", "Context", "Example"]}
          rows={[
            ["Direct greeting", "Greet directly", "Formal situations", "Good morning, how are you?"],
            ["Comment on the situation", "Comment on what is happening around you", "Shared context", "It's a beautiful day, isn't it?"],
            ["Open question", "Ask a question that invites a full answer", "General conversation", "What brings you here today?"],
            ["Personal observation", "Share a personal observation", "Informal settings", "I love this place, don't you?"],
            ["Interest question", "Ask about the other person's interests", "Social settings", "What do you do for fun?"],
            ["Comment on an event", "Comment on something relevant happening now", "At an event", "Great presentation, wasn't it?"],
            ["Request for help", "Ask for help or information", "When you need something", "Excuse me, could you help me?"],
            ["Positive comment", "Make a positive remark", "General use", "I really like your presentation"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Direct greeting: 'Good morning, how are you?'"
          />
          <Example 
            english="Situation comment: 'It's a beautiful day, isn't it?'"
          />
          <Example 
            english="Open question: 'What brings you here today?'"
          />
        </div>

        <Rule 
          title="Tips for Starting Conversations"
          description="To start effectively:"
          examples={[
            "Choose strategies that fit the situation",
            "Consider your relationship with the person",
            "Use language that matches the level of formality",
            "Be genuine and authentic in your approach"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> How you open a conversation sets the tone for the whole interaction.
        </Tip>
      </TheorySection>

      <TheorySection title="Managing Turn-Taking" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Managing speaking turns well is essential for smooth, natural conversations.
        </p>

        <GrammarTable
          caption="Strategies for Managing Turns"
          headers={["Strategy", "Description", "When to Use", "Example"]}
          rows={[
            ["Taking a turn", "Begin your speaking turn", "When you want to contribute", "Can I add something here?"],
            ["Yielding the turn", "Let someone else speak", "When you have finished your point", "What do you think about this?"],
            ["Holding the turn", "Continue your turn", "When you are not done yet", "Let me finish this point first"],
            ["Interrupting politely", "Break in politely", "When you need to step in", "Sorry to interrupt, but..."],
            ["Asking for clarification", "Ask for clarification before you answer", "When something is unclear", "Could you clarify what you mean?"],
            ["Checking understanding", "Show you have understood", "Before you respond", "So you're saying that..."],
            ["Allowing thinking time", "Give space to process", "When someone needs a moment", "Take your time, no rush"],
            ["Changing the topic", "Shift topic smoothly", "When the topic has run its course", "That reminds me of something else"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Taking turn: 'Can I add something here?'"
          />
          <Example 
            english="Yielding turn: 'What do you think about this?'"
          />
          <Example 
            english="Polite interruption: 'Sorry to interrupt, but...'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Balanced turn-taking keeps the conversation engaging for everyone.
        </Tip>
      </TheorySection>

      <TheorySection title="Showing Interest and Engagement" icon="😊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Showing genuine interest and active engagement is key to successful conversations.
        </p>

        <GrammarTable
          caption="Strategies for Showing Interest"
          headers={["Strategy", "Description", "Function", "Example"]}
          rows={[
            ["Backchannel responses", "Show you are listening", "Signal attention", "Really? That's interesting!"],
            ["Follow-up questions", "Ask related questions", "Go deeper into the topic", "How did that make you feel?"],
            ["Supportive comments", "Respond in an encouraging way", "Show support", "That sounds amazing!"],
            ["Empathy phrases", "Show emotional understanding", "Connect emotionally", "I can understand how you feel"],
            ["Sharing experiences", "Share similar experiences", "Build rapport", "That happened to me too"],
            ["Validating opinions", "Acknowledge their perspective", "Show respect", "That's a valid point"],
            ["Expressing curiosity", "Show real curiosity", "Keep the conversation alive", "Tell me more about that"],
            ["Reflecting", "Paraphrase what was said", "Show understanding", "So what you're saying is..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Listening response: 'Really? That's interesting!'"
          />
          <Example 
            english="Follow-up question: 'How did that make you feel?'"
          />
          <Example 
            english="Supportive comment: 'That sounds amazing!'"
          />
        </div>

        <Rule 
          title="Tips for Showing Interest"
          description="To show genuine interest:"
          examples={[
            "Listen actively without distractions",
            "Ask relevant, sincere questions",
            "Share your own experiences when it fits",
            "Keep eye contact and open, positive body language"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not fake interest—stay genuine and authentic in how you take part.
        </Tip>
      </TheorySection>

      <TheorySection title="Handling Interruptions" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Handling interruptions well helps you keep the conversation on track.
        </p>

        <GrammarTable
          caption="Strategies for Handling Interruptions"
          headers={["Situation", "Strategy", "Response", "Example"]}
          rows={[
            ["Legitimate interruption", "Acknowledge and allow it", "Accept the interruption", "You're right, let me hear your point"],
            ["Inappropriate interruption", "Hold your turn", "Continue politely", "Let me finish this point first"],
            ["Interruption for clarification", "Clarify and continue", "Answer and move on", "Good question, let me explain"],
            ["Urgent interruption", "Address the urgency", "Deal with the urgent matter", "That's important, let's address it"],
            ["Interruption due to disagreement", "Handle the disagreement", "Acknowledge and proceed", "I understand your concern, but..."],
            ["Interruption due to distraction", "Redirect attention", "Return to the topic", "That's interesting, but let's focus on..."],
            ["Interruption to change topic", "Manage the shift", "Decide whether to change", "That's a good point, but first..."],
            ["Time-limited interruption", "Handle time pressure", "Summarize and continue", "We're running out of time, so..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Legitimate interruption: 'You're right, let me hear your point'"
          />
          <Example 
            english="Inappropriate interruption: 'Let me finish this point first'"
          />
          <Example 
            english="Clarification interruption: 'Good question, let me explain'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Skillful handling of interruptions keeps both control and respect in the conversation.
        </Tip>
      </TheorySection>

      <TheorySection title="Changing the Topic" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Moving to a new topic in a natural, polite way is an important conversation skill.
        </p>

        <GrammarTable
          caption="Strategies for Changing the Topic"
          headers={["Strategy", "Description", "When to Use", "Example"]}
          rows={[
            ["Smooth transition", "Shift gradually", "When the topic has run its course", "That reminds me of something else"],
            ["Direct transition", "Shift more openly", "When you need to move on", "Let's talk about something else"],
            ["Linked transition", "Bridge between topics", "When there is a connection", "Speaking of that, what about...?"],
            ["Question transition", "Move on with a question", "When you want to involve the other person", "What do you think about...?"],
            ["Comment transition", "Move on with a comment", "When you want to add something new", "That's interesting, but I also want to mention"],
            ["Time-based transition", "Shift because of time limits", "When time is short", "We're running out of time, so let's discuss"],
            ["Priority transition", "Shift because something matters more", "When something is more urgent", "That's important, but first let's address"],
            ["Consensus transition", "Shift once there is agreement", "When everyone is aligned", "We agree on that, so now let's talk about"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Smooth transition: 'That reminds me of something else'"
          />
          <Example 
            english="Connection transition: 'Speaking of that, what about...?'"
          />
          <Example 
            english="Question transition: 'What do you think about...?'"
          />
        </div>

        <Rule 
          title="Tips for Changing the Topic"
          description="To change topic effectively:"
          examples={[
            "Use transitions that fit the context",
            "Make sure the new topic connects or makes sense",
            "Consider whether the timing is right",
            "Keep people interested and involved"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Effective topic shifts keep the conversation lively and dynamic.
        </Tip>
      </TheorySection>

      <TheorySection title="Managing Conflict" icon="⚔️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Handling disagreement constructively is essential for productive conversations.
        </p>

        <GrammarTable
          caption="Strategies for Managing Conflict"
          headers={["Situation", "Strategy", "Approach", "Example"]}
          rows={[
            ["Minor disagreement", "Acknowledge and continue", "Keep respect", "I see your point, but I think differently"],
            ["Major disagreement", "Address it directly", "Seek understanding", "I understand your concern, let's discuss this"],
            ["Misunderstanding", "Clarify and explain", "Clear up confusion", "I think there might be a misunderstanding"],
            ["Clash of opinions", "Validate and explore", "Look for common ground", "Both viewpoints have merit, let's explore"],
            ["Clash of interests", "Acknowledge and negotiate", "Work toward a solution", "I understand your needs, let's find a solution"],
            ["Emotional tension", "Address feelings", "Reduce tension", "I can see this is important to you"],
            ["Time pressure conflict", "Handle limits", "Prioritize and organize", "We have limited time, let's focus on priorities"],
            ["Authority conflict", "Recognize roles", "Stay respectful", "I respect your position, but I'd like to suggest"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Minor disagreement: 'I see your point, but I think differently'"
          />
          <Example 
            english="Misunderstanding: 'I think there might be a misunderstanding'"
          />
          <Example 
            english="Emotional tension: 'I can see this is important to you'"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Poorly handled conflict can harm relationships—focus on constructive solutions.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Showing no interest in the conversation ❌<br/>
            <strong>Correct:</strong> Take part actively and show genuine interest ✅<br/>
            <em>Active engagement keeps the conversation alive</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Interrupting constantly ❌<br/>
            <strong>Correct:</strong> Balance turns fairly ✅<br/>
            <em>Balanced turn-taking keeps the flow smooth</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Changing the topic abruptly ❌<br/>
            <strong>Correct:</strong> Use appropriate transitions ✅<br/>
            <em>Smooth transitions preserve coherence</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Not handling conflict constructively ❌<br/>
            <strong>Correct:</strong> Address conflict with respect ✅<br/>
            <em>Constructive conflict management protects relationships</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Balanced participation"
            description="Keep participation balanced."
            examples={[
              "Listen as much as you speak",
              "Share turns fairly",
              "Show genuine interest in others",
              "Make room for everyone to contribute"
            ]}
          />

          <Rule 
            title="2. Respect and consideration"
            description="Treat everyone with respect in every interaction."
            examples={[
              "Listen without interrupting inappropriately",
              "Handle disagreement respectfully",
              "Consider other people's feelings",
              "Keep a positive, constructive tone"
            ]}
          />

          <Rule 
            title="3. Flexibility and adaptation"
            description="Stay flexible and adapt your style to the situation."
            examples={[
              "Adjust your style to the context",
              "Adapt to different personalities",
              "Handle different types of interaction",
              "Stay open in your approach"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Interaction and Conversational Strategies"
      description="Master interaction and conversational strategies in English. Learn techniques for starting conversations, managing turns, showing interest, and handling interruptions and conflict."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildInteractionAndConversationalStrategiesExercises}
      prerequisites={["Basic speaking skills", "Understanding of conversation dynamics"]}
      estimatedTime="85 min"
    />
  );
};

export default InteractionAndConversationalStrategiesPage;

