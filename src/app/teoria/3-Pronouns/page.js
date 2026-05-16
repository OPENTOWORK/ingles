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

const PronounsPage = () => {
  const theoryContent = (
    <div>
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
            translation="I am a student"
          />
          <Example 
            spanish="Ella es doctora"
            english="She is a doctor"
            translation="She is a doctor"
          />
          <Example 
            spanish="Nosotros vivimos aquí"
            english="We live here"
            translation="We live here"
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
            translation="My book is blue"
          />
          <Example 
            spanish="Este libro es mío"
            english="This book is mine"
            translation="This book is mine"
          />
          <Example 
            spanish="Su casa es grande"
            english="Her house is big"
            translation="Her house is big"
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
            translation="She sees me"
          />
          <Example 
            spanish="Yo los conozco"
            english="I know them"
            translation="I know them"
          />
          <Example 
            spanish="El libro me gusta"
            english="I like the book"
            translation="I like the book"
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
            translation="I wash my hands"
          />
          <Example 
            spanish="Ella se peina"
            english="She combs her hair"
            translation="She combs her hair"
          />
          <Example 
            spanish="Nosotros nos divertimos"
            english="We enjoy ourselves"
            translation="We enjoy ourselves"
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
            translation="This is my book"
          />
          <Example 
            spanish="Esos son mis zapatos"
            english="Those are my shoes"
            translation="Those are my shoes"
          />
          <Example 
            spanish="¿Qué es esto?"
            english="What is this?"
            translation="What is this?"
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
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____ am a teacher. _____ name is Sarah.'"
      options={[
        "I, My",
        "Me, My",
        "I, Mine",
        "Me, Mine"
      ]}
      correctAnswer={0}
      explanation="As subject we use 'I' and as possessive determiner we use 'My'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which is the correct form to complete: 'This book is ___'?"
      options={[
        "my",
        "mine",
        "me",
        "myself"
      ]}
      correctAnswer={1}
      explanation="After 'is' we need a possessive pronoun that replaces the noun. 'Mine' means 'belonging to me'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Me and him went to the store' is correct.",
          isTrue: false,
          explanation: "Incorrect. As subject we use personal pronouns: 'He and I went to the store'."
        },
        {
          text: "'This is my book' and 'This book is mine' are both correct.",
          isTrue: true,
          explanation: "Correct. 'My' is a possessive determiner, 'mine' is a possessive pronoun."
        },
        {
          text: "'Its' and 'it's' mean the same thing.",
          isTrue: false,
          explanation: "Incorrect. 'Its' is possessive, 'it's' is a contraction of 'it is'."
        },
        {
          text: "'I hurt myself' is correct for reflexive actions.",
          isTrue: true,
          explanation: "Correct. For reflexive actions we use reflexive pronouns."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which is the correct form to complete: 'She gave the book to ___'?"
      options={[
        "I",
        "me",
        "myself",
        "mine"
      ]}
      correctAnswer={1}
      explanation="After the preposition 'to' we use object pronouns. 'Me' is the object pronoun for 'I'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the correct form to complete: '___ and ___ are going to the party'?"
      options={[
        "Me, him",
        "I, he",
        "Myself, himself",
        "Mine, his"
      ]}
      correctAnswer={1}
      explanation="As subject we use personal pronouns: 'I' and 'he'. We also follow the order of politeness by putting 'I' last."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'She hurt _____ while playing tennis.'"
      options={[
        "her",
        "herself",
        "hers",
        "she"
      ]}
      correctAnswer={1}
      explanation="For reflexive actions we use reflexive pronouns: 'herself'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is correct?"
      options={[
        "This car is her",
        "This car is hers",
        "This car is she",
        "This car is herself"
      ]}
      correctAnswer={1}
      explanation="'Hers' is the possessive pronoun that replaces the noun. 'Her' would be a determiner: 'her car'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'Between you and ___, I think he's wrong.'"
      options={[
        "I",
        "me",
        "my",
        "mine"
      ]}
      correctAnswer={1}
      explanation="After prepositions like 'between' we use object pronouns: 'me'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: '_____ house is bigger than _____.' (comparing two houses)"
      options={[
        "Their, ours",
        "They, us",
        "Them, we",
        "Theirs, our"
      ]}
      correctAnswer={0}
      explanation="'Their house' (determiner) and 'ours' (possessive pronoun that replaces 'our house')."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which is the correct form?"
      options={[
        "Who's book is this?",
        "Whose book is this?",
        "Who book is this?",
        "Whos book is this?"
      ]}
      correctAnswer={1}
      explanation="'Whose' is the interrogative possessive pronoun. 'Who's' = 'who is'."
    />
  ];

  return (
    <TheoryLayout
      title="Pronouns"
      description="Master all types of pronouns in English: personal, possessive, object, reflexive, and demonstrative. Essential for speaking fluently."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Verb to be", "Basic understanding of nouns"]}
      estimatedTime="50 min"
    />
  );
};

export default PronounsPage;
