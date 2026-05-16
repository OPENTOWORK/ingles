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

const PronunciationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is Pronunciation?" icon="🗣️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Pronunciation</strong> is the correct way to produce English sounds. 
          Good pronunciation is essential for effective communication and mutual understanding.
        </p>
        
        <QuickReference items={[
          "Phonemes: individual sounds of English",
          "Stress: emphasis on specific syllables",
          "Intonation: rise and fall of the voice",
          "Rhythm: speed and pauses when speaking",
          "Regular practice to improve"
        ]} />
      </TheorySection>

      <TheorySection title="Phonemes and Basic Sounds" icon="🔊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          English has sounds that may not exist in your native language. Learn to distinguish and produce them correctly.
        </p>

        <GrammarTable
          caption="Common Problem Sounds"
          headers={["Sound", "IPA Symbol", "Example Word", "How to Produce It"]}
          rows={[
            ["/θ/ (voiceless th)", "θ", "think, thank", "Place your tongue between your teeth"],
            ["/ð/ (voiced th)", "ð", "this, that", "Vibration in the throat"],
            ["/r/", "r", "red, right", "Tongue curled back, does not touch the palate"],
            ["/l/", "l", "light, like", "Tongue touches the palate"],
            ["/v/", "v", "very, voice", "Lower lip against upper teeth"],
            ["/w/", "w", "water, work", "Rounded lips, like a 'u' sound"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Think /θɪŋk/" />
          <Example english="This /ðɪs/" />
          <Example english="Red /red/" />
          <Example english="Light /laɪt/" />
        </div>

        <Rule 
          title="Tips to Improve Your Sounds"
          description="To pronounce better:"
          examples={[
            "Practice in front of a mirror to see mouth position",
            "Record yourself and compare with native speakers",
            "Practice with minimal pairs",
            "Use pronunciation apps"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Don't worry about perfection — clarity matters more than a perfect accent.
        </Tip>
      </TheorySection>

      <TheorySection title="Word Stress" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Word stress is fundamental in English. Stressing the wrong syllable can completely change the meaning.
        </p>

        <GrammarTable
          caption="Word Stress Rules"
          headers={["Word Type", "Rule", "Example", "Stress"]}
          rows={[
            ["Two-syllable nouns", "First syllable", "PHOtograph, COMputer", "PHO-to-graph"],
            ["Two-syllable verbs", "Second syllable", "reCORD, preSENT", "re-CORD"],
            ["Words with prefixes", "Syllable after the prefix", "unHAPPY, rePEAT", "un-HAP-py"],
            ["Suffixes -tion, -sion", "Before the suffix", "inforMAtion, deciSION", "in-for-MA-tion"],
            ["Suffixes -ic, -ical", "Before the suffix", "eLECtric, hisTORical", "e-LEC-tric"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="PHOtograph (noun) vs phoTOgraphy (noun)" />
          <Example english="REcord (noun) vs reCORD (verb)" />
          <Example english="COMputer" />
        </div>

        <Rule 
          title="Importance of Stress"
          description="Correct stress:"
          examples={[
            "Helps comprehension",
            "Avoids misunderstandings",
            "Makes you sound more natural",
            "Matters more than individual sounds"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Incorrect stress can make you hard to understand, even if individual sounds are clear.
        </Tip>
      </TheorySection>

      <TheorySection title="Sentence Stress" icon="📢">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In sentences, some words are stressed more than others to convey meaning and emotion.
        </p>

        <GrammarTable
          caption="Words Stressed in Sentences"
          headers={["Word Type", "Stressed?", "Example", "Reason"]}
          rows={[
            ["Content Words", "Yes", "nouns, verbs, adjectives, adverbs", "Carry the main meaning"],
            ["Function Words", "No", "articles, prepositions, pronouns", "Are grammatical, not semantic"],
            ["Important words", "Yes", "new information, emphasis", "Key information in the message"],
            ["Already-mentioned words", "No", "known information", "Do not add new information"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="I BOUGHT a NEW CAR yesterday (stressed words)" />
          <Example english="The BOOK is on the TABLE (stressed words)" />
          <Example english="I LOVE this MUSIC (stressed words)" />
        </div>

        <Rule 
          title="Sentence Stress Rules"
          description="Generally stressed:"
          examples={[
            "Nouns: book, car, house",
            "Main verbs: go, come, see",
            "Adjectives: big, small, beautiful",
            "Adverbs: quickly, slowly, well"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Content words carry the rhythm of the sentence.
        </Tip>
      </TheorySection>

      <TheorySection title="Intonation" icon="🎵">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Intonation is the rise and fall of your voice that conveys emotion and meaning.
        </p>

        <GrammarTable
          caption="Intonation Patterns"
          headers={["Pattern", "Direction", "Use", "Example"]}
          rows={[
            ["Falling", "Falling at the end", "Statements, commands", "I like it. ↘"],
            ["Rising", "Rising at the end", "Yes/no questions", "Do you like it? ↗"],
            ["Rise-Fall", "Rise and fall", "Wh- questions", "What do you want? ↗↘"],
            ["Fall-Rise", "Fall and rise", "Uncertainty, politeness", "Maybe. ↘↗"],
            ["Flat", "No change", "Listing, neutral tone", "One, two, three. →"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Statement: 'I like it.' (falling at the end)" />
          <Example english="Yes/no question: 'Do you like it?' (rising at the end)" />
          <Example english="Wh- question: 'What do you want?' (rise-fall)" />
        </div>

        <Rule 
          title="Function of Intonation"
          description="Intonation helps you:"
          examples={[
            "Distinguish statements from questions",
            "Express emotions and attitudes",
            "Show politeness or firmness",
            "Show whether you are sure or unsure"
          ]}
        />

        <Tip type="info">
          <strong>Note:</strong> Intonation can completely change the meaning of a sentence.
        </Tip>
      </TheorySection>

      <TheorySection title="Connected Speech" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In natural speech, sounds link and change, creating a continuous flow.
        </p>

        <GrammarTable
          caption="Connected Speech Phenomena"
          headers={["Phenomenon", "Description", "Example", "Result"]}
          rows={[
            ["Linking", "Link final and initial sounds", "an apple → anapple", "Continuous flow"],
            ["Elision", "Drop sounds", "don't → don", "Faster speech"],
            ["Assimilation", "Sounds influence each other", "handbag → hambag", "Easier pronunciation"],
            ["Intrusion", "Add sounds", "go on → go won", "Smooth transition"],
            ["Weak forms", "Weak forms of words", "and → 'n'", "Natural rhythm"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="'an apple' is pronounced 'anapple'" />
          <Example english="'don't' is pronounced 'don'" />
          <Example english="'go on' is pronounced 'go won'" />
        </div>

        <Rule 
          title="Tips for Connected Speech"
          description="To sound more natural:"
          examples={[
            "Practice full phrases, not isolated words",
            "Listen to native speakers in conversation",
            "Copy the rhythm and flow",
            "Don't worry about pronouncing every sound perfectly"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Connected speech can be harder to understand, but it is natural in spoken English.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Pronouncing every word separately ❌<br/>
            <strong>Correct:</strong> Linking words naturally ✅<br/>
            <em>English flows; we do not speak word by word</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Stressing every word equally ❌<br/>
            <strong>Correct:</strong> Stressing content words ✅<br/>
            <em>Stress gives rhythm and meaning</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using flat intonation ❌<br/>
            <strong>Correct:</strong> Varying intonation according to context ✅<br/>
            <em>Intonation conveys emotion and meaning</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignoring difficult sounds ❌<br/>
            <strong>Correct:</strong> Practicing problem sounds ✅<br/>
            <em>Correct sounds improve comprehension</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Regular practice"
            description="Pronunciation improves with consistent practice."
            examples={[
              "Practice daily, even if only for 10 minutes",
              "Record yourself and listen to your pronunciation",
              "Imitate native speakers",
              "Use pronunciation apps"
            ]}
          />

          <Rule 
            title="2. Active listening"
            description="Listen to authentic English to train your ear."
            examples={[
              "Films, series, and podcasts in English",
              "Pay attention to pronunciation",
              "Repeat phrases you hear",
              "Copy rhythm and intonation"
            ]}
          />

          <Rule 
            title="3. Don't aim for perfection"
            description="Clarity matters more than a perfect accent."
            examples={[
              "Focus on being understood",
              "Don't worry about sounding native",
              "Improve gradually",
              "Celebrate your progress"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="To pronounce /θ/ as in 'think', what should I do?"
      options={[
        "Put your lips together",
        "Put your tongue between your teeth",
        "Close your mouth completely",
        "Open your mouth wide"
      ]}
      correctAnswer={1}
      explanation="For the /θ/ sound, your tongue goes between your upper and lower teeth."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the correct word stress in 'computer'?"
      options={[
        "comPUter",
        "COMputer",
        "compuTER",
        "com-put-er"
      ]}
      correctAnswer={1}
      explanation="'Computer' is a three-syllable noun with stress on the second syllable: COM-put-er."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Word stress is less important than individual sounds.",
          isTrue: false,
          explanation: "Incorrect. Stress is very important and can change word meaning."
        },
        {
          text: "In sentences, content words (nouns, verbs) are stressed more.",
          isTrue: true,
          explanation: "Correct. Content words (nouns, verbs, adjectives, adverbs) are stressed more than function words."
        },
        {
          text: "Rising intonation is used in yes/no questions.",
          isTrue: true,
          explanation: "Correct. Yes/no questions usually end with rising intonation."
        },
        {
          text: "In connected speech, every word is pronounced clearly and separately.",
          isTrue: false,
          explanation: "Incorrect. In connected speech, sounds link and change to create a natural flow."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the difference between /θ/ and /ð/?"
      options={[
        "There is no difference",
        "/θ/ is voiced and /ð/ is voiceless",
        "/θ/ is voiceless and /ð/ is voiced",
        "They are the same sound"
      ]}
      correctAnswer={2}
      explanation="/θ/ (as in 'think') is voiceless (no vibration), while /ð/ (as in 'this') is voiced (with vibration)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What type of intonation is generally used in statements?"
      options={[
        "Rising",
        "Falling",
        "Flat",
        "Rise-fall"
      ]}
      correctAnswer={1}
      explanation="Statements usually end with falling intonation, showing that the information is complete."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "The /r/ sound in English is the same as the Spanish 'rr'.",
          isTrue: false,
          explanation: "Incorrect. The /r/ sound in English is softer and is produced with the tongue curled back."
        },
        {
          text: "Word stress can change the meaning of a word in English.",
          isTrue: true,
          explanation: "Correct. For example: 'REcord' (noun) vs 'reCORD' (verb)."
        },
        {
          text: "Silent letters in English words should always be pronounced.",
          isTrue: false,
          explanation: "Incorrect. Silent letters are not pronounced: 'knife' /naɪf/, 'lamb' /læm/."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="How is the '-ed' in 'walked' pronounced?"
      options={[
        "/ed/",
        "/d/",
        "/t/",
        "/ɪd/"
      ]}
      correctAnswer={2}
      explanation="After voiceless consonants like /k/, the -ed ending is pronounced /t/: walked /wɔːkt/."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What is the difference between /b/ and /v/ in English?"
      options={[
        "There is no difference",
        "/b/ uses both lips, /v/ uses teeth and lower lip",
        "/v/ is stronger",
        "/b/ is longer"
      ]}
      correctAnswer={1}
      explanation="/b/ is made with both lips together, /v/ is made with upper teeth on the lower lip."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Intonation is more important than individual sounds for communication.",
          isTrue: true,
          explanation: "Correct. Intonation helps convey emotions, attitudes and meaning, which is crucial for effective communication."
        },
        {
          text: "All English vowels are pronounced the same length.",
          isTrue: false,
          explanation: "Incorrect. English vowels have different lengths: /i:/ is long, /ɪ/ is short."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the most common stress pattern in two-syllable words?"
      options={[
        "Always on the first syllable",
        "Nouns: first syllable, Verbs: second syllable",
        "Always on the second syllable",
        "There is no pattern"
      ]}
      correctAnswer={1}
      explanation="In two-syllable words, nouns tend to be stressed on the first syllable ('TAble') and verbs on the second ('reLAX')."
    />
  ];

  return (
    <TheoryLayout
      title="Pronunciation"
      description="Master English pronunciation: phonemes, stress, intonation, and connected speech. Essential for communicating effectively in English."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic English sounds", "Understanding of IPA symbols"]}
      estimatedTime="80 min"
    />
  );
};

export default PronunciationPage;






















