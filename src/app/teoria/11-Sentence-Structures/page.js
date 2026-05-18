'use client';
import { build11SentenceStructuresExercises } from './sentenceStructuresExercises';
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


const SentenceStructuresPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Sentence Structures?" icon="🏗️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Sentence structures</strong> are the different types of sentences you can form in English. 
          Knowing these structures lets you build more complex, expressive sentences and combine ideas effectively.
        </p>
        
        <QuickReference items={[
          "Simple: one main idea (S + V + O)",
          "Compound: two ideas joined (clause + and/but/or + clause)",
          "Complex: main idea + dependent idea (clause + because/when/if + clause)",
          "Compound-Complex: combines compound and complex",
          "Use connectors to link ideas"
        ]} />
      </TheorySection>

      <TheorySection title="Simple Sentences" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A simple sentence contains a single main idea with a subject and a predicate.
        </p>

        <GrammarTable
          caption="Simple Sentence Structure"
          headers={["Type", "Structure", "Example", "Components"]}
          rows={[
            ["Subject + Verb", "S + V", "Birds fly", "Subject: Birds, Verb: fly"],
            ["Subject + Verb + Object", "S + V + O", "I eat pizza", "S: I, V: eat, O: pizza"],
            ["Subject + Verb + Complement", "S + V + C", "She is happy", "S: She, V: is, C: happy"],
            ["Subject + Verb + Object + Complement", "S + V + O + C", "I find it easy", "S: I, V: find, O: it, C: easy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Los pájaros vuelan"
            english="Birds fly"
          />
          <Example 
            spanish="Ella lee libros"
            english="She reads books"
          />
          <Example 
            spanish="Estoy cansado"
            english="I am tired"
          />
        </div>

        <Rule 
          title="Characteristics of Simple Sentences"
          description="A simple sentence:"
          examples={[
            "Has one subject and one predicate",
            "Expresses one complete idea",
            "Can be short or long",
            "Is independent (does not depend on another sentence)"
          ]}
        />

        <Tip type="info">
          <strong>Remember:</strong> A simple sentence can have many words, but only one main idea.
        </Tip>
      </TheorySection>

      <TheorySection title="Compound Sentences" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A compound sentence joins two or more simple sentences using coordinating connectors.
        </p>

        <GrammarTable
          caption="Coordinating Connectors (FANBOYS)"
          headers={["Connector", "Function", "Example", "Meaning"]}
          rows={[
            ["For", "Reason", "I study hard, for I want to pass", "because"],
            ["And", "Addition", "I like coffee and tea", "and"],
            ["Nor", "Negative addition", "I don't like coffee, nor do I like tea", "nor"],
            ["But", "Contrast", "I like coffee, but I don't like tea", "but"],
            ["Or", "Alternative", "I can have coffee or tea", "or"],
            ["Yet", "Contrast", "I'm tired, yet I can't sleep", "yet / however"],
            ["So", "Result", "I'm tired, so I'll go to bed", "so"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el café y el té"
            english="I like coffee and tea"
          />
          <Example 
            spanish="Estoy cansado, así que me voy a la cama"
            english="I'm tired, so I'll go to bed"
          />
          <Example 
            spanish="Me gusta el café, pero no el té"
            english="I like coffee, but I don't like tea"
          />
        </div>

        <Rule 
          title="Forming Compound Sentences"
          description="To form compound sentences:"
          examples={[
            "Simple sentence + , + connector + simple sentence",
            "Simple sentence + connector + simple sentence (no comma)",
            "Each part must be able to stand alone as a sentence"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Use a comma before coordinating connectors when you join two complete sentences.
        </Tip>
      </TheorySection>

      <TheorySection title="Complex Sentences" icon="🧩">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A complex sentence has a main (independent) clause and one or more subordinate (dependent) clauses.
        </p>

        <GrammarTable
          caption="Types of Subordinate Clauses"
          headers={["Type", "Connectors", "Example", "Function"]}
          rows={[
            ["Time", "when, while, before, after", "I eat when I'm hungry", "When something happens"],
            ["Cause", "because, since, as", "I study because I want to pass", "Why something happens"],
            ["Condition", "if, unless, provided that", "I'll go if it doesn't rain", "Under what condition"],
            ["Contrast", "although, though, even though", "I go although it's raining", "Contrasting ideas"],
            ["Purpose", "so that, in order to", "I study so that I can pass", "For what purpose"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Como cuando tengo hambre"
            english="I eat when I'm hungry"
          />
          <Example 
            spanish="Estudio porque quiero aprobar"
            english="I study because I want to pass"
          />
          <Example 
            spanish="Iré si no llueve"
            english="I'll go if it doesn't rain"
          />
        </div>

        <Rule 
          title="Structure of Complex Sentences"
          description="They can be organized in two ways:"
          examples={[
            "Main clause + subordinate clause",
            "Subordinate clause + , + main clause",
            "A subordinate clause cannot stand alone"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> The main clause makes complete sense on its own; the subordinate clause does not.
        </Tip>
      </TheorySection>

      <TheorySection title="Compound-Complex Sentences" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A compound-complex sentence combines compound and complex structures. It has at least two main clauses and one or more subordinate clauses.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estudio duro porque quiero aprobar, pero a veces me siento cansado"
            english="I study hard because I want to pass, but sometimes I feel tired"
          />
          <Example 
            spanish="Cuando llueve, me quedo en casa y leo libros"
            english="When it rains, I stay home and read books"
          />
          <Example 
            spanish="Si tengo tiempo, iré al cine, pero si no, me quedaré en casa"
            english="If I have time, I'll go to the cinema, but if not, I'll stay home"
          />
        </div>

        <Rule 
          title="Characteristics of Compound-Complex Sentences"
          description="This sentence type:"
          examples={[
            "Has at least two main clauses",
            "Has at least one subordinate clause",
            "Combines features of compound and complex sentences",
            "Is the most advanced structure"
          ]}
        />

        <Tip type="info">
          <strong>Usage:</strong> Compound-complex sentences are useful for expressing complex ideas clearly.
        </Tip>
      </TheorySection>

      <TheorySection title="Advanced Connectors" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Beyond basic connectors, many linking words help you create more sophisticated sentences.
        </p>

        <GrammarTable
          caption="Connectors by Function"
          headers={["Function", "Connectors", "Example", "Meaning"]}
          rows={[
            ["Addition", "furthermore, moreover, in addition", "I study hard. Furthermore, I practice daily", "in addition"],
            ["Contrast", "however, nevertheless, on the other hand", "It's expensive. However, it's worth it", "however"],
            ["Cause", "due to, owing to, as a result of", "Due to the rain, we stayed home", "due to"],
            ["Result", "consequently, therefore, thus", "I studied hard. Therefore, I passed", "therefore"],
            ["Time", "meanwhile, subsequently, eventually", "I studied. Meanwhile, my friend played", "meanwhile"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estudio duro. Además, practico diariamente"
            english="I study hard. Furthermore, I practice daily"
          />
          <Example 
            spanish="Es caro. Sin embargo, vale la pena"
            english="It's expensive. However, it's worth it"
          />
          <Example 
            spanish="Debido a la lluvia, nos quedamos en casa"
            english="Due to the rain, we stayed home"
          />
        </div>

        <Tip type="warning">
          <strong>Punctuation:</strong> Advanced connectors usually go at the start of the sentence, followed by a comma.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I like coffee, I like tea" ❌<br/>
            <strong>Correct:</strong> "I like coffee and tea" or "I like coffee, and I like tea" ✅<br/>
            <em>You need a connector to join sentences</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Because I'm tired, so I'll sleep" ❌<br/>
            <strong>Correct:</strong> "Because I'm tired, I'll sleep" or "I'm tired, so I'll sleep" ✅<br/>
            <em>Do not use 'because' and 'so' together</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I study hard, but I don't pass" ❌<br/>
            <strong>Correct:</strong> "I study hard, but I don't pass" ✅<br/>
            <em>This sentence is fine, but make sure the ideas contrast</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "If I have time, I will go" (no comma) ❌<br/>
            <strong>Correct:</strong> "If I have time, I will go" ✅<br/>
            <em>Use a comma when the subordinate clause comes first</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Punctuation with connectors"
            description="Use a comma before coordinating connectors when joining complete sentences."
            examples={[
              "I like coffee, and I like tea",
              "I'm tired, so I'll sleep"
            ]}
          />

          <Rule 
            title="2. Subordinate clauses"
            description="If the subordinate clause comes first, use a comma after it."
            examples={[
              "When I'm tired, I sleep",
              "Because it's raining, I stay home"
            ]}
          />

          <Rule 
            title="3. Avoid repetition"
            description="Do not use redundant connectors."
            examples={[
              "Because I'm tired, so I'll sleep ❌",
              "I'm tired, so I'll sleep ✅"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Sentence Structures"
      description="Master English sentence structures: simple, compound, complex, and compound-complex. Learn to use connectors to build more sophisticated sentences."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build11SentenceStructuresExercises}
      prerequisites={["Basic grammar", "Understanding of subjects and verbs", "Basic vocabulary"]}
      estimatedTime="75 min"
    />
  );
};

export default SentenceStructuresPage;
