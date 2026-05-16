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

const ActiveGrammarAndUsefulStructuresPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is Active Grammar and Useful Structures?" icon="⚡">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Active grammar and useful structures</strong> refers to grammatical patterns and structures used actively in speech to express ideas fluently and naturally.
        </p>
        
        <QuickReference items={[
          "Grammatical structures for active use in conversation",
          "Patterns that let you express complex ideas",
          "Structures for different communicative functions",
          "Practical grammar for fluent speaking",
          "Tools for effective, natural communication"
        ]} />
      </TheorySection>

      <TheorySection title="Structures for Expressing Opinions" icon="💭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These structures help you express opinions clearly and convincingly in conversation.
        </p>

        <GrammarTable
          caption="Structures for Expressing Opinions"
          headers={["Structure", "Use", "Level of Certainty", "Example"]}
          rows={[
            ["I think that...", "Personal opinion", "Moderate", "I think that technology is beneficial"],
            ["In my opinion...", "Formal personal opinion", "Moderate", "In my opinion, education is important"],
            ["I believe that...", "Strong belief", "Strong", "I believe that we should act now"],
            ["I feel that...", "Personal feeling", "Emotional", "I feel that this is wrong"],
            ["It seems to me that...", "Careful opinion", "Tentative", "It seems to me that this might work"],
            ["I would argue that...", "Making an argument", "Persuasive", "I would argue that we need change"],
            ["From my perspective...", "Personal point of view", "Formal", "From my perspective, this is beneficial"],
            ["I'm convinced that...", "Strong conviction", "Very strong", "I'm convinced that this is the right approach"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Moderate: 'I think that technology is beneficial'"
          />
          <Example 
            english="Strong: 'I believe that we should act now'"
          />
          <Example 
            english="Persuasive: 'I would argue that we need change'"
          />
        </div>

        <Rule 
          title="Using Opinion Structures"
          description="To use them effectively:"
          examples={[
            "Choose structures that match how certain you sound",
            "Vary structures to avoid repetition",
            "Consider context and register",
            "Use structures that match how you genuinely feel"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Opinion structures let you state your viewpoint clearly and persuasively.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Giving Examples" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These structures help you support your ideas with specific, convincing examples.
        </p>

        <GrammarTable
          caption="Structures for Giving Examples"
          headers={["Structure", "Use", "Position", "Example"]}
          rows={[
            ["For example...", "Specific example", "Sentence opening", "For example, smartphones have changed communication"],
            ["For instance...", "Specific example", "Sentence opening", "For instance, social media connects people"],
            ["Such as...", "List of examples", "Middle of sentence", "Technology such as AI and robotics is advancing"],
            ["Like...", "Informal example", "Middle of sentence", "Apps like WhatsApp are very popular"],
            ["Take... for example", "Specific example", "Sentence opening", "Take smartphones for example"],
            ["A good example is...", "Highlighted example", "Sentence opening", "A good example is the internet"],
            ["Consider...", "Example for reflection", "Sentence opening", "Consider how email changed communication"],
            ["Let's say...", "Hypothetical example", "Sentence opening", "Let's say you want to learn a language"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Specific: 'For example, smartphones have changed communication'"
          />
          <Example 
            english="List: 'Technology such as AI and robotics is advancing'"
          />
          <Example 
            english="Highlighted: 'A good example is the internet'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Examples make your arguments easier to understand and more persuasive.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Comparing and Contrasting" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These structures help you draw effective comparisons and contrasts in conversation.
        </p>

        <GrammarTable
          caption="Structures for Comparing and Contrasting"
          headers={["Structure", "Use", "Function", "Example"]}
          rows={[
            ["Similarly...", "Show similarity", "Comparison", "Similarly, both methods are effective"],
            ["In contrast...", "Show difference", "Contrast", "In contrast, this approach is different"],
            ["On the other hand...", "Show an alternative", "Contrast", "On the other hand, we could try this"],
            ["Unlike...", "Show difference", "Contrast", "Unlike the previous method, this is faster"],
            ["Whereas...", "Show contrast", "Formal contrast", "Whereas A is expensive, B is cheap"],
            ["Compared to...", "Make a comparison", "Comparison", "Compared to last year, sales are higher"],
            ["In comparison with...", "Formal comparison", "Comparison", "In comparison with other options, this is better"],
            ["Both... and...", "Show similarity", "Similarity", "Both methods are effective"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Similarity: 'Similarly, both methods are effective'"
          />
          <Example 
            english="Contrast: 'In contrast, this approach is different'"
          />
          <Example 
            english="Comparison: 'Compared to last year, sales are higher'"
          />
        </div>

        <Rule 
          title="Using Comparison Structures"
          description="To use them effectively:"
          examples={[
            "Pick structures that fit the kind of comparison you mean",
            "Make sure the comparison is clear",
            "Vary structures to avoid repetition",
            "Consider how formal or informal the context is"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Make sure comparisons stay relevant and clear for your audience.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Cause and Effect" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These structures help you explain cause-and-effect relationships clearly and logically.
        </p>

        <GrammarTable
          caption="Structures for Cause and Effect"
          headers={["Structure", "Use", "Function", "Example"]}
          rows={[
            ["Because...", "Explain cause", "Direct cause", "Because technology is advancing, life is easier"],
            ["Since...", "Explain cause", "Formal cause", "Since we have the internet, communication is faster"],
            ["As a result...", "Show outcome", "Effect", "Technology advanced. As a result, productivity increased"],
            ["Therefore...", "Show consequence", "Formal effect", "We need change. Therefore, we must act"],
            ["Due to...", "Explain cause (formal)", "Formal cause", "Due to technology, work is more efficient"],
            ["Owing to...", "Explain cause (formal)", "Very formal cause", "Owing to advances, we can do more"],
            ["Consequently...", "Show consequence", "Formal effect", "Technology improved. Consequently, life is better"],
            ["This is why...", "Explain reasoning", "Explanation", "Technology is important. This is why we invest in it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Direct cause: 'Because technology is advancing, life is easier'"
          />
          <Example 
            english="Effect: 'Technology advanced. As a result, productivity increased'"
          />
          <Example 
            english="Formal cause: 'Due to technology, work is more efficient'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Cause-and-effect structures make your arguments sound more logical and persuasive.
        </Tip>
      </TheorySection>

      <TheorySection title="Advanced Conditional Structures" icon="🔀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These conditional structures let you express hypotheses and conditions in a more sophisticated way.
        </p>

        <GrammarTable
          caption="Advanced Conditional Structures"
          headers={["Structure", "Use", "Condition", "Example"]}
          rows={[
            ["If... then...", "General condition", "Any condition", "If we work hard, then we will succeed"],
            ["Provided that...", "Specific condition", "Formal condition", "Provided that we have resources, we can proceed"],
            ["As long as...", "Ongoing condition", "Continuous condition", "As long as we work together, we can achieve our goals"],
            ["Unless...", "Negative condition", "Unless / except if", "Unless we act now, we will lose the opportunity"],
            ["In case...", "Preparing for a possibility", "Precaution", "In case of problems, we have a backup plan"],
            ["Suppose...", "Hypothesis", "Hypothetical situation", "Suppose we had more time, what would we do?"],
            ["Imagine if...", "Creative hypothesis", "Imagination", "Imagine if we could solve this problem easily"],
            ["What if...", "Hypothetical question", "Exploration", "What if we tried a different approach?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="General condition: 'If we work hard, then we will succeed'"
          />
          <Example 
            english="Specific condition: 'Provided that we have resources, we can proceed'"
          />
          <Example 
            english="Negative condition: 'Unless we act now, we will lose the opportunity'"
          />
        </div>

        <Rule 
          title="Using Conditional Structures"
          description="To use them effectively:"
          examples={[
            "Choose structures that match the type of condition you mean",
            "Consider how formal or informal the context is",
            "Use structures that reflect how likely the condition is",
            "Vary structures to avoid repetition"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Conditional structures let you explore possibilities and hypotheses in a nuanced way.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Concluding" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These structures help you wrap up your arguments effectively and convincingly.
        </p>

        <GrammarTable
          caption="Structures for Concluding"
          headers={["Structure", "Use", "Function", "Example"]}
          rows={[
            ["In conclusion...", "Formal conclusion", "Formal close", "In conclusion, technology is beneficial"],
            ["To sum up...", "Summary", "Synthesis", "To sum up, we need to act now"],
            ["All in all...", "Overall conclusion", "General assessment", "All in all, this is a good solution"],
            ["Overall...", "General assessment", "Big-picture view", "Overall, the results are positive"],
            ["In summary...", "Formal summary", "Formal synthesis", "In summary, we have three main points"],
            ["To conclude...", "Formal conclusion", "Formal close", "To conclude, we must take action"],
            ["Finally...", "Final point", "Last emphasis", "Finally, I want to emphasize the importance"],
            ["In the end...", "Final conclusion", "End result", "In the end, what matters is the result"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Formal conclusion: 'In conclusion, technology is beneficial'"
          />
          <Example 
            english="Summary: 'To sum up, we need to act now'"
          />
          <Example 
            english="General evaluation: 'Overall, the results are positive'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Strong conclusions reinforce your argument and leave a lasting impression.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Always using the same structures ❌<br/>
            <strong>Correct:</strong> Vary structures to avoid repetition ✅<br/>
            <em>Variety makes your speech more interesting and natural</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using formal structures in informal settings ❌<br/>
            <strong>Correct:</strong> Adapt structures to the context ✅<br/>
            <em>Context decides what register fits best</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignoring how certain you sound ❌<br/>
            <strong>Correct:</strong> Pick structures that match your level of certainty ✅<br/>
            <em>How sure you are should show up in the structure you choose</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Not practising the structures ❌<br/>
            <strong>Correct:</strong> Practise structures in real contexts ✅<br/>
            <em>Practice builds fluency and naturalness</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Variety and flexibility"
            description="Develop variety in how you use structures."
            examples={[
              "Learn different ways to express the same idea",
              "Practise different levels of formality",
              "Build structures for different functions",
              "Use variety to avoid repetition"
            ]}
          />

          <Rule 
            title="2. Appropriate context"
            description="Match structures to the situation."
            examples={[
              "Consider how formal the context is",
              "Adapt depending on your relationship with the person",
              "Use structures suited to the situation",
              "Notice how others use structures in that context"
            ]}
          />

          <Rule 
            title="3. Active practice"
            description="Use structures actively, not passively."
            examples={[
              "Use structures in real conversations",
              "Practise in different contexts",
              "Get feedback on how you use them",
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
      question="What kinds of structures are used to speak fluently?"
      options={[
        "Passive",
        "Active",
        "Complex",
        "Simple"
      ]}
      correctAnswer={1}
      explanation="Active structures support fluent speech because they tend to sound more direct and natural in conversation."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the main benefit of using active grammatical structures?"
      options={[
        "Improving pronunciation",
        "Speaking fluently and naturally",
        "Speaking faster",
        "Needing less vocabulary"
      ]}
      correctAnswer={1}
      explanation="The main benefit is speaking fluently and naturally: active structures help you express complex ideas effectively."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "It is important to vary structures to avoid repetition.",
          isTrue: true,
          explanation: "Correct. Varying structures keeps your speech more interesting and natural, and avoids monotone repetition."
        },
        {
          text: "Formal structures are appropriate in every context.",
          isTrue: false,
          explanation: "Incorrect. Structures should suit the context. Formal ones are often a poor fit in informal situations."
        },
        {
          text: "Active practice builds fluency in using structures.",
          isTrue: true,
          explanation: "Correct. Active practice in real contexts is one of the best ways to gain fluency and naturalness."
        },
        {
          text: "Context does not influence which structures you choose.",
          isTrue: false,
          explanation: "Incorrect. Context shapes which structures fit. Different situations call for different levels of formality."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which structure best expresses an opinion with moderate certainty?"
      options={[
        "I'm absolutely sure that...",
        "I think that...",
        "I have no idea...",
        "It might be..."
      ]}
      correctAnswer={1}
      explanation="'I think that...' signals moderate certainty, while the others lean toward certainty, uncertainty, or possibility."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which structure fits a formal conclusion best?"
      options={[
        "All in all...",
        "In conclusion...",
        "Finally...",
        "What if..."
      ]}
      correctAnswer={1}
      explanation="'In conclusion...' is the best fit for a formal conclusion here; the other options suit informal wrapping-up or different purposes."
    />
  ];

  return (
    <TheoryLayout
      title="Active Grammar and Useful Structures"
      description="Master active grammar and useful structures in English. Learn grammatical patterns for stating opinions, giving examples, comparing, explaining cause and effect, and concluding effectively."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar knowledge", "Understanding of sentence structures"]}
      estimatedTime="80 min"
    />
  );
};

export default ActiveGrammarAndUsefulStructuresPage;
