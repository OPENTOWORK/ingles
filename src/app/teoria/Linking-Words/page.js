'use client';
import { buildLinkingWordsExercises } from './linkingWordsExercises';
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


const LinkingWordsPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Linking Words?" icon="🔗">
        <div style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Linking words</strong> are words or phrases that connect ideas, sentences, and paragraphs. 
          They help us produce coherent, fluent texts, especially at intermediate and advanced levels. They are essential 
          for academic and professional writing.
        </div>
        
        <QuickReference items={[
          "They connect ideas and sentences",
          "They improve the flow of a text",
          "They signal relationships between ideas",
          "They are essential for academic writing",
          "They help you organize arguments"
        ]} />
      </TheorySection>

      <TheorySection title="Addition" icon="➕">
        <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These words are used to add information or similar ideas.
        </div>

        <GrammarTable
          caption="Linking Words for Addition"
          headers={["Word", "Use", "Position", "Example"]}
          rows={[
            ["and", "simple addition", "between elements", "I like tea and coffee"],
            ["also", "additional information", "beginning/middle", "I also like green tea"],
            ["too", "agreement/addition", "end of sentence", "I like coffee too"],
            ["as well", "additional information", "end of sentence", "I like coffee as well"],
            ["furthermore", "formal addition", "beginning of sentence", "Furthermore, we need more time"],
            ["moreover", "formal addition", "beginning of sentence", "Moreover, it is expensive"],
            ["in addition", "formal addition", "beginning of sentence", "In addition, we have other options"],
            ["besides", "additional point", "beginning/middle", "Besides, it is more convenient"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el té y el café"
            english="I like tea and coffee"
          />
          <Example 
            spanish="También me gusta el té verde"
            english="I also like green tea"
          />
          <Example 
            spanish="Además, necesitamos más tiempo"
            english="Furthermore, we need more time"
          />
        </div>

        <Rule 
          title="Tips for Addition"
          description="To add information effectively:"
          examples={[
            "Use 'and' for simple connections",
            "Use 'also' for extra information",
            "Use 'furthermore' in formal contexts",
            "Avoid repeating the same linking word"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Addition words help you build strong arguments step by step.
        </Tip>
      </TheorySection>

      <TheorySection title="Contrast" icon="⚖️">
        <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These words show differences or contrasts between ideas.
        </div>

        <GrammarTable
          caption="Linking Words for Contrast"
          headers={["Word", "Use", "Example"]}
          rows={[
            ["but", "direct contrast", "I like coffee, but I prefer tea"],
            ["however", "formal contrast", "I like coffee. However, I prefer tea"],
            ["although", "contrast (even though)", "Although I like coffee, I prefer tea"],
            ["though", "informal contrast", "I like coffee, though I prefer tea"],
            ["even though", "strong contrast", "Even though it's expensive, I'll buy it"],
            ["despite", "contrast (formal)", "Despite the rain, we went out"],
            ["in spite of", "contrast (formal)", "In spite of the problems, we succeeded"],
            ["on the other hand", "alternative view", "It's expensive. On the other hand, it's good quality"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el café, pero prefiero el té"
            english="I like coffee, but I prefer tea"
          />
          <Example 
            spanish="A pesar de la lluvia, salimos"
            english="Despite the rain, we went out"
          />
          <Example 
            spanish="Por otro lado, es de buena calidad"
            english="On the other hand, it's good quality"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Put 'however' at the beginning of the second sentence, not at the end of the first.
        </Tip>
      </TheorySection>

      <TheorySection title="Cause and Effect" icon="⚡">
        <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These words explain why something happens (cause) and what follows from it (effect).
        </div>

        <GrammarTable
          caption="Linking Words for Cause and Effect"
          headers={["Type", "Word", "Example"]}
          rows={[
            ["Cause", "because", "I stayed home because I was sick"],
            ["Cause", "since", "Since it's raining, we'll stay inside"],
            ["Cause", "as", "As it was late, we decided to leave"],
            ["Cause", "due to", "Due to the weather, the flight was cancelled"],
            ["Effect", "so", "I was tired, so I went to bed"],
            ["Effect", "therefore", "It was raining. Therefore, we stayed inside"],
            ["Effect", "thus", "The roads were icy. Thus, driving was dangerous"],
            ["Effect", "consequently", "He didn't study. Consequently, he failed"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me quedé en casa porque estaba enfermo"
            english="I stayed home because I was sick"
          />
          <Example 
            spanish="Estaba cansado, así que me fui a la cama"
            english="I was tired, so I went to bed"
          />
          <Example 
            spanish="Por lo tanto, nos quedamos dentro"
            english="Therefore, we stayed inside"
          />
        </div>

        <Rule 
          title="Tips for Cause and Effect"
          description="To explain causal relationships:"
          examples={[
            "Use 'because' to give reasons",
            "Use 'so' to show results",
            "Use 'therefore' in formal contexts",
            "Make the cause-and-effect relationship clear"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Cause-and-effect words help you build logical, persuasive arguments.
        </Tip>
      </TheorySection>

      <TheorySection title="Sequence" icon="📋">
        <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These words organize ideas in chronological or logical order.
        </div>

        <GrammarTable
          caption="Linking Words for Sequence"
          headers={["Word", "Use", "Example"]}
          rows={[
            ["first", "to begin", "First, we need to plan"],
            ["second", "second step", "Second, we should research"],
            ["third", "third step", "Third, we can start working"],
            ["then", "next step", "First, plan. Then, execute"],
            ["next", "following step", "Next, we need to evaluate"],
            ["finally", "final step", "Finally, we can present our results"],
            ["lastly", "final step", "Lastly, don't forget to follow up"],
            ["eventually", "final outcome", "Eventually, we will succeed"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Primero, necesitamos planificar"
            english="First, we need to plan"
          />
          <Example 
            spanish="Luego, ejecutamos"
            english="Then, we execute"
          />
          <Example 
            spanish="Finalmente, presentamos los resultados"
            english="Finally, we present our results"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Sequence markers make your texts easier to follow.
        </Tip>
      </TheorySection>

      <TheorySection title="Examples" icon="💡">
        <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These words introduce examples or illustrations to support your ideas.
        </div>

        <GrammarTable
          caption="Linking Words for Examples"
          headers={["Word", "Use", "Example"]}
          rows={[
            ["for example", "introduce an example", "Many fruits are healthy. For example, apples and oranges"],
            ["for instance", "introduce an example", "Some sports are dangerous. For instance, boxing"],
            ["such as", "list examples", "I like tropical fruits such as mangoes and pineapples"],
            ["namely", "specific examples", "I have three hobbies, namely reading, swimming, and cooking"],
            ["to illustrate", "formal example", "To illustrate this point, consider the following case"],
            ["as an example", "formal example", "As an example, let's look at the sales figures"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Muchas frutas son saludables. Por ejemplo, manzanas y naranjas"
            english="Many fruits are healthy. For example, apples and oranges"
          />
          <Example 
            spanish="Me gustan las frutas tropicales como mangos y piñas"
            english="I like tropical fruits such as mangoes and pineapples"
          />
          <Example 
            spanish="Tengo tres hobbies, a saber: leer, nadar y cocinar"
            english="I have three hobbies, namely reading, swimming, and cooking"
          />
        </div>

        <Rule 
          title="Tips for Examples"
          description="To use examples effectively:"
          examples={[
            "Choose relevant, clear examples",
            "Vary your introductory phrases",
            "Make sure examples support your point",
            "Do not overload the text with examples"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Concrete examples make your arguments more convincing.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Using 'but' at the start of a sentence ❌<br/>
            <strong>Correct:</strong> Use 'however' at the beginning ✅<br/>
            <em>But: I like coffee. But I prefer tea. → However: I like coffee. However, I prefer tea.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Using 'and' to start a sentence ❌<br/>
            <strong>Correct:</strong> Use 'in addition' or 'furthermore' ✅<br/>
            <em>And: And we also need to consider... → In addition: In addition, we also need to consider...</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Mixing up 'because' and 'so' ❌<br/>
            <strong>Correct:</strong> Use only one of them ✅<br/>
            <em>Because I was tired, so I went to bed. → Because I was tired, I went to bed. / I was tired, so I went to bed.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Not varying linking words ❌<br/>
            <strong>Correct:</strong> Use a variety of connectors ✅<br/>
            <em>Always repeating 'and' → Use 'also', 'furthermore', 'in addition', etc.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Position in the sentence"
            description="Where you place linking words matters."
            examples={[
              "Some go at the beginning (however, therefore)",
              "Others go in the middle (and, but)",
              "Some go at the end (too, as well)",
              "Read examples to learn the correct position"
            ]}
          />

          <Rule 
            title="2. Formality"
            description="Choose words that fit the context."
            examples={[
              "Informal: but, so, and",
              "Formal: however, therefore, furthermore",
              "Academic: moreover, consequently, nevertheless",
              "Adapt your choice to the context"
            ]}
          />

          <Rule 
            title="3. Variety"
            description="Use different linking words to avoid repetition."
            examples={[
              "Do not rely on the same word every time",
              "Learn synonyms and alternatives",
              "Vary them according to the type of relationship",
              "Practice in different contexts"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Linking Words"
      description="Master linking words in English. Learn how to connect ideas, show contrast, explain causes and effects, and produce coherent, fluent texts."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildLinkingWordsExercises}
      prerequisites={["Basic sentence structure", "Understanding of text organization"]}
      estimatedTime="90 min"
    />
  );
};

export default LinkingWordsPage;
