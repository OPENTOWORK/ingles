'use client';
import { buildMultipleChoiceClozeExercises } from './multipleChoiceClozeExercises';
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


const MultipleChoiceClozePage = () => {
  const theoryContent = (
    <>
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
          />
          
          <Example 
            spanish="The meeting was _____ until next week."
            english="A) delayed B) postponed C) suspended D) cancelled"
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
        />

        <Tip type="info">
          <strong>Remember:</strong> In this type of exercise, there is always one clearly correct answer. 
          If you are unsure between two options, look for extra clues in the context.
        </Tip>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Multiple Choice Cloze"
      description="Master strategies for completing texts with multiple-choice options. Learn about collocations, vocabulary in context, and elimination techniques."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildMultipleChoiceClozeExercises}
      prerequisites={["Intermediate-advanced vocabulary", "Basic collocations"]}
      estimatedTime="50 min"
    />
  );
};

export default MultipleChoiceClozePage;
