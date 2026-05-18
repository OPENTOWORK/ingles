'use client';
import { buildRelativeClausesExercises } from './relativeClausesExercises';
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


const RelativeClausesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="Relative Clauses" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Relative clauses</strong> are subordinate clauses that provide extra information 
          about a noun. They let us combine sentences and create more sophisticated, fluent text — 
          essential from B1 level upward.
        </p>
        
        <QuickReference items={[
          "Defining clauses: essential information (no commas)",
          "Non-defining clauses: extra information (with commas)",
          "Relative pronouns: who, which, that, whose, where, when",
          "Can be omitted in certain cases",
          "Prepositions can go at the end or before the pronoun"
        ]} />
      </TheorySection>

      <TheorySection title="Relative Pronouns" icon="👥">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Relative pronouns connect the relative clause to the noun they modify.
        </p>

        <GrammarTable
          caption="Relative Pronouns and Their Uses"
          headers={["Pronoun", "Refers to", "Function", "Example"]}
          rows={[
            ["who", "People", "Subject or object", "The man who lives next door"],
            ["whom", "People (formal)", "Object", "The person whom I met"],
            ["which", "Things/animals", "Subject or object", "The book which I read"],
            ["that", "People/things", "Subject or object", "The car that I bought"],
            ["whose", "Possession", "Possessive", "The woman whose car broke down"],
            ["where", "Places", "Adverbial", "The place where we met"],
            ["when", "Time", "Adverbial", "The day when it happened"],
            ["why", "Reason", "Adverbial", "The reason why I left"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El hombre que vive al lado es médico."
            english="The man who lives next door is a doctor."
          />
          
          <Example 
            spanish="El libro que leí era interesante."
            english="The book that/which I read was interesting."
          />
        </div>

        <Tip type="info">
          <strong>Remember:</strong> Use 'who' for people, 'which' for things, and 'that' for both (more informal).
        </Tip>
      </TheorySection>

      <TheorySection title="Defining vs Non-defining Clauses" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The difference between defining and non-defining clauses affects meaning and punctuation.
        </p>

        <GrammarTable
          caption="Types of Relative Clauses"
          headers={["Type", "Function", "Punctuation", "Example"]}
          rows={[
            ["Defining", "Essential information to identify", "No commas", "The students who study hard pass exams"],
            ["Non-defining", "Extra, non-essential information", "With commas", "My brother, who lives in London, is a doctor"],
            ["Defining", "Specifies which one exactly", "No commas", "The car that I bought is red"],
            ["Non-defining", "Adds extra information", "With commas", "This car, which cost £20,000, is very reliable"]
          ]}
        />

        <Rule 
          title="Important rules for defining vs non-defining"
          description="Key differences between both types:"
          examples={[
            "Defining: do NOT use commas — information is necessary",
            "Non-defining: DO use commas — information is optional",
            "Defining: you can use 'that'",
            "Non-defining: you cannot use 'that', only who/which",
            "Defining: you can omit the pronoun (when object)",
            "Non-defining: NEVER omit the pronoun"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Los estudiantes que estudian mucho aprueban. (defining - especifica qué estudiantes)"
            english="The students who study hard pass."
          />
          
          <Example 
            spanish="Los estudiantes, que estudian mucho, aprueban. (non-defining - todos los estudiantes)"
            english="The students, who study hard, pass."
          />
        </div>
      </TheorySection>

      <TheorySection title="Omitting Relative Pronouns" icon="👻">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In defining clauses, we can sometimes omit the relative pronoun for more natural English.
        </p>

        <Rule 
          title="When to omit relative pronouns"
          description="Only in defining clauses when the pronoun is the object:"
          examples={[
            "The book (that/which) I read → The book I read",
            "The person (who/that) I met → The person I met",
            "The car (that/which) he bought → The car he bought"
          ]}
        />

        <GrammarTable
          caption="Omitting Pronouns"
          headers={["Function", "Can be omitted", "With pronoun", "Without pronoun"]}
          rows={[
            ["Object", "✅ Yes", "The book that I read", "The book I read"],
            ["Subject", "❌ No", "The man who called", "❌ The man called"],
            ["With preposition", "✅ Yes (informal)", "The house that I live in", "The house I live in"],
            ["Possessive (whose)", "❌ No", "The woman whose car...", "❌ The woman car..."]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> If you can remove the pronoun and the sentence still makes sense, 
          it was the object and can be omitted.
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions in Relative Clauses" icon="🌉">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Prepositions can go at the end of the clause (informal) or before the pronoun (formal).
        </p>

        <GrammarTable
          caption="Position of Prepositions"
          headers={["Style", "Structure", "Example", "Register"]}
          rows={[
            ["Informal", "Preposition at the end", "The house (that) I live in", "Conversational"],
            ["Formal", "Preposition + whom/which", "The house in which I live", "Academic/written"],
            ["Informal", "Preposition at the end", "The person (who) I talked to", "Conversational"],
            ["Formal", "Preposition + whom", "The person to whom I talked", "Academic/written"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La casa en la que vivo es antigua. (informal)"
            english="The house I live in is old."
          />
          
          <Example 
            spanish="La casa en la que vivo es antigua. (formal)"
            english="The house in which I live is old."
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> With prepositions at the start, use 'whom' (people) or 'which' (things), 
          never 'who' or 'that'.
        </Tip>
      </TheorySection>

      <TheorySection title="Clauses with Where, When, Why" icon="📍⏰❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These relative pronouns refer to place, time, and reason respectively.
        </p>

        <GrammarTable
          caption="Where, When, Why in Relative Clauses"
          headers={["Pronoun", "Replaces", "Example", "Formal alternative"]}
          rows={[
            ["where", "in/at/on + which", "The place where we met", "The place at which we met"],
            ["when", "in/on/at + which", "The day when it happened", "The day on which it happened"],
            ["why", "for which", "The reason why I left", "The reason for which I left"],
            ["where", "in/at + which", "The school where I studied", "The school at which I studied"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esta es la ciudad donde nací."
            english="This is the city where I was born."
          />
          
          <Example 
            spanish="¿Recuerdas el día cuando nos conocimos?"
            english="Do you remember the day when we met?"
          />
          
          <Example 
            spanish="No entiendo la razón por la que se fue."
            english="I don't understand the reason why he left."
          />
        </div>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "The man, that lives next door, is nice" ❌<br/>
            <strong>Correct:</strong> "The man, who lives next door, is nice" ✅<br/>
            <em>Do not use 'that' in non-defining clauses</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The book what I read" ❌<br/>
            <strong>Correct:</strong> "The book that/which I read" ✅<br/>
            <em>'What' is not a relative pronoun in this context</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The woman whose I met" ❌<br/>
            <strong>Correct:</strong> "The woman who I met" or "The woman whose husband I met" ✅<br/>
            <em>'Whose' is only for possession</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The place where I went to" ❌<br/>
            <strong>Correct:</strong> "The place where I went" or "The place I went to" ✅<br/>
            <em>Do not use an extra preposition with 'where'</em>
          </Tip>
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Relative Clauses"
      description="Master relative clauses to build more sophisticated sentences. Learn relative pronouns, defining vs non-defining clauses, and when to omit pronouns."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildRelativeClausesExercises}
      prerequisites={["Pronouns", "Basic sentence structure", "Verb tenses"]}
      estimatedTime="55 min"
    />
  );
};

export default RelativeClausesPage;
