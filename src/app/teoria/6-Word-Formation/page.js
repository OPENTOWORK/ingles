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

const WordFormationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is Word Formation?" icon="🔤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Word formation</strong> is the process of creating new words from existing words 
          using prefixes, suffixes, and other methods. It is essential for expanding your vocabulary and understanding the meaning of unknown words.
        </p>
        
        <QuickReference items={[
          "Prefixes: change meaning (un-, re-, pre-)",
          "Suffixes: change grammatical category (-ly, -tion, -ful)",
          "Compounds: join two words (toothbrush, bedroom)",
          "Conversion: change category without modifying form (walk → walk)",
          "Abbreviations: shorten words (ad → advertisement)"
        ]} />
      </TheorySection>

      <TheorySection title="Prefixes" icon="🔝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Prefixes are added to the beginning of a word to change its meaning.
        </p>

        <GrammarTable
          caption="Common Prefixes and Their Meanings"
          headers={["Prefix", "Meaning", "Example", "Base Word"]}
          rows={[
            ["un-", "Negative", "unhappy", "happy"],
            ["re-", "Again", "rewrite", "write"],
            ["pre-", "Before", "preview", "view"],
            ["dis-", "Negative", "disagree", "agree"],
            ["mis-", "Wrongly", "misunderstand", "understand"],
            ["over-", "Excess", "overcook", "cook"],
            ["under-", "Below", "underestimate", "estimate"],
            ["non-", "Not", "non-smoker", "smoker"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estoy infeliz con el resultado"
            english="I am unhappy with the result"
            translation="I am unhappy with the result"
          />
          <Example 
            spanish="Necesito reescribir este ensayo"
            english="I need to rewrite this essay"
            translation="I need to rewrite this essay"
          />
          <Example 
            spanish="Malentendí tus instrucciones"
            english="I misunderstood your instructions"
            translation="I misunderstood your instructions"
          />
        </div>

        <Rule 
          title="Using Prefixes"
          description="Prefixes do not change the grammatical category of the word:"
          examples={[
            "Happy (adj) → Unhappy (adj)",
            "Write (verb) → Rewrite (verb)",
            "Agree (verb) → Disagree (verb)"
          ]}
        />

        <Tip type="info">
          <strong>Remember:</strong> Prefixes are written attached to the base word, without a hyphen.
        </Tip>
      </TheorySection>

      <TheorySection title="Suffixes" icon="🔚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Suffixes are added to the end of a word to change its grammatical category or meaning.
        </p>

        <GrammarTable
          caption="Common Suffixes for Different Categories"
          headers={["Suffix", "Category", "Example", "Base Word"]}
          rows={[
            ["-ly", "Adverb", "quickly", "quick"],
            ["-tion/-sion", "Noun", "education", "educate"],
            ["-ful", "Adjective", "beautiful", "beauty"],
            ["-less", "Adjective", "hopeless", "hope"],
            ["-er/-or", "Noun", "teacher", "teach"],
            ["-ness", "Noun", "happiness", "happy"],
            ["-able/-ible", "Adjective", "comfortable", "comfort"],
            ["-ment", "Noun", "development", "develop"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Corre rápidamente"
            english="He runs quickly"
            translation="He runs quickly"
          />
          <Example 
            spanish="La educación es importante"
            english="Education is important"
            translation="Education is important"
          />
          <Example 
            spanish="Es una situación sin esperanza"
            english="It's a hopeless situation"
            translation="It's a hopeless situation"
          />
        </div>

        <Rule 
          title="Category Changes with Suffixes"
          description="Suffixes can change the grammatical category:"
          examples={[
            "Quick (adj) → Quickly (adv)",
            "Educate (verb) → Education (noun)",
            "Hope (noun) → Hopeless (adj)"
          ]}
        />

        <Tip type="warning">
          <strong>Spelling:</strong> Some suffixes require spelling changes in the base word.
        </Tip>
      </TheorySection>

      <TheorySection title="Compound Words" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Compound words are formed by joining two or more words to create a new word with a specific meaning.
        </p>

        <GrammarTable
          caption="Types of Compound Words"
          headers={["Type", "Form", "Example", "Meaning"]}
          rows={[
            ["Noun + Noun", "toothbrush", "tooth + brush", "toothbrush"],
            ["Adjective + Noun", "blackboard", "black + board", "blackboard"],
            ["Verb + Noun", "swimming pool", "swimming + pool", "swimming pool"],
            ["Noun + Verb", "sunrise", "sun + rise", "sunrise"],
            ["Adjective + Adjective", "red-hot", "red + hot", "red-hot"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Uso un cepillo de dientes todas las mañanas"
            english="I use a toothbrush every morning"
            translation="I use a toothbrush every morning"
          />
          <Example 
            spanish="El profesor escribe en la pizarra"
            english="The teacher writes on the blackboard"
            translation="The teacher writes on the blackboard"
          />
          <Example 
            spanish="Vamos a nadar a la piscina"
            english="We go swimming at the swimming pool"
            translation="We go swimming at the swimming pool"
          />
        </div>

        <Rule 
          title="Forming Compounds"
          description="Compound words can be written:"
          examples={[
            "Together: toothbrush, bedroom, notebook",
            "With a hyphen: mother-in-law, state-of-the-art",
            "Separate: swimming pool, ice cream"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> The meaning of a compound word is not always the sum of its parts.
        </Tip>
      </TheorySection>

      <TheorySection title="Conversion" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Conversion is changing the grammatical category of a word without modifying its form.
        </p>

        <GrammarTable
          caption="Examples of Conversion"
          headers={["Original Word", "New Category", "Example", "Meaning"]}
          rows={[
            ["walk (verb)", "noun", "go for a walk", "go for a walk"],
            ["email (noun)", "verb", "email me", "email me"],
            ["green (adj)", "noun", "the greens", "the greens (vegetables)"],
            ["water (noun)", "verb", "water the plants", "water the plants"],
            ["clean (adj)", "verb", "clean the room", "clean the room"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy a dar un paseo"
            english="I'm going for a walk"
            translation="I'm going for a walk"
          />
          <Example 
            spanish="Envíame un email"
            english="Email me"
            translation="Email me"
          />
          <Example 
            spanish="Riega las plantas"
            english="Water the plants"
            translation="Water the plants"
          />
        </div>

        <Tip type="info">
          <strong>Note:</strong> Conversion is very common in English, especially for creating verbs from nouns.
        </Tip>
      </TheorySection>

      <TheorySection title="Abbreviations and Acronyms" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Abbreviations and acronyms are short forms of long words or phrases.
        </p>

        <GrammarTable
          caption="Types of Abbreviations"
          headers={["Type", "Example", "Full Form", "Meaning"]}
          rows={[
            ["Abbreviation", "ad", "advertisement", "advertisement"],
            ["Abbreviation", "info", "information", "information"],
            ["Acronym", "NASA", "National Aeronautics and Space Administration", "NASA"],
            ["Acronym", "UNESCO", "United Nations Educational, Scientific and Cultural Organization", "UNESCO"],
            ["Acronym", "ATM", "Automated Teller Machine", "ATM"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Vi un anuncio en el periódico"
            english="I saw an ad in the newspaper"
            translation="I saw an ad in the newspaper"
          />
          <Example 
            spanish="Necesito más información"
            english="I need more info"
            translation="I need more info"
          />
          <Example 
            spanish="NASA envió una nave espacial"
            english="NASA sent a spacecraft"
            translation="NASA sent a spacecraft"
          />
        </div>

        <Tip type="warning">
          <strong>Usage:</strong> Abbreviations are more common in informal contexts; acronyms are used in both formal and informal settings.        
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "un-happy" ❌<br/>
            <strong>Correct:</strong> "unhappy" ✅<br/>
            <em>Prefixes are written attached to the base word</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "quicklyly" ❌<br/>
            <strong>Correct:</strong> "quickly" ✅<br/>
            <em>Do not add suffixes to words that already have them</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "tooth brush" ❌<br/>
            <strong>Correct:</strong> "toothbrush" ✅<br/>
            <em>Compound words are written together</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I will email to you" ❌<br/>
            <strong>Correct:</strong> "I will email you" ✅<br/>
            <em>When &apos;email&apos; is a verb, it does not need &apos;to&apos;</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Prefixes and spelling"
            description="Prefixes do not change the spelling of the base word."
            examples={[
              "Happy → Unhappy (no 'un-happy')",
              "Write → Rewrite (no 're-write')"
            ]}
          />

          <Rule 
            title="2. Suffixes and spelling changes"
            description="Some suffixes require changes in the base word."
            examples={[
              "Happy → Happiness (y → i)",
              "Run → Running (double n)",
              "Love → Lovable (e is dropped)"
            ]}
          />

          <Rule 
            title="3. Compound words"
            description="The meaning may differ from the sum of the parts."
            examples={[
              "Blackboard (blackboard, not 'black board')",
              "Hot dog (hot dog, not 'hot dog' literally)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'She is a very _____ person.' (beauty → adjective)"
      options={[
        "beauty",
        "beautiful",
        "beautifully",
        "beautify"
      ]}
      correctAnswer={1}
      explanation="To describe people we use the adjective 'beautiful' (beauty → beautiful)."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which is the correct form to complete: 'I need to ___ this letter'?"
      options={[
        "rewrite",
        "re-write",
        "write again",
        "rewrite again"
      ]}
      correctAnswer={0}
      explanation="Prefixes are written attached to the base word: 'rewrite'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Un-happy' is the correct spelling.",
          isTrue: false,
          explanation: "Incorrect. Prefixes are written attached: 'unhappy'."
        },
        {
          text: "'Toothbrush' is a compound word.",
          isTrue: true,
          explanation: "Correct. 'Toothbrush' is formed by 'tooth' + 'brush'."
        },
        {
          text: "'Email' can be both a noun and a verb.",
          isTrue: true,
          explanation: "Correct. 'Email' is conversion: it can be a noun or a verb."
        },
        {
          text: "'Beautifully' is formed by adding a suffix to 'beautiful'.",
          isTrue: false,
          explanation: "Incorrect. 'Beautifully' is formed from 'beautiful' + '-ly', but 'beautiful' already has the suffix '-ful'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which is the correct form to complete: 'The ___ of this project is important'?"
      options={[
        "develop",
        "development",
        "developing",
        "developed"
      ]}
      correctAnswer={1}
      explanation="We need a noun. 'Development' is formed by adding '-ment' to the verb 'develop'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the correct form to complete: 'I will ___ you the information'?"
      options={[
        "email to",
        "email",
        "email for",
        "email with"
      ]}
      correctAnswer={1}
      explanation="When 'email' is a verb, it does not need a preposition: 'I will email you'."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Impossible' is formed with the prefix 'im-'.",
          isTrue: true,
          explanation: "Correct. 'Impossible' = 'im-' (not) + 'possible'."
        },
        {
          text: "'Friendship' is formed with the suffix '-ship'.",
          isTrue: true,
          explanation: "Correct. 'Friendship' = 'friend' + '-ship' (state or condition)."
        },
        {
          text: "All compound words are written as one word.",
          isTrue: false,
          explanation: "Incorrect. Some are written separately (ice cream), others with a hyphen (mother-in-law)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'The ___ of the building took two years.'"
      options={[
        "construct",
        "construction",
        "constructive",
        "constructing"
      ]}
      correctAnswer={1}
      explanation="We need a noun. 'Construction' is formed by adding '-tion' to the verb 'construct'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What is the antonym of 'legal' using prefixes?"
      options={[
        "unlegal",
        "illegal",
        "inlegal",
        "dislegal"
      ]}
      correctAnswer={1}
      explanation="'Illegal' is correct. We use 'il-' before words that start with 'l'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Homeless' means 'without a home'.",
          isTrue: true,
          explanation: "Correct. The suffix '-less' means 'without'."
        },
        {
          text: "'Childhood' refers to the time when someone is a child.",
          isTrue: true,
          explanation: "Correct. The suffix '-hood' indicates a period or state."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'She works as a ___.' (person who teaches)"
      options={[
        "teach",
        "teaching",
        "teacher",
        "taught"
      ]}
      correctAnswer={2}
      explanation="To form the person noun we add '-er' to 'teach': 'teacher'."
    />
  ];

  return (
    <TheoryLayout
      title="Word Formation"
      description="Master word formation in English: prefixes, suffixes, compound words, conversion, and abbreviations. Essential for expanding your vocabulary."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced vocabulary", "Understanding of word categories"]}
      estimatedTime="70 min"
    />
  );
};

export default WordFormationPage;

