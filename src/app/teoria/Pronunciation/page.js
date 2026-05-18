'use client';
import { buildPronunciationExercises } from './pronunciationExercises';
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


const PronunciationPage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Pronunciation"
      description="Master English pronunciation: phonemes, stress, intonation, and connected speech. Essential for communicating effectively in English."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildPronunciationExercises}
      prerequisites={["Basic English sounds", "Understanding of IPA symbols"]}
      estimatedTime="80 min"
    />
  );
};

export default PronunciationPage;






















