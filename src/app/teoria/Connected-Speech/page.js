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

const ConnectedSpeechPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is Connected Speech?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Connected speech</strong> describes how neighbouring sounds tighten, reshape, or link when fluent speakers talk smoothly. Knowing these patterns anchors understanding of everyday English listening.
        </p>
        
        <QuickReference items={[
          "Linking: join final and initial sounds smoothly",
          "Elision: drop sounds for ease or speed",
          "Assimilation: neighbouring sounds influence each other",
          "Intrusion: insert glide consonants between vowels",
          "Weak forms: reduced pronunciations of function words"
        ]} />
      </TheorySection>

      <TheorySection title="Linking" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Linking happens when syllable edges blur so fluent speech resembles one flowing phrase.
        </p>

        <GrammarTable
          caption="Kinds of Linking"
          headers={["Type", "Description", "Example", "Heard Approximation"]}
          rows={[
            ["Consonant + vowel", "Final consonant runs into opening vowel", "an apple", "anapple"],
            ["Vowel + vowel", "Hiatus eased by intrusive glides", "go out", "gow-out flow"],
            ["Consonant + consonant", "Clusters tighten across edges", "red dress", "reddress-feel"],
            ["Same consonant twice", "One prolonged articulation spans words", "big girl", "bigirl-like"],
            ["Linking /r/", "Historically vowel-/r/-/vowel chaining", "car is", "car…is smooth link"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Consonant + vowel: 'an apple' may sound fused as one chunk"
          />
          <Example 
            english="Vowel + vowel: 'go out' often slips in /w/: gow-out"
          />
          <Example 
            english="Linking /r/: 'far away' or 'car is' illustrate intervocal /r/"
          />
        </div>

        <Rule 
          title="Listening for Linking"
          description="What to anticipate:"
          examples={[
            "Final consonants lean into vowel onsets next door",
            "Adjacent vowels may recruit /j/, /w/, or consonantal linking /r/",
            "Identical consonants may surface as single extended gesture",
            "Many UK speakers link post-vocalic /r/ purely before another vowel"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Expect continuous melodic phrasing, not cleanly isolated classroom syllables.
        </Tip>
      </TheorySection>

      <TheorySection title="Elision" icon="✂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Speakers drop consonants or weak vowels whenever articulatory ease demands it.
        </p>

        <GrammarTable
          caption="Typical Elision Sites"
          headers={["Type", "What's Omitted", "Example", "Heard Sketch"]}
          rows={[
            ["Consonant clusters", "A weaker consonant inside the cluster may vanish", "handbag", "hambag-style"],
            ["Weak syllables", "Unstressed vowels shorten or vanish", "chocolate", "choclit-style"],
            ["Word-final consonants", "Especially before consonants starts", "and", "sometimes 'ən"],
            ["Schwa reduction", "Unstressed nuclei erased", "camera", "camra-style"],
            ["Informal contractions", "Final consonants shaved", "don't", "don'"],
            ["Function bundles", "Prepositions squeezed", "of the", "/əv ðə/"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Clusters: handbag may foreground /m/ bridging hand + bag"
          />
          <Example 
            english="Weak syllables: chocolate often trims to CHOClit rhythm"
          />
          <Example 
            english="Function word: unstressed 'and' collapses toward /ən/"
          />
        </div>

        <Rule 
          title="Where Elision Thrives"
          description="Especially common:"
          examples={[
            "Fast conversational tempos",
            "Awkward consonant piles",
            "Unstressed middle syllables",
            "Highly frequent grammatical words"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Omissions reduce word-boundary salience—you track meaning spans not tokens.
        </Tip>
      </TheorySection>

      <TheorySection title="Assimilation" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A consonant adopts place manner or voicing cues from neighbours for smoother transitions.
        </p>

        <GrammarTable
          caption="Assimilation Types"
          headers={["Type", "Adjustment", "Example", "Rough Result"]}
          rows={[
            ["Place change", "/t/, /d/ → bilabials before bilabials", "that pen", "thap pen"],
            ["Velar nasal", "/n/ → velar nasal before velars", "ten cups", "teŋ cups"],
            ["Voicing spread", "/s/ may voice near voiced obstruents", "this boy", "thiz boy"],
            ["Bilabial nasal", "/n/→/m/ before bilabials", "ten men", "tem men"],
            ["Liquid shift", "/n/ may lean lateral before liquids (varieties)", "ten lions", "tellions-style"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Alveolar reassignment: 'that pen' leaning toward laminal /p/"
          />
          <Example 
            english="Nasal assimilation: 'ten cups' with velar nasal before /k/"
          />
          <Example 
            english="Voicing assimilation: 'this boy' with voiced fricative onset"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Assimilation smoothes consonant landings—you hear adjusted targets, not citation forms.
        </Tip>
      </TheorySection>

      <TheorySection title="Intrusion" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Fluent speakers wedge transitional consonants chiefly between back-to-back vowels.
        </p>

        <GrammarTable
          caption="Intrusive Consonants"
          headers={["Type", "Added Sound", "Example", "Heard Gesture"]}
          rows={[
            ["J intrusion", "/j/", "see it", "/siːjɪt/"],
            ["W intrusion", "/w/", "go out", "/ɡəʊwaʊt/"],
            ["R intrusion", "/ɹ/", "idea of", "idear-of flow"],
            ["Glottal reinforcement", "/ʔ/ between vowels pauses", "uh-oh", "ʔ hiatus"],
            ["Linking r (non-rhotic)", "/ɹ/", "car is", "car-r-is"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="J glide: smoothing /i:/ into following vowels as in 'she asked'"
          />
          <Example 
            english="W glide: bridging rounded vowels in 'go away'"
          />
          <Example 
            english="Intrusive r: bridging schwa endings with vowel onsets ('law and order' → law-r-and)"
          />
        </div>

        <Rule 
          title="Intrusion Listening Hints"
          description="Especially likely when:"
          examples={[
            "Two vowels abut directly",
            "First word closes on a lax vowel or schwa",
            "Speaker accelerates conversational pace",
            "Speaker avoids awkward hiatus"
          ]}
        />

        <Tip type="info">
          <strong>Note:</strong> Intrusions spike in spontaneous fast speech—they are normal, not mistakes.
        </Tip>
      </TheorySection>

      <TheorySection title="Weak Forms" icon="🔇">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Lexical stresses star; grammatical glue words shrink toward central vowels or vanish consonants.
        </p>

        <GrammarTable
          caption="Common Weak Forms"
          headers={["Word", "Strong Form", "Typical Weak", "Sample Phrase"]}
          rows={[
            ["and", "/ænd/", "/ənd/, /ən/, /n/", "bread and butter"],
            ["of", "/ɒv/", "/əv/", "cup of tea"],
            ["to", "/tuː/", "/tə/", "go to school"],
            ["for", "/fɔː/", "/fə/", "wait for me"],
            ["you", "/juː/", "/jə/", "thank you"],
            ["are", "/ɑː/", "/ə/", "they are here"],
            ["was", "/wɒz/", "/wəz/", "he was there"],
            ["can", "/kæn/", "/kn/, /kən/", "I can go"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="and: unstressed clauses often shorten /ænd/ to /ən/"
          />
          <Example 
            english="of: between nouns collapses heavily: cup ə tea"
          />
          <Example 
            english="to: before consonants favors /tə/: go tə work"
          />
        </div>

        <Rule 
          title="When Weak Forms Surface"
          description="Hallmarks:"
          examples={[
            "Most function words carrying low information load",
            "When the lexical item avoids contrastive emphasis",
            "During conversational tempi emphasizing content words",
            "When rhythm favors alternating strong–weak pulses"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Weak syllables camouflage lexical edges—semantic stress elsewhere rescues gist.
        </Tip>
      </TheorySection>

      <TheorySection title="Strategies for Connected Speech" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Conscious habits pair bottom-up acoustics with top-down pragmatic prediction.
        </p>

        <GrammarTable
          caption="Comprehension Habits"
          headers={["Strategy", "Focus", "When", "Payoff"]}
          rows={[
            ["Prediction", "Anticipate collocations pragmatic goals", "Pre-listen skim", "Narrow hypothesis space"],
            ["Chunking goals", "Mark idea units not dictionary tokens", "While listening", "Keep pace with blurred edges"],
            ["Keyword spotting", "Content words outweigh glue fragments", "Any density", "Stability under reduction"],
            ["Shadow replays", "Loop tough spans after transcript check", "Post-listen tutoring", "Map sound–spelling mismatches"],
            ["Accent exposure breadth", "Generalize linkage rules across varieties", "Long-term drills", "Normalise variability"],
            ["Context leverage", "Pragmatic scaffolding repairs missing phones", "Real-time comprehension", "Resilient guesses"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Prediction: coffee shop primes milk sugar price collocations."
          />
          <Example 
            english="Chunks: Hearing 'wouldja' recognises 'would you' politely fused."
          />
          <Example 
            english="Context: Reduced 'n' survives because noun phrases stay parallel."
          />
        </div>

        <Rule 
          title="Practical Tips"
          description="Sharpen authentic listening stamina:"
          examples={[
            "Prioritise documentaries interviews podcasts—not only slow classroom audio",
            "Rotate accents registers speaking rates",
            "Release perfectionism about lexical boundaries",
            "Anchor meso-level gist while micro-sounds reorganise temporarily",
            "Pair captions carefully only after an honest naked listen"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Regular authentic exposure rewires expectancy for blurry boundaries.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Expect citation-style clarity ❌<br/>
            <strong>Better:</strong> Model natural slurring linking reduction ✅<br/>
            <em>Real discourse layers compression constantly</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Ignore pragmatic scaffolding ❌<br/>
            <strong>Better:</strong> Use topic partners to decode glue syllables ✅<br/>
            <em>Semantics rescues brittle acoustic edges</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Obsess every modified phone ❌<br/>
            <strong>Better:</strong> Maintain macro-topic tracking ✅<br/>
            <em>Global gist often suffices before lexical repair</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Avoid natural-speed audio ❌<br/>
            <strong>Better:</strong> Steadily widen exposure bands ✅<br/>
            <em>Habituation rewires auditory expectations</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Natural speech blends"
            description="Linkage elision assimilation define fluency—they are systemic not sloppy."
            examples={[
              "Adjacent segments negotiate place voicing continuancy",
              "Lexical stresses tower while grammatical atoms shrink rhythmically",
              "Listeners infer word edges partly from probabilistic cues",
              "Teachers slow models help beginners only as stepping stones"
            ]}
          />

          <Rule 
            title="2. Context heals ambiguity"
            description="Reduced phones leave holes discourse expectations fill pragmatically."
            examples={[
              "Collocation ranges predict weakened function words nearby",
              "Information structure highlights focus elements audibly louder",
              "Turn-taking norms signal answerhood before detail clarity",
              "World knowledge restricts unlikely homophone clashes"
            ]}
          />

          <Rule 
            title="3. Exposure drives ease"
            description="Passive massive input plus pinpointed rehearsal accelerates perceptual fluency."
            examples={[
              "Weekly authentic minutes beat rare ultra-slow drills alone",
              "Micro-loop challenging clusters after transcript peek solidifies contrasts",
              "Shadowing aligns articulatory gestures with blurry streams",
              "Genre familiarity reduces cognitive load reserving capacity for nuances"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="In connected speech, what happens to neighbouring sounds chiefly?"
      options={[
        "They remain fully separated every time",
        "They knit together for rhythmic flow",
        "They disappear completely without trace",
        "They always lengthen dramatically"
      ]}
      correctAnswer={1}
      explanation="Fluent delivery smears syllable margins so consonants vowels reorganise perceptually—not isolated beads."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What best defines linking?"
      options={[
        "Removing every unstressed vowel",
        "Joining syllable-final and syllable-initial gestures",
        "Inserting vowels arbitrarily",
        "Slowing consonants artificially"
      ]}
      correctAnswer={1}
      explanation="Linking co-articulates word edges so consonants glide into vowels or twin consonants merge."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Connected speech phenomena are normal rather than careless errors.",
          isTrue: true,
          explanation: "Correct. Native fluency universally compresses and reshapes neighbouring phones."
        },
        {
          text: "Weak forms overwhelmingly target function vocabulary.",
          isTrue: true,
          explanation: "Correct. Grammatical satellites reduce while content lemmas stay relatively full."
        },
        {
          text: "You must decode each dictionary word cleanly before catching gist.",
          isTrue: false,
          explanation: "Incorrect. Meaning windows often stabilize before lexical edges crystallise acoustically."
        },
        {
          text: "Steady authentic listening gradually eases blurred-boundary comprehension.",
          isTrue: true,
          explanation: "Correct. Statistical learning retunes perceptual expectations over months."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which blend best matches habitual treatment of frequent 'go out' sequences?"
      options={[
        "go out untouched",
        "gow-out style glide bridging vowels",
        "go hyphen ut fully paused",
        "gout lexicalised anew"
      ]}
      correctAnswer={1}
      explanation="Back vowel /əʊ/ into /aʊ/ frequently recruits intrusive /w/ smoothing the hiatus."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Most effective overarching tactic when phones blur aggressively?"
      options={[
        "Listen only hyper-enunciated materials forever",
        "Exploit pragmatic prediction plus chunk-level meaning",
        "Avoid rapid native speech entirely",
        "Memorise every assimilation tableau exhaustively beforehand"
      ]}
      correctAnswer={1}
      explanation="Top-down scaffolding plus probabilistic lexical guessing sustains realtime comprehension."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Weak pronunciation variants cluster around auxiliary preposition article words.",
          isTrue: true,
          explanation: "Correct. These carry grammar glue not novel referential content hence shrink rhythmically."
        },
        {
          text: "Assimilation adjusts consonants toward neighbouring place manner voicing cues.",
          isTrue: true,
          explanation: "Correct. Gestures economise muscular effort aligning adjacent targets."
        },
        {
          text: "Connected speech confines itself exclusively to slang registers.",
          isTrue: false,
          explanation: "Incorrect. Even careful formal speech exhibits predictable linking assimilation reductions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What approximate surface often emerges from rapid 'good day'?"
      options={[
        "No temporal compression",
        "Consonant elision thinning final /d/",
        "Extra vowels inserted mechanically",
        "Uniform syllable stretching"
      ]}
      correctAnswer={1}
      explanation="Many speakers drop or weaken terminal /d/ before another consonant yielding goo-day-like contours."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which line illustrates intrusive /r/-style bridging for many non-rhotic speakers?"
      options={[
        "I am contracting to I'm",
        "Law and order → law-r-and rhythm",
        "Good boy assimilating consonants differently",
        "Ten boys yielding bilabial nasal shift"
      ]}
      correctAnswer={1}
      explanation="'Law(r)and' style smoothing links schwa-derived finals with vowel-initial followers."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Typical casual elisions quicken rhythmic delivery packing ideas tighter.",
          isTrue: true,
          explanation: "Correct. Dropping weaker segments accelerates conversational tempo conserving energy."
        },
        {
          text: "You must catalogue every microscopic rule change before comprehension begins.",
          isTrue: false,
          explanation: "Incorrect. Probabilistic chunk recognition plus gist tracking usually precedes fine-grained analysis."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Single best long-game improvement for decoding connected speech reliably?"
      options={[
        "Grammar-only workbook drills",
        "Regular authentic listening diversified by genre accent pace",
        "Avoid interacting with native spontaneous speech entirely",
        "Read silently without audio pairing"
      ]}
      correctAnswer={1}
      explanation="Statistical perceptual tuning requires varied naturalistic exposure cycles beyond abstract rule lists."
    />
  ];

  return (
    <TheoryLayout
      title="Pronunciation and Connected Speech"
      description="Decode natural English rhythm: linking, elision, assimilation, intrusive consonants, and weak forms—with listening strategies you can practise immediately."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic pronunciation", "Understanding of English sounds"]}
      estimatedTime="75 min"
    />
  );
};

export default ConnectedSpeechPage;
