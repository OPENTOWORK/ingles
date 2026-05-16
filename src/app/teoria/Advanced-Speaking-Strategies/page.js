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

const AdvancedSpeakingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Advanced Speaking Strategies" icon="🎤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Advanced <strong>speaking strategies</strong> go beyond vocabulary and grammar. 
          They include fluency techniques, pause management, discourse structuring and adaptation to 
          context so you can communicate with naturalness and sophistication.
        </p>
        
        <QuickReference items={[
          "Fluency: techniques for speaking without long breaks",
          "Natural fillers and connectors",
          "Clear discourse structuring",
          "Adaptation to register and context",
          "Strategies to buy time"
        ]} />
      </TheorySection>

      <TheorySection title="Fluency Techniques" icon="🌊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Fluency does not mean speaking fast; it means keeping natural flow without long pauses or hesitation.
        </p>

        <Rule 
          title="Strategies to maintain fluency"
          description="Techniques for speaking in a steady, natural way:"
          examples={[
            "Use appropriate fillers: 'Well', 'You know', 'Actually'",
            "Paraphrase when you cannot find the exact word",
            "Use hedges: 'kind of', 'sort of', 'something like'",
            "Link ideas with natural linking words",
            "Practice chunking (groups of words as units)"
          ]}
        />

        <GrammarTable
          caption="Fillers by Register"
          headers={["Context", "Appropriate fillers", "Example of use"]}
          rows={[
            ["Informal", "Um, er, like, you know, I mean", "'Like, I was thinking, you know, maybe we could...'"],
            ["Neutral", "Well, actually, basically, obviously", "'Well, actually, that's a good point'"],
            ["Formal", "Let me think, I would say, In fact", "'Let me think about that for a moment'"],
            ["Academic", "Indeed, Furthermore, As I was saying", "'Indeed, this raises an interesting question'"],
            ["Presentations", "Now, Moving on, As you can see", "'Now, let's consider the implications'"]
          ]}
        />

        <Tip type="success">
          <strong>Practice:</strong> Record yourself speaking for two minutes on any topic. 
          Count long pauses ({'>'}3 seconds) and work on reducing them.
        </Tip>
      </TheorySection>

      <TheorySection title="Discourse Structuring" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Well-structured discourse is easier to follow and shows organized thinking.
        </p>

        <GrammarTable
          caption="Phrases for Structuring Discourse"
          headers={["Function", "Useful phrases", "Context"]}
          rows={[
            ["Introduce topic", "I'd like to talk about..., Let me start by saying...", "Start of answer"],
            ["Add points", "Another point is..., What's more..., On top of that...", "Developing the answer"],
            ["Give examples", "For instance..., Take... for example, A case in point is...", "Supporting with evidence"],
            ["Contrast", "On the other hand..., Having said that..., Then again...", "Show different perspectives"],
            ["Conclude", "To sum up..., All in all..., At the end of the day...", "Closing the answer"],
            ["Change topic", "Moving on to..., That brings me to..., Speaking of...", "Transitions"]
          ]}
        />

        <Example 
            english="'Well, there are definitely both pros and cons to consider. On the positive side, [advantage 1]. What's more, [advantage 2]. Having said that, we can't ignore the downsides. For instance, [disadvantage 1]. On top of that, [disadvantage 2]. All in all, I think the benefits outweigh the drawbacks.'"
          />
      </TheorySection>

      <TheorySection title="Strategies to Buy Time" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          When you need time to think, use these strategies instead of staying silent.
        </p>

        <GrammarTable
          caption="Techniques for Buying Time"
          headers={["Strategy", "Phrases", "When to use"]}
          rows={[
            ["Repeat the question", "'So you're asking about...', 'When you say...'", "Complex questions"],
            ["Clarify", "'Could you be more specific?', 'Do you mean...?'", "Ambiguous questions"],
            ["Reflect", "'That's an interesting question', 'Let me think about that'", "Difficult questions"],
            ["Rephrase", "'In other words...', 'What I'm trying to say is...'", "When you get stuck"],
            ["Generalise", "'Generally speaking...', 'As a rule...'", "When you lack specific examples"],
            ["Personalise", "'In my experience...', 'From my point of view...'", "Make the answer more personal"]
          ]}
        />

        <Tip type="info">
          <strong>Mirror technique:</strong> Repeat part of the question to buy time: 
          "What do I think about social media? Well, social media is definitely..."
        </Tip>
      </TheorySection>

      <TheorySection title="Adapting to Register" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Adapting how you speak to context and audience shows advanced communicative competence.
        </p>

        <GrammarTable
          caption="Adaptation by Context"
          headers={["Context", "Features", "Example"]}
          rows={[
            ["Casual conversation", "Contractions, moderate slang, relaxed tone", "'I'd say it's pretty cool, you know?'"],
            ["Job interview", "Formal yet personal, concrete examples", "'I believe my experience demonstrates...'"],
            ["Academic presentation", "Technical vocabulary, clear structure", "'The data suggests that...'"],
            ["Debate / discussion", "Solid arguments, acknowledge other views", "'While I understand your point, I would argue...'"],
            ["Social situation", "Friendly, inclusive, empathic", "'That must have been really difficult for you'"]
          ]}
        />

        <Rule 
          title="Signals for adjusting register"
          description="Notice these cues to adapt how you speak:"
          examples={[
            "Your interlocutor's age and role",
            "Formality of the setting (office vs café)",
            "Purpose of the conversation (social vs professional)",
            "How others address you (formal vs informal)",
            "Topic of conversation (personal vs technical)"
          ]}
        />
      </TheorySection>

      <TheorySection title="Managing Interruptions and Turn-Taking" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In natural conversation, knowing when and how to take turns is crucial for effective communication.
        </p>

        <GrammarTable
          caption="Turn-Taking in Conversation"
          headers={["Situation", "Useful phrases", "Tone"]}
          rows={[
            ["Interrupt politely", "'Sorry to interrupt, but...', 'Can I just say...'", "Apology + contribution"],
            ["Hold your turn", "'Let me just finish...', 'I was about to say...'", "Firm yet polite"],
            ["Yield the turn", "'What do you think?', 'How do you see it?'", "Inclusive"],
            ["Return to topic", "'Going back to what you said...', 'As I was saying...'", "Organising"],
            ["Change topic", "'That reminds me...', 'Speaking of which...'", "Natural and fluent"]
          ]}
        />

        <Tip type="warning">
          <strong>Cultural note:</strong> Norms for interrupting vary across cultures. 
          In formal English-speaking settings, wait for natural pauses before speaking.
        </Tip>
      </TheorySection>

      <TheorySection title="Expressing Nuanced Opinions" icon="🎨">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Sophisticated opinions are rarely black-and-white. Learn to express nuances and degrees of certainty.
        </p>

        <GrammarTable
          caption="Degrees of Certainty and Opinion"
          headers={["Level", "Expressions", "Example"]}
          rows={[
            ["Full certainty", "I'm absolutely certain, Without a doubt", "'I'm absolutely certain this is the right approach'"],
            ["Very likely", "I'm pretty sure, Most likely, I'd say", "'I'm pretty sure that's not going to work'"],
            ["Probable", "I think, I believe, It seems to me", "'It seems to me that we need more data'"],
            ["Possible", "I suppose, Maybe, It's possible that", "'I suppose we could try that approach'"],
            ["Doubtful", "I doubt, I'm not sure, It's unlikely", "'I doubt that's the real reason'"],
            ["Neutral", "It depends, That's debatable, I see both sides", "'It depends on how you look at it'"]
          ]}
        />

        <Example 
            english="'While I can see the benefits of remote work, I'm not entirely convinced it works for everyone. It seems to me that it depends largely on the individual's personality and the nature of their job. Having said that, I do think most companies could be more flexible than they currently are.'"
          />
      </TheorySection>

      <TheorySection title="Self-Correction Techniques" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Correcting yourself in a natural way shows linguistic awareness and keeps fluency.
        </p>

        <Rule 
          title="Natural self-correction strategies"
          description="Correct errors without breaking the flow:"
          examples={[
            "Immediate rephrase: 'I mean...' + corrected version",
            "Clarify: 'What I meant to say was...'",
            "Refine: 'Or rather...' + a more precise version",
            "Continue: ignore minor slips and carry on",
            "Paraphrase: 'In other words...' + alternative explanation"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="'The weather was very... I mean, extremely hot yesterday.'"
          />
          
          <Example 
            english="'I have been there yesterday... well, I went there yesterday.'"
          />
        </div>

        <Tip type="success">
          <strong>Practice:</strong> Do not stop for minor errors. Native speakers also 
          make mistakes and self-correct naturally.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes in Advanced Speaking" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Using too many formal fillers in casual conversation<br/>
            <strong>Solution:</strong> Adapt register: use 'Well' instead of 'Furthermore' in informal settings
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Long silences without signalling that you are thinking<br/>
            <strong>Solution:</strong> Use 'Let me think about that' or 'That's a good question'
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Overly absolute opinions without nuance<br/>
            <strong>Solution:</strong> Use 'I tend to think' or 'In my experience' to soften
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Failing to structure long answers<br/>
            <strong>Solution:</strong> Use 'Firstly... Secondly... Lastly...' to organise ideas
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which filler is most appropriate for a job interview?"
      options={[
        "Like, you know...",
        "Um, er...",
        "Let me think about that...",
        "I mean, like..."
      ]}
      correctAnswer={2}
      explanation="'Let me think about that' sounds professional and shows reflection; it fits interviews well."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What's the best way to express a moderate opinion about a controversial topic?"
      options={[
        "I'm absolutely certain that...",
        "It seems to me that...",
        "Without a doubt...",
        "Everyone knows that..."
      ]}
      correctAnswer={1}
      explanation="'It seems to me that...' states a personal view without sounding too absolute, which suits controversial topics."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Using fillers like 'um' and 'er' should always be avoided in formal speaking.",
          isTrue: false,
          explanation: "False. Some fillers are natural even in formal settings, but use them sparingly."
        },
        {
          text: "Self-correction during speaking shows linguistic awareness and is generally positive.",
          isTrue: true,
          explanation: "Correct. Natural self-correction shows linguistic awareness and is viewed positively."
        },
        {
          text: "In formal presentations, you should avoid using personal examples.",
          isTrue: false,
          explanation: "False. Personal examples can work in formal settings when they are relevant."
        },
        {
          text: "Adapting your register to match your audience shows advanced communication skills.",
          isTrue: true,
          explanation: "Correct. Adapting register shows advanced communicative competence."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="How should you handle a question you don't immediately know how to answer?"
      options={[
        "Stay silent until you think of something",
        "Say 'I don't know' and stop talking",
        "Say 'That's an interesting question, let me think about that'",
        "Change the topic immediately"
      ]}
      correctAnswer={2}
      explanation="That response buys time professionally and shows you are taking the question seriously."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which phrase best helps you maintain your speaking turn when someone tries to interrupt?"
      options={[
        "Stop interrupting me!",
        "Let me just finish this point...",
        "You're wrong!",
        "I'm not done yet!"
      ]}
      correctAnswer={1}
      explanation="'Let me just finish this point...' is polite but firm, holding your turn without sounding aggressive."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Which is the best way to buy time when you need to think?"
      options={[
        "Stay silent for 30 seconds",
        "That's an interesting question, let me consider that",
        "I don't know",
        "Can you repeat the question?"
      ]}
      correctAnswer={1}
      explanation="That phrase buys time professionally while showing you are considering the question."
    />,

    <MultipleChoiceExercise
      key="7"
      question="What's the most appropriate way to self-correct in formal speaking?"
      options={[
        "Sorry, I'm stupid",
        "What I meant to say was...",
        "Forget what I said",
        "I'm always wrong"
      ]}
      correctAnswer={1}
      explanation="'What I meant to say was...' is a natural, professional way to self-correct."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which filler is most appropriate for academic presentations?"
      options={[
        "Like, um...",
        "You know...",
        "Now, let's consider...",
        "I mean, like..."
      ]}
      correctAnswer={2}
      explanation="'Now, let's consider...' is formal and appropriate for academic contexts."
    />,

    <MultipleChoiceExercise
      key="9"
      question="How should you express uncertainty in a professional context?"
      options={[
        "I have no idea",
        "I'm not sure, but I believe...",
        "I don't know anything",
        "That's impossible to know"
      ]}
      correctAnswer={1}
      explanation="'I'm not sure, but I believe...' is honest while still offering your best estimate."
    />,

    <MultipleChoiceExercise
      key="10"
      question="What's the best way to change topics smoothly in conversation?"
      options={[
        "Stop talking about that",
        "That reminds me of...",
        "I'm bored with this topic",
        "Let's talk about something else"
      ]}
      correctAnswer={1}
      explanation="'That reminds me of...' is a natural transition that links topics smoothly."
    />
  ];

  return (
    <TheoryLayout
      title="Advanced Speaking Strategies"
      description="Build sophisticated speaking strategies: fluency, discourse structuring, register adaptation and natural conversation management."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic speaking", "Connectors", "Vocabulary by register"]}
      estimatedTime="60 min"
    />
  );
};

export default AdvancedSpeakingPage;
