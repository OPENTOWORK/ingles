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

const EnglishVarietiesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are English Varieties?" icon="🌍">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>English varieties</strong> are the different ways English is spoken 
          across countries and regions worldwide. Each has its own tendencies in pronunciation, vocabulary, and grammar.
        </p>
        
        <QuickReference items={[
          "British English: UK, Ireland, Australia, New Zealand",
          "American English: United States, Canada",
          "Differences in pronunciation, spelling, and word choice",
          "Every major variety is valid and correct",
          "Crucial for listening comprehension and cultural awareness"
        ]} />
      </TheorySection>

      <TheorySection title="British English vs American English" icon="🇬🇧🇺🇸">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The two heavyweight varieties—British and American English—carry clear, teachable contrasts.
        </p>

        <GrammarTable
          caption="Major Differences between British and American English"
          headers={["Area", "British English", "American English", "Example"]}
          rows={[
            ["/r/ pronunciation", "Often silent at the end of a syllable", "Usually pronounced", "car /kɑː/ vs /kɑr/"],
            ["Vocabulary", "lift, lorry, trousers", "elevator, truck, pants", "lift vs elevator"],
            ["Spelling", "colour, centre, realise", "color, center, realize", "colour vs color"],
            ["Grammar", "have got; at the weekend", "have; on the weekend", "at vs on + weekend"],
            ["/æ/ vs /ɑː/", "/ɑː/ in bath, dance", "/æ/ in bath, dance", "/bɑːθ/ vs /bæθ/"],
            ["Irregular past forms", "learnt, burnt, dreamt", "learned, burned, dreamed", "learnt vs learned"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="British: \"I'll take the lift to the first floor\""
          />
          <Example 
            english="American: \"I'll take the elevator to the second floor\""
          />
          <Example 
            english="British: \"What colour is your car?\""
          />
          <Example 
            english="American: \"What color is your car?\""
          />
        </div>

        <Rule 
          title="Pronunciation Highlights"
          description="Key pronunciation contrasts:"
          examples={[
            "British: non-rhotic /r/ in many accents",
            "American: rhotic /r/ more consistently",
            "British: /ɑː/ in words like 'bath' and 'dance' (many accents)",
            "American: /æ/ commonly in those same lexical sets"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Both varieties are correct—pick one and stay consistent while remaining receptive to both.
        </Tip>
      </TheorySection>

      <TheorySection title="Other Influential Varieties" icon="🌏">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Beyond British and American norms, notable Englishes shape global communication daily.
        </p>

        <GrammarTable
          caption="Further English Varieties"
          headers={["Variety", "Countries/regions", "Notes", "Sample items"]}
          rows={[
            ["Australian English", "Australia", "British legacy plus local lexis", "arvo (afternoon), barbie (barbecue)"],
            ["Canadian English", "Canada", "Blend of British and American features", "eh? (tag), tuque (winter hat)"],
            ["New Zealand English", "New Zealand", "Māori influence, characteristic rhythm", "jandals (flip-flops), dairy (corner shop)"],
            ["South African English", "South Africa", "Local multilingual backdrop", "robot (traffic light), braai (barbecue)"],
            ["Indian English", "India", "Contact with regional languages", "prepone (schedule earlier), cousin-brother"],
            ["Singapore English", "Singapore", "Mix of lects; informal Singlish", "lah (particle), can (‘yes / possible’)"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Australian: \"Let's have a barbie this arvo\""
          />
          <Example 
            english="Canadian: \"It's cold, eh? Don't forget your tuque\""
          />
          <Example 
            english="Indian: \"I'll prepone the meeting\""
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Exposure to multiple varieties strengthens worldwide listening stamina.
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulary Differences" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Lexical divergence is usually the quickest giveaway between Englishes.
        </p>

        <GrammarTable
          caption="Vocabulary Across Varieties"
          headers={["Domain", "British English", "American English", "Gloss"]}
          rows={[
            ["Transport", "lorry, underground, petrol", "truck, subway, gas", "Road vehicle, metro, fuel"],
            ["Clothing", "trousers, jumper, trainers", "pants, sweater, sneakers", "Long pants; knit top; sporty shoes"],
            ["Food", "biscuit, chips, aubergine", "cookie, fries, eggplant", "Sweet biscuit; crisps/aubergine senses"],
            ["Home", "flat, tap, rubbish", "apartment, faucet, garbage", "Dwelling unit; valve; refuse"],
            ["Education", "university mark, rubber (eraser)", "college contexts, grade, eraser", "Uni vs Am. ‘college’ nuance differs"],
            ["Season/time", "autumn, holiday", "fall, vacation", "Fall season; leisure break"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="British: \"I'll take the underground to buy some biscuits\""
          />
          <Example 
            english="American: \"I'll take the subway to buy some cookies\""
          />
          <Example 
            english="British: \"I live in a flat and wear trainers\""
          />
          <Example 
            english="American: \"I live in an apartment and wear sneakers\""
          />
        </div>

        <Rule 
          title="Managing Lexical Variety"
          description="Coping tactics:"
          examples={[
            "Learn parallel labels for frequent words",
            "Let context disambiguate puzzling nouns",
            "You do not need every regional variant memorised upfront",
            "Ask politely when meaning is ambiguous"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> A few cognates diverge sharply—or even clash—between communities.
        </Tip>
      </TheorySection>

      <TheorySection title="Grammar Contrasts (Light Touch)" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Morphosyntax differs less dramatically than pronunciation or lexis but still warrants awareness.
        </p>

        <GrammarTable
          caption="Chief Grammatical Differences"
          headers={["Feature", "British English tendency", "American English tendency", "Example"]}
          rows={[
            ["Present Perfect", "More frequent with recent events", "Simple past often substitutes", "I've just eaten vs I just ate"],
            ["Weekend prep", "at the weekend", "on the weekend", "at vs on + weekend"],
            ["Collective nouns", "The team are… (common)", "The team is… (usual)", "plural vs singular concord"],
            ["Have vs Have got", "Have got commonplace", "'Have' often preferred lexically", "I've got vs I have"],
            ["Shall", "Still polite offers/questions", "Rarer in casual speech", "Shall we go? vs Should we go?"],
            ["Irregular past", "dreamt / learnt endings", "-ed favoured", "'t vs -ed endings"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="British: \"I've just finished my homework\""
          />
          <Example 
            english="American: \"I just finished my homework\""
          />
          <Example 
            english="British: \"The team are playing well\""
          />
          <Example 
            english="American: \"The team is playing well\""
          />
        </div>

        <Tip type="info">
          <strong>Note:</strong> These contrasts are nuanced and rarely block basic mutual understanding.                                           
        </Tip>
      </TheorySection>

      <TheorySection title="Understanding Different Accents Strategically" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Dedicated habits speed up perceptual adaptation across Englishes.
        </p>

        <GrammarTable
          caption="Listening Strategies"
          headers={["Strategy", "Description", "When", "Upside"]}
          rows={[
            ["Wide exposure", "Rotate countries and genres", "Ongoing routine", "Familiar vowels/consonants per region"],
            ["Context leveraging", "Guess unknown items from context", "New vocabulary surfaces", "Global gist intact"],
            ["Clarifying questions", "Recast or confirm politely", "You feel lost on one token", "Pinpoint comprehension"],
            ["Active interaction", "Talk with nationals from varied places", "Face-to-face or online oral work", "Fluency + perception"],
            ["Targeted media", "Curate playlists by variety", "Study blocks", "Cultural scaffolding"],
            ["Patience stance", "Let partial understanding be enough first pass", "Always", "Cuts anxiety spikes"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Exposure: 'Listen to podcasts from several continents'"
          />
          <Example 
            english="Context: 'Use surrounding sentences to gloss novel words'"
          />
          <Example 
            english="Practice: 'Speak with natives from contrasting regions'"
          />
        </div>

        <Rule 
          title="Practical Listening Habits"
          description="To raise comprehension reliably:"
          examples={[
            "Sample news desks from varied countries",
            "Watch film and television from differing regions",
            "Schedule conversation partners dispersed geographically",
            "Do not require per-word fidelity on first exposure",
            "Keep your eye on the macro message first"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Exposure volume correlates tightly with perceptual agility—prioritise hours in the earphones.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Ranking one dialect as objectively superior ❌<br/>
            <strong>Better:</strong> Treat every established variety as legitimate ✅<br/>
            <em>No single “authorised” worldwide standard</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Mixing contradictory conventions blindly ❌<br/>
            <strong>Better:</strong> Harmonise spelling and lexis consciously ✅<br/>
            <em>Pick rails and publish within them unless context demands code-switch</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Obsessing over every unknown token ❌<br/>
            <strong>Better:</strong> Aim for gist before polish ✅<br/>
            <em>Macro-understanding outweighs obsessive micro-tracking early on</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Avoiding unfamiliar accents entirely ❌<br/>
            <strong>Better:</strong> Deliberately vary your auditory diet ✅<br/>
            <em>Breadth pays compounding comprehension dividends</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Principles" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Mutual legitimacy"
            description="Neither British nor American (nor others) earns default supremacy."
            examples={[
              "British and American norms stand on equal footing",
              "Regional Englishes encode cultural histories",
              "Audience and setting steer your choice—politeness trumps pedigree",
              "Communication success is the real metric"
            ]}
          />

          <Rule 
            title="2. Consistency earns clarity"
            description="Maintain harmonised norms within any one deliverable unless genre forces switch."
            examples={[
              "Lock spelling + lex register per document style guide",
              "Avoid random hybrid unless topic demands contrast",
              "Adjust registers when relocating professionally",
              "Predictable norms reduce reader friction"
            ]}
          />

          <Rule 
            title="3. Breadth strengthens ears"
            description="Cycle through diverse accents to future-proof audition."
            examples={[
              "Expose ears beyond your favourite broadcaster",
              "Shadow speakers from disparate locales",
              "Blend textbook audio with grassroots YouTube",
              "Relax about catching every consonant instantly"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="In British English, what does 'lift' mean?"
      options={[
        "Truck",
        "Elevator",
        "Car",
        "Bus"
      ]}
      correctAnswer={1}
      explanation="'Lift' parallels American 'elevator'—vertical transport inside buildings."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which contrast is MOST iconic between mainstream British and General American pronunciation?"
      options={[
        "Treatment of unstressed vowel schwa",
        "Realisation or suppression of syllable-final /r/",
        "Aspiration strength of voiceless stops",
        "Whether /h/ is dropped"
      ]}
      correctAnswer={1}
      explanation="Non-rhotic vs rotic environments form the quintessential classroom contrast."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "American English intrinsically outranks British English.",
          isTrue: false,
          explanation: "Incorrect. Established varieties coexist with equal legitimacy; register and audience—not geography—matter."
        },
        {
          text: "Sticking deliberately to one variety across a text improves coherence.",
          isTrue: true,
          explanation: "Correct. Predictable orthography/vocabulary lowers cognitive strain for readers."
        },
        {
          text: "Differences only operate at the phoneme level.",
          isTrue: false,
          explanation: "Incorrect. Spelling, lexis, and light grammar distinctions all matter communally."
        },
        {
          text: "Rotating dialect exposure sharpens listening stamina.",
          isTrue: true,
          explanation: "Correct. Diverse auditory diet familiarises vowel shifts and local coinages alike."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which American item matches British 'biscuit' when meaning a sweet baked snack?"
      options={[
        "cookie",
        "cracker",
        "bread roll",
        "layer cake"
      ]}
      correctAnswer={0}
      explanation="American speakers usually say ‘cookie’ for the sweet biscuit sense of UK English."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which tactic most reliably widens receptive accuracy across dialects?"
      options={[
        "Avoid non-native-accent media entirely",
        "Schedule recurring listening from multiple countries",
        "Restrict training to exactly one broadcaster",
        "Memorise every lexical replacement table once"
      ]}
      correctAnswer={1}
      explanation="Distributed exposure trains flexible decoding faster than monoculture cramming."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Australian English has unique vocabulary items and idioms.",
          isTrue: true,
          explanation: "Correct—think arvo, barbie, mateship culture, etc."
        },
        {
          text: "All major Englishes share identical spelling rules.",
          isTrue: false,
          explanation: "Incorrect—witness colour/color, traveller/traveler, etc."
        },
        {
          text: "Global citizens benefit from receptive flexibility across dialects.",
          isTrue: true,
          explanation: "Correct—you reduce miscommunication friction across borders."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="In American English, what is the compartment called that British speakers label the car 'boot'?"
      options={[
        "Hood",
        "Trunk",
        "Bonnet",
        "Fender"
      ]}
      correctAnswer={1}
      explanation="'Trunk' = AmE cargo hatch; bonnet vs hood distinguishes forward panels."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which statement best captures Canadian English?"
      options={[
        "Pixel-identical clone of General American",
        "Selective fusion of British and American strands",
        "Primarily borrowing from metropolitan French phonology wholesale",
        "Lacks distinguishing traits"
      ]}
      correctAnswer={1}
      explanation="CAN English layers British spelling instincts with broadly North American consonants plus local particles."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Indian English qualifies as an established institutionalised variety.",
          isTrue: true,
          explanation: "Correct—with robust phonological, lexical, and grammatical conventions."
        },
        {
          text: "You should avoid encountering unfamiliar English accents deliberately.",
          isTrue: false,
          explanation: "Incorrect—strategic novelty accelerates perceptual widening."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Choose the best gloss: In many South African Englishes, informal 'now now' often means ____."
      options={[
        "Exactly this instant",
        "Quite soon—but not instantaneous",
        "Never",
        "Randomly intermittent"
      ]}
      correctAnswer={1}
      explanation="'Now now' typically signals imminent-but-not-clock-precise arrival—distinct from blunt 'now'."
    />
  ];

  return (
    <TheoryLayout
      title="English Varieties"
      description="Understand Englishes around the globe—British, American, and beyond—with pronunciation, lexis, grammar touchpoints, and listening strategies tailored to multilingual learners."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate listening skills", "Basic understanding of English varieties"]}
      estimatedTime="70 min"
    />
  );
};

export default EnglishVarietiesPage;
