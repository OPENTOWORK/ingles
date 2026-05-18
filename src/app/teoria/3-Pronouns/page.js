'use client';
import { build3PronounsExercises } from './pronounsExercises';
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


const PronounsPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What are Pronouns?" icon="👥">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Pronouns</strong> are words that replace nouns to avoid repeating the same words. 
          They are essential for speaking naturally and fluently in English.
        </p>
        
        <QuickReference items={[
          "Personal: I, you, he, she, it, we, they",
          "Possessive: my, your, his, her, its, our, their",
          "Object: me, you, him, her, it, us, them",
          "Reflexive: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves",
          "Demonstrative: this, that, these, those"
        ]} />
      </TheorySection>

      <TheorySection title="Personal Pronouns" icon="👤">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Personal pronouns replace the people or things we are talking about.
        </p>

        <GrammarTable
          caption="Personal Pronouns"
          headers={["Person", "Singular", "Plural", "Meaning"]}
          rows={[
            ["1st person", "I", "we", "I / We"],
            ["2nd person", "you", "you", "You"],
            ["3rd person", "he/she/it", "they", "He/She/It / They"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo soy estudiante"
            english="I am a student"
          />
          <Example 
            spanish="Ella es doctora"
            english="She is a doctor"
          />
          <Example 
            spanish="Nosotros vivimos aquí"
            english="We live here"
          />
        </div>

        <Tip type="info">
          <strong>Note:</strong> In English there is no difference between informal "tú" and formal "usted" — both are "you". 
          Context and tone indicate the level of formality.
        </Tip>
      </TheorySection>

      <TheorySection title="Possessive Pronouns" icon="🏠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Possessive pronouns show who something belongs to. There are two types: possessive determiners and possessive pronouns.
        </p>

        <GrammarTable
          caption="Possessive Determiners (go before the noun)"
          headers={["Person", "Singular", "Plural"]}
          rows={[
            ["1st person", "my", "our"],
            ["2nd person", "your", "your"],
            ["3rd person", "his/her/its", "their"]
          ]}
        />

        <GrammarTable
          caption="Possessive Pronouns (replace the noun)"
          headers={["Person", "Singular", "Plural"]}
          rows={[
            ["1st person", "mine", "ours"],
            ["2nd person", "yours", "yours"],
            ["3rd person", "his/hers/its", "theirs"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mi libro es azul"
            english="My book is blue"
          />
          <Example 
            spanish="Este libro es mío"
            english="This book is mine"
          />
          <Example 
            spanish="Su casa es grande"
            english="Her house is big"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Do not confuse "its" (possessive) with "it's" (contraction of "it is"). 
          "Its" does not take an apostrophe when it is possessive.
        </Tip>
      </TheorySection>

      <TheorySection title="Object Pronouns" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Object pronouns are used when the person or thing receives the action.
        </p>

        <GrammarTable
          caption="Object Pronouns"
          headers={["Person", "Singular", "Plural"]}
          rows={[
            ["1st person", "me", "us"],
            ["2nd person", "you", "you"],
            ["3rd person", "him/her/it", "them"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ella me ve"
            english="She sees me"
          />
          <Example 
            spanish="Yo los conozco"
            english="I know them"
          />
          <Example 
            spanish="El libro me gusta"
            english="I like the book"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Object pronouns go after the verb or after prepositions.
        </Tip>
      </TheorySection>

      <TheorySection title="Reflexive Pronouns" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Reflexive pronouns are used when the subject and object are the same person or thing.
        </p>

        <GrammarTable
          caption="Reflexive Pronouns"
          headers={["Person", "Singular", "Plural"]}
          rows={[
            ["1st person", "myself", "ourselves"],
            ["2nd person", "yourself", "yourselves"],
            ["3rd person", "himself/herself/itself", "themselves"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo me lavo las manos"
            english="I wash my hands"
          />
          <Example 
            spanish="Ella se peina"
            english="She combs her hair"
          />
          <Example 
            spanish="Nosotros nos divertimos"
            english="We enjoy ourselves"
          />
        </div>

        <Tip type="info">
          <strong>Common use:</strong> Reflexive pronouns are also used for emphasis: "I myself did it".
        </Tip>
      </TheorySection>

      <TheorySection title="Demonstrative Pronouns" icon="👉">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Demonstrative pronouns point to or indicate specific people or things.
        </p>

        <GrammarTable
          caption="Demonstrative Pronouns"
          headers={["Distance", "Singular", "Plural", "Meaning"]}
          rows={[
            ["Near", "this", "these", "This / These"],
            ["Far", "that", "those", "That / Those"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este es mi libro"
            english="This is my book"
          />
          <Example 
            spanish="Esos son mis zapatos"
            english="Those are my shoes"
          />
          <Example 
            spanish="¿Qué es esto?"
            english="What is this?"
          />
        </div>

        <Tip type="warning">
          <strong>Difference:</strong> "This/these" for things nearby, "that/those" for things farther away. 
          They are also used for time: "this week", "that year".
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "Me and him are friends" ❌<br/>
            <strong>Correct:</strong> "He and I are friends" ✅<br/>
            <em>As subject we use personal pronouns, not object pronouns</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "This book is her" ❌<br/>
            <strong>Correct:</strong> "This book is hers" ✅<br/>
            <em>After "is" we use a possessive pronoun, not a determiner</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I hurt me" ❌<br/>
            <strong>Correct:</strong> "I hurt myself" ✅<br/>
            <em>For reflexive actions we use reflexive pronouns</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Its a beautiful day" ❌<br/>
            <strong>Correct:</strong> "It's a beautiful day" ✅<br/>
            <em>"It's" = "it is", "its" = possessive</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Order of politeness"
            description="When we talk about ourselves and another person, we always put the other person first."
            examples={[
              "You and I are friends",
              "He and she are married"
            ]}
          />

          <Rule 
            title="2. Pronouns after prepositions"
            description="After prepositions we always use object pronouns."
            examples={[
              "This is for you",
              "Come with me"
            ]}
          />

          <Rule 
            title="3. Possessive pronouns vs determiners"
            description="Determiners go before the noun; pronouns replace the noun."
            examples={[
              "My book vs This is mine",
              "Her car vs The car is hers"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Pronouns"
      description="Master all types of pronouns in English: personal, possessive, object, reflexive, and demonstrative. Essential for speaking fluently."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build3PronounsExercises}
      prerequisites={["Verb to be", "Basic understanding of nouns"]}
      estimatedTime="50 min"
    />
  );
};

export default PronounsPage;
