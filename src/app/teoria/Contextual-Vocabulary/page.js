'use client';
import { buildContextualVocabularyExercises } from './contextualVocabularyExercises';
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


const ContextualVocabularyPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Is Contextual Vocabulary?" icon="📚">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Contextual vocabulary</strong> refers to words and phrases whose interpretation depends heavily on surrounding situation—and it is indispensable for realistic listening comprehension.
        </p>
        
        <QuickReference items={[
          "Meanings shift with discourse context",
          "Idioms and informal chunks",
          "Topic- or scenario-specific wording",
          "Polysemous lexical items",
          "Crucial for authentic listening clips"
        ]} />
      </TheorySection>

      <TheorySection title="Kinds of Contextual Vocabulary" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Researchers group context-sensitive language into several recognizable patterns.
        </p>

        <GrammarTable
          caption="Types of Contextual Vocabulary"
          headers={["Type", "Description", "Example", "Takeaway"]}
          rows={[
            ["Polysemy", "One form, several meanings", "bank (finance / riverbank)", "Meaning hinges on scenario"],
            ["Idioms", "Fixed figurative wording", "break the ice", "Non-compositional meaning"],
            ["Colloquialisms", "Casual conversational items", "hang out", "Register matters"],
            ["Technical lexis", "Domain-specific jargon", "CPU (computing)", "Tied to field"],
            ["Situational items", "Setting-bound labels", "boarding pass", "Anchored to scene"],
            ["Cultural references", "Locally loaded expressions", "the Big Apple → NYC", "Culture supplies sense"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Polysemy: 'bank' → financial institution versus river shore"
          />
          <Example 
            english="Idiom: 'break the ice' means to open up conversation"
          />
          <Example 
            english="Technical: 'CPU' inside a hardware discussion"
          />
        </div>

        <Rule 
          title="Why Contextual Vocabulary Matters"
          description="Listening impact:"
          examples={[
            "It reveals intended sense beyond dictionary gloss",
            "It distinguishes competing readings",
            "It unlocks figurative wording",
            "It makes jargon tractable inside domain frames"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Handling context distinguishes literal decoding from workable understanding.
        </Tip>
      </TheorySection>

      <TheorySection title="Strategies for Contextual Vocabulary" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          You can systematically coach your ear toward context-first interpretation.
        </p>

        <GrammarTable
          caption="Handling Context-Bound Meaning"
          headers={["Strategy", "Description", "When", "Illustration"]}
          rows={[
            ["Contextual inference", "Let surrounding wording narrow sense", "Unknown tokens", "Hospital setting → surgery leans surgical"],
            ["Semantic clusters", "Use related co-occurring nouns verbs", "Specialty talk", "Cluster cues signal field"],
            ["Grammatical cues", "Let syntax disambiguate", "Ambiguous lemmas", "'the bank' noun vs verb 'bank'"],
            ["Cultural knowledge", "Apply shared background", "Allusions references", "Holidays, brands, locales"],
            ["Situational framing", "Use scene stereotypes", "Service encounters", "Check-in desks imply travel jargon"],
            ["Phonetic clues", "Hear distinctions homophony cannot show in text alone", "Homophones variants", "Stress or vowel clues disambiguate"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Inference: Hearing surgery inside a surgical ward primes the medical meaning."
          />
          <Example 
            english="Semantic field: Computer, software, hardware → tech frame"
          />
          <Example 
            english="Grammar: Determiner + noun 'the bank' versus infinitival 'to bank'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Blend multiple cues—few items hinge on only one hint.
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulary in Specific Domains" icon="🏢">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Routine situations ship with predictable lexical packages.
        </p>

        <GrammarTable
          caption="Domains and Typical Items"
          headers={["Setting", "Core Lexis", "Gloss / Plain English", "Sample Line"]}
          rows={[
            ["Hospital / clinic", "surgery, diagnosis, treatment", "Procedures outcomes care", "The surgery was successful"],
            ["Airport", "boarding pass, gate, departure", "Travel logistics", "Gate 15 for departure"],
            ["Restaurant", "appetizer, entrée, dessert", "Courses of a meal", "I'll have the entrée"],
            ["Office workplace", "deadline, meeting, presentation", "Work scheduling deliverables", "The deadline is Friday"],
            ["School", "assignment, exam, grade", "Academic chores marks", "The exam is tomorrow"],
            ["Retail", "sale, discount, receipt", "Pricing checkout", "There's a 20% discount"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Hospital: 'The surgery was successful' — outcome update"
          />
          <Example 
            english="Airport: 'Gate 15 for departure' — paging announcement"
          />
          <Example 
            english="Office: 'The deadline is Friday' — schedule pressure"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Pre-load domain packs you meet often to shrink reaction time.
        </Tip>
      </TheorySection>

      <TheorySection title="Everyday Idioms" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Figurative chunks are pervasive in informal listening tracks.
        </p>

        <GrammarTable
          caption="Sample Idioms"
          headers={["Expression", "Surface Image", "Intended Meaning", "Line"]}
          rows={[
            ["Break the ice", "Breaking frozen water", "Start social contact", "Let's break the ice with introductions"],
            ["Hit the nail on the head", "Hammer metaphor", "Be exactly right", "You hit the nail on the head"],
            ["Spill the beans", "Pour legumes", "Reveal a secret", "Don't spill the beans about the surprise"],
            ["Piece of cake", "Dessert image", "Very easy", "This test is a piece of cake"],
            ["Break a leg", "Injury image", "Good luck theatrically", "Break a leg in your presentation"],
            ["Cost an arm and a leg", "Body-price joke", "Extremely expensive", "This car costs an arm and a leg"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Break the ice: 'Let's open with quick introductions'"
          />
          <Example 
            english="Piece of cake: 'This test is effortless'"
          />
          <Example 
            english="Break a leg: 'Best wishes before you go on stage'"
          />
        </div>

        <Rule 
          title="Listening to Idioms"
          description="Dos and don&apos;ts:"
          examples={[
            "Reject literal images",
            "Let prosody humor partner lines signal non-literal readings",
            "Collect recurring bundles by conversational niche",
            "Study short authentic clips—not isolated flash lists only"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Idioms seldom map word-for-word into another tongue.
        </Tip>
      </TheorySection>

      <TheorySection title="Words With Multiple Meanings" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Polysemy is normal; context performs disambiguation.
        </p>

        <GrammarTable
          caption="Polysemous Sight Words"
          headers={["Word", "Sense A", "Sense B", "Disambiguator"]}
          rows={[
            ["Bank", "Financial institution", "River edge", "Domain collocations"],
            ["Bat", "Flying mammal", "Sports club", "Environment cues"],
            ["Bear", "Large mammal", "Tolerate carry", "POS and syntax"],
            ["Fair", "Just equitable", "Carnival market", "Adjective noun split"],
            ["Light", "Illumination", "Low weight pale", "Complement patterns"],
            ["Right", "Correct / fair", "Direction (vs. left)", "Collocation companions"],
            ["Spring", "Season", "Metal coil Verb leap", "Time vs mechanics"],
            ["Wave", "Ocean swell", "Hand greeting", "Sensory modality"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="'I go to the bank' versus 'along the river bank'"
          />
          <Example 
            english="'I saw a bear' versus 'I can't bear this noise'"
          />
          <Example 
            english="'Turn on the light' versus 'This suitcase is light'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Grammar companions (articles objects complements) cue which lemma fired.
        </Tip>
      </TheorySection>

      <TheorySection title="Inference Tactics" icon="🧠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Inference stitches partial evidence into stable interpretations.
        </p>

        <GrammarTable
          caption="Listening Inference Moves"
          headers={["Move", "Description", "Mini Example", "Best Moment"]}
          rows={[
            ["Local cotext", "Immediate neighbors constrain sense", "'The doctor performed surgery'", "Unknown mid-clause noun"],
            ["Global scenario", "Topic steers jargon class", "Hospital bedside chat", "When register flips specialized"],
            ["Morphosyntax slots", "'the bank' DP vs verbal 'bank'", "When homographs collide"],
            ["Prior schematic knowledge", "If topic is GPUs expect silicon lexis", "STEM business arts frames"],
            ["Phonic disambiguation", "read /riːd/ versus /rɛd/ tense", "When spelling hides"],
            ["Cultural frame", "Holiday foods sports icons anchor sense", "Thanksgiving discourse"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Immediate context: professional + performed + surgery ⇒ medical surgery"
          />
          <Example 
            english="Broad frame: admitting desk dialogue ⇒ intake vocabulary cluster"
          />
          <Example 
            english="Syntax: noun phrase 'the bank' vs auxiliary chain around verb 'bank'"
          />
        </div>

        <Rule 
          title="Inference Routine"
          description="A workable sequence:"
          examples={[
            "1. Spot the troublesome word",
            "2. Replay micro-window around it mentally",
            "3. Expand to discourse topic",
            "4. Deploy grammar cues",
            "5. Mobilize encyclopedic guesses",
            "6. Commit to best-fit hypothesis verify downstream lines"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Inference warms up with repetition—expect early misses.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Forcing idioms literally ❌<br/>
            <strong>Better:</strong> Use cotext irony tone for figurative meanings ✅<br/>
            <em>Figuration resists verbatim glossing</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Assuming one lemma one sense ❌<br/>
            <strong>Better:</strong> Hold rival readings until cotext adjudicates ✅<br/>
            <em>English polysemy is pervasive</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Ignoring cotext cues ❌<br/>
            <strong>Better:</strong> Anchor guesses to evidence nearby ✅<br/>
            <em>Context outweighs brute guessing</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Skipping deliberate inference drills ❌<br/>
            <strong>Better:</strong> Cycle short clips guessing then verifying ✅<br/>
            <em>Confidence grows rehearsal by rehearsal</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Cotext adjudicates meaning"
            description="Neither spelling nor pronunciation alone settles polysemy."
            examples={[
              "Combine micro and macro windows",
              "Track evolving topic line",
              "Watch syntactic scaffolding",
              "Mobilize world knowledge ethically"
            ]}
          />

          <Rule 
            title="2. Inference trains like a muscle"
            description="Productive guessing improves with calibrated feedback loops."
            examples={[
              "Rotate diverse themed inputs",
              "Log surprises revise mental lexicon",
              "Stack heuristic clues rather than leaning on one trick",
              "Trust existing schemas when acoustics waver"
            ]}
          />

          <Rule 
            title="3. Lexicon is dynamic"
            description="Bundles slip registers topics and eras."
            examples={[
              "Single lemmas split along sense lines",
              "Idiom density spikes informal peer talk",
              "Technical terms regiment inside communities of practice",
              "Culture rewires associative links"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Contextual Vocabulary"
      description="Learn how English words shift with context—from idioms to polysemy—and practise inference tactics for realistic listening tasks."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildContextualVocabularyExercises}
      prerequisites={["Basic vocabulary", "Understanding of context"]}
      estimatedTime="70 min"
    />
  );
};

export default ContextualVocabularyPage;
