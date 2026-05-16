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

const MultipleChoiceClozePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is Multiple Choice Cloze?" icon="🎯">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Multiple Choice Cloze</strong> is a Use of English exam task where you complete a text by choosing 
          the correct word from four options. It focuses on vocabulary, collocations, idiomatic expressions, and 
          grammatical structures.
        </p>
        
        <QuickReference items={[
          "8 questions with 4 options each",
          "Tests vocabulary and collocations",
          "Focus on idiomatic expressions",
          "Context is key to the answer",
          "Recommended time: 10-12 minutes"
        ]} />
      </TheorySection>

      <TheorySection title="Key Strategies" icon="🧠">
        <Rule 
          title="1. Read the whole text first"
          description="Before trying to fill the gaps, read the entire text to understand the general context."
          examples={[
            "Identify the main topic",
            "Understand the tone of the text",
            "Notice connections between paragraphs"
          ]}
        />

        <Rule 
          title="2. Analyse the options carefully"
          description="The four options are usually similar or related words."
          examples={[
            "Look for subtle differences in meaning",
            "Consider register (formal/informal)",
            "Think about common collocations"
          ]}
        />

        <Rule 
          title="3. Consider the immediate context"
          description="Look at the words before and after the blank."
          examples={[
            "Prepositions that follow the verb",
            "Articles and determiners",
            "Logical connectors"
          ]}
        />

        <Example 
          spanish="The company decided to _____ its operations to Asia."
          english="Options: A) extend B) expand C) increase D) develop"
          translation="Answer: B) expand ('expand operations' is a common collocation)"
        />
      </TheorySection>

      <TheorySection title="Common Question Types" icon="📋">
        <GrammarTable
          caption="Multiple Choice Cloze Categories"
          headers={["Type", "Description", "Example"]}
          rows={[
            ["Collocations", "Natural word combinations", "make a decision / take a break"],
            ["Phrasal Verbs", "Verbs with prepositions/adverbs", "look after / put up with"],
            ["Idiomatic Expressions", "Phrases with a special meaning", "break the ice / hit the road"],
            ["Connectors", "Words that link ideas", "however / therefore / moreover"],
            ["Precise Vocabulary", "Synonyms with different nuances", "big / large / huge / enormous"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="She couldn't _____ the temptation to buy the dress."
            english="A) refuse B) resist C) reject D) deny"
            translation="Answer: B) resist ('resist temptation' is the correct collocation)"
          />
          
          <Example 
            spanish="The meeting was _____ until next week."
            english="A) delayed B) postponed C) suspended D) cancelled"
            translation="Answer: B) postponed ('postpone a meeting' is more precise than delay)"
          />
        </div>
      </TheorySection>

      <TheorySection title="Important Collocations" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1.5rem' }}>
          Collocations are word combinations that sound natural to native speakers.
        </p>

        <GrammarTable
          caption="Common Collocations in Exams"
          headers={["Verb", "Noun", "Example"]}
          rows={[
            ["make", "decision, mistake, progress, effort", "make a decision"],
            ["take", "action, advantage, responsibility", "take action"],
            ["do", "research, homework, business", "do research"],
            ["have", "experience, opportunity, effect", "have experience"],
            ["give", "advice, permission, presentation", "give advice"],
            ["pay", "attention, compliment, fine", "pay attention"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Read extensively in English to get used to natural collocations. 
          Collocation dictionaries are also very helpful.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Choosing the first option that seems correct<br/>
            <strong>Solution:</strong> Read all the options and consider the full context
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Ignoring the words after the gap<br/>
            <strong>Solution:</strong> Check which prepositions or structures follow
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Not considering the register of the text<br/>
            <strong>Solution:</strong> Decide whether the text is formal, informal, or neutral
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Translating literally from your first language<br/>
            <strong>Solution:</strong> Think in natural English expressions
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Elimination Technique" icon="❌">
        <Rule 
          title="Systematic elimination process"
          description="When you are not sure, use this process:"
          examples={[
            "1. Eliminate obviously incorrect options",
            "2. Consider the meaning in context",
            "3. Think about common collocations",
            "4. Choose the most natural option"
          ]}
        />

        <Example 
          spanish="The new policy will _____ effect next month."
          english="A) take B) make C) have D) get"
          translation="Process: 'make effect' ❌, 'have effect' ❌, 'get effect' ❌, 'take effect' ✅"
        />

        <Tip type="info">
          <strong>Remember:</strong> In this type of exercise, there is always one clearly correct answer. 
          If you are unsure between two options, look for extra clues in the context.
        </Tip>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="The company decided to _____ its workforce due to financial difficulties."
      options={[
        "reduce",
        "decrease",
        "lower",
        "cut"
      ]}
      correctAnswer={0}
      explanation="'Reduce workforce' is the most common and natural collocation in business contexts."
    />,

    <MultipleChoiceExercise
      key="2"
      question="She couldn't _____ her curiosity and opened the letter."
      options={[
        "control",
        "contain",
        "restrain",
        "suppress"
      ]}
      correctAnswer={1}
      explanation="'Contain curiosity' is the correct expression. Although 'control' is also possible, 'contain' is more precise in this context."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In Multiple Choice Cloze, you should always read the whole text before attempting to fill the gaps.",
          isTrue: true,
          explanation: "Correct. Reading the whole text first helps you understand the general context."
        },
        {
          text: "All four options in Multiple Choice Cloze are usually completely different in meaning.",
          isTrue: false,
          explanation: "False. The options are usually related words or synonyms with different nuances."
        },
        {
          text: "Collocations are not important in Multiple Choice Cloze exercises.",
          isTrue: false,
          explanation: "False. Collocations are fundamental in this type of exercise."
        },
        {
          text: "You should consider the words that come both before and after the gap.",
          isTrue: true,
          explanation: "Correct. The immediate context is crucial for choosing the right answer."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="The meeting has been _____ until further notice."
      options={[
        "delayed",
        "postponed", 
        "suspended",
        "cancelled"
      ]}
      correctAnswer={1}
      explanation="'Postponed until further notice' is the correct expression. 'Postpone' implies a new date will be set."
    />,

    <MultipleChoiceExercise
      key="5"
      question="You should _____ advantage of this opportunity while you can."
      options={[
        "make",
        "take",
        "get",
        "have"
      ]}
      correctAnswer={1}
      explanation="'Take advantage' is the correct collocation. It is a fixed expression in English."
    />,

    <MultipleChoiceExercise
      key="6"
      question="The new policy will _____ effect next month."
      options={[
        "take",
        "make",
        "have",
        "get"
      ]}
      correctAnswer={0}
      explanation="'Take effect' is the correct collocation when something comes into force."
    />,

    <MultipleChoiceExercise
      key="7"
      question="She has a natural _____ for languages."
      options={[
        "skill",
        "talent",
        "gift",
        "ability"
      ]}
      correctAnswer={2}
      explanation="'Natural gift' is the most common expression for innate abilities."
    />,

    <MultipleChoiceExercise
      key="8"
      question="The project was completed _____ schedule."
      options={[
        "ahead of",
        "before",
        "in front of",
        "prior to"
      ]}
      correctAnswer={0}
      explanation="'Ahead of schedule' is the fixed expression for finishing early."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Please _____ attention to the safety instructions."
      options={[
        "give",
        "pay",
        "make",
        "take"
      ]}
      correctAnswer={1}
      explanation="'Pay attention' is the correct collocation with 'attention'."
    />,

    <MultipleChoiceExercise
      key="10"
      question="The weather forecast _____ rain for tomorrow."
      options={[
        "predicts",
        "expects",
        "awaits",
        "anticipates"
      ]}
      correctAnswer={0}
      explanation="'Predicts' is the most appropriate verb for weather forecasts."
    />
  ];

  return (
    <TheoryLayout
      title="Multiple Choice Cloze"
      description="Master strategies for completing texts with multiple-choice options. Learn about collocations, vocabulary in context, and elimination techniques."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate-advanced vocabulary", "Basic collocations"]}
      estimatedTime="50 min"
    />
  );
};

export default MultipleChoiceClozePage;
