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

const VocabularyByRegisterPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is Vocabulary by Register?" icon="📚">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Vocabulary by register</strong> means choosing words that fit the context, audience, and purpose of your writing. 
          Using the right register is essential for effective communication.
        </p>
        
        <QuickReference items={[
          "Formal register: academic, professional, official",
          "Neutral register: journalistic, informative, general",
          "Informal register: personal, conversational, casual",
          "Context determines the appropriate register",
          "Audience and purpose shape your word choices"
        ]} />
      </TheorySection>

      <TheorySection title="Formal Register" icon="🎩">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Formal register is used in academic, professional, and official contexts. It calls for precise vocabulary and often more complex structures.
        </p>

        <GrammarTable
          caption="Features of Formal Register"
          headers={["Aspect", "Formal", "Informal", "Formal example"]}
          rows={[
            ["Vocabulary", "More precise, often Latinate", "Simple, colloquial words", "commence (start), utilize (use)"],
            ["Contractions", "Avoided", "Common", "I will not (won't), do not (don't)"],
            ["Pronouns", "Limit direct “I” / “you”", "Frequent “I”, “you”", "One should consider (instead of “You should”)"],
            ["Structure", "Longer, complex sentences", "Short, simple sentences", "Despite the fact that (Although)"],
            ["Connectors", "Nevertheless, furthermore", "But, also", "Nevertheless, Furthermore"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Formal: 'The investigation commenced in January'"
            note="More formal verb choice for “started”."
          />
          <Example 
            english="Informal: 'The investigation started in January'"
            note="Neutral everyday wording."
          />
          <Example 
            english="Formal: 'One should consider all options'"
            note="Impersonal “one” instead of “you”."
          />
          <Example 
            english="Informal: 'You should consider all options'"
            note="Direct address to the reader."
          />
        </div>

        <Rule 
          title="When to use formal register"
          description="Use formal English for:"
          examples={[
            "Academic essays and dissertations",
            "Professional and business reports",
            "Official correspondence",
            "Formal presentations"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Formal register can strengthen authority and credibility.
        </Tip>
      </TheorySection>

      <TheorySection title="Neutral Register" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Neutral register appears in news, general information, and many workplace texts. It is clear and direct.
        </p>

        <GrammarTable
          caption="Features of Neutral Register"
          headers={["Aspect", "Neutral", "Example", "Context"]}
          rows={[
            ["Vocabulary", "Standard, clear words", "begin, use, help", "News, reports"],
            ["Contractions", "Occasional", "I'll, don't (in dialogue)", "Informative articles"],
            ["Pronouns", "Balance between formal and informal", "We, they, it", "Technical documentation"],
            ["Structure", "Moderately complex sentences", "Balanced sentence length", "Professional reports"],
            ["Tone", "Objective and informative", "Factual, clear", "Business communication"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Neutral: 'The company will begin production next month'"
            note="Clear, professional, not overly stiff."
          />
          <Example 
            english="Neutral: 'We need to consider the implications'"
            note="Typical workplace register."
          />
          <Example 
            english="Neutral: 'The results show significant improvement'"
            note="Objective reporting of outcomes."
          />
        </div>

        <Rule 
          title="When to use neutral register"
          description="Use neutral English for:"
          examples={[
            "News articles",
            "Technical reports",
            "Business documentation",
            "General professional communication"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Neutral register is versatile and fits many professional settings.
        </Tip>
      </TheorySection>

      <TheorySection title="Informal Register" icon="😊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Informal register suits personal, conversational, and casual contexts. It feels relaxed and friendly.
        </p>

        <GrammarTable
          caption="Features of Informal Register"
          headers={["Aspect", "Informal", "Formal", "Informal example"]}
          rows={[
            ["Vocabulary", "Everyday, colloquial words", "More formal lexis", "start (commence), get (obtain)"],
            ["Contractions", "Very common", "Usually avoided", "I'm, you're, don't, can't"],
            ["Pronouns", "Frequent “I”, “you”", "More impersonal forms", "I think, you know"],
            ["Structure", "Short, simple sentences", "Longer, complex sentences", "Short, clear sentences"],
            ["Expressions", "Colloquial phrases", "Formal phrasing", "by the way, you know"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Informal: 'I think we should start the project'"
            note="Direct and conversational."
          />
          <Example 
            english="Formal: 'It is recommended that we commence the project'"
            note="Impersonal recommendation."
          />
          <Example 
            english="Informal: 'By the way, did you get my email?'"
            note="Casual opener."
          />
        </div>

        <Rule 
          title="When to use informal register"
          description="Use informal English for:"
          examples={[
            "Personal emails",
            "Text messages",
            "Personal blogs",
            "Casual conversation"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out:</strong> Informal register may be unsuitable in academic or professional situations.
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulary for Specific Contexts" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different fields expect specific, appropriate vocabulary.
        </p>

        <GrammarTable
          caption="Vocabulary by Context"
          headers={["Context", "Typical vocabulary", "Example", "Register"]}
          rows={[
            ["Academic", "Analysis, research, methodology", "The research methodology demonstrates", "Formal"],
            ["Business", "Strategy, implementation, objectives", "We need to implement this strategy", "Neutral–formal"],
            ["Technical", "Specifications, parameters, protocols", "The system parameters indicate", "Neutral"],
            ["Medical", "Diagnosis, treatment, symptoms", "The patient exhibits symptoms", "Formal"],
            ["Legal", "Jurisdiction, precedent, clause", "According to legal precedent", "Formal"],
            ["Personal", "Feelings, experiences, opinions", "I feel that this is important", "Informal"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Academic: 'The research methodology demonstrates'"
            note="Field-specific nouns and verbs."
          />
          <Example 
            english="Business: 'We need to implement this strategy'"
            note="Typical management vocabulary."
          />
          <Example 
            english="Personal: 'I feel that this is important'"
            note="Subjective, informal tone."
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Learn the specialised vocabulary of your subject or industry.
        </Tip>
      </TheorySection>

      <TheorySection title="Shifting Between Registers" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          You sometimes shift register within one text for different sections or purposes.
        </p>

        <GrammarTable
          caption="Strategies for Shifting Register"
          headers={["Transition", "From", "To", "Example"]}
          rows={[
            ["Formal introduction", "Informal title", "Formal body", "Let me explain formally..."],
            ["Personal conclusion", "Formal analysis", "Informal opinion", "Personally, I believe..."],
            ["Casual example", "Formal theory", "Informal illustration", "For example, imagine..."],
            ["Technical summary", "Informal explanation", "Formal synthesis", "In summary, the data indicates..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Transition: 'Let me explain formally...'"
            note="Signals a deliberate shift to formal explanation."
          />
          <Example 
            english="Transition: 'Personally, I believe...'"
            note="Marks a move to a personal stance."
          />
          <Example 
            english="Transition: 'In summary, the data indicates...'"
            note="Returns to objective, formal wrap-up."
          />
        </div>

        <Rule 
          title="Tips for shifting register"
          description="To shift register effectively:"
          examples={[
            "Use clear transition phrases",
            "Keep overall coherence",
            "Justify a register shift when it matters",
            "Make sure the shift suits the situation"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out:</strong> Register shifts should be intentional and justified, not accidental.                                    
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Informal register in an academic essay ❌<br/>
            <strong>Better:</strong> Appropriate formal register ✅<br/>
            <em>Context determines register</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Mixing registers without signalling the shift ❌<br/>
            <strong>Better:</strong> Signal register shifts with clear transitions ✅<br/>
            <em>Changes should be deliberate</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Overly formal vocabulary for your audience ❌<br/>
            <strong>Better:</strong> Match vocabulary to the reader ✅<br/>
            <em>Consider who will read the text</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Ignoring the purpose of the text ❌<br/>
            <strong>Better:</strong> Choose register to match your aim ✅<br/>
            <em>Purpose shapes appropriate register</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Context determines register"
            description="Always consider context before choosing vocabulary."
            examples={[
              "Academic → Formal",
              "Business → Neutral–formal",
              "Personal → Informal",
              "Technical → Neutral"
            ]}
          />

          <Rule 
            title="2. Audience shapes word choice"
            description="Adapt vocabulary to your readers."
            examples={[
              "Experts → Technical terms",
              "General audience → Accessible wording",
              "Academic readers → Formal register",
              "Friends → Informal register"
            ]}
          />

          <Rule 
            title="3. Consistency matters"
            description="Maintain one dominant register unless you have a reason to change."
            examples={[
              "Pick a main register for the text",
              "Stay consistent within sections",
              "Change register only when needed",
              "Explain or signal major shifts"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which register should you use in an academic essay?"
      options={[
        "Informal",
        "Formal",
        "Neutral",
        "Colloquial"
      ]}
      correctAnswer={1}
      explanation="Academic essays typically require formal register: precise vocabulary and full forms (no contractions)."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which register is most appropriate for an academic essay?"
      options={[
        "Informal with contractions",
        "Formal without contractions",
        "Neutral with occasional contractions",
        "Mixed by section without signalling"
      ]}
      correctAnswer={1}
      explanation="Academic essays usually avoid contractions and use precise, formal language."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Formal register is always better than informal register.",
          isTrue: false,
          explanation: "Incorrect. The best register depends on context, audience, and purpose."
        },
        {
          text: "Contractions are appropriate in informal register.",
          isTrue: true,
          explanation: "Correct. Contractions such as “don't”, “won't”, “I'm” are normal in informal English."
        },
        {
          text: "Context determines the appropriate register.",
          isTrue: true,
          explanation: "Correct. Setting (academic, business, personal) is the main guide."
        },
        {
          text: "You should always use the same register throughout any text.",
          isTrue: false,
          explanation: "Incorrect. Consistency matters, but controlled register shifts with transitions are sometimes needed."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the best way to move from formal to informal within one text?"
      options={[
        "Change abruptly with no transition",
        "Use a clear transition phrase",
        "Mix registers in the same sentence",
        "Never change register"
      ]}
      correctAnswer={1}
      explanation="Signal shifts with phrases like “Let me put this informally...” or “Personally, I believe...”"
    />,

    <MultipleChoiceExercise
      key="5"
      question="What matters most when choosing register?"
      options={[
        "Your personal preference",
        "Context and audience",
        "Text length",
        "Topic alone"
      ]}
      correctAnswer={1}
      explanation="Context (where the text is used) and audience (who reads it) matter most."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Academic vocabulary is more precise than everyday vocabulary.",
          isTrue: true,
          explanation: "Correct. Academic English often uses more specific terms for complex ideas."
        },
        {
          text: "You should always use the most formal word available.",
          isTrue: false,
          explanation: "Incorrect. Match register to context; excessive formality can sound unnatural."
        },
        {
          text: "Register consistency is important throughout a text.",
          isTrue: true,
          explanation: "Correct. A steady register supports coherence and professionalism."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which option lists more formal alternatives to 'help'?"
      options={[
        "aid",
        "assist",
        "support",
        "All of the above"
      ]}
      correctAnswer={3}
      explanation="“Aid”, “assist”, and “support” can all be more formal than “help”, with slightly different nuances."
    />,

    <MultipleChoiceExercise
      key="8"
      question="In which context would you prefer 'purchase' over 'buy'?"
      options={[
        "Casual chat",
        "Legal or business documents",
        "Text messages",
        "Family conversation"
      ]}
      correctAnswer={1}
      explanation="“Purchase” is more formal and common in legal, commercial, or professional contexts."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Colloquial expressions are appropriate in academic writing.",
          isTrue: false,
          explanation: "Incorrect. Colloquial language is usually out of place in formal academic writing."
        },
        {
          text: "The same idea can be expressed at different levels of formality.",
          isTrue: true,
          explanation: "Correct. One idea can be informal (“big problem”) or formal (“significant issue”)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the difference between 'get' and 'obtain'?"
      options={[
        "'Get' is more formal",
        "'Obtain' is more formal",
        "There is no difference",
        "Both are colloquial"
      ]}
      correctAnswer={1}
      explanation="“Obtain” is more formal and common in academic or professional contexts; “get” is everyday and neutral–informal."
    />
  ];

  return (
    <TheoryLayout
      title="Vocabulary by Register"
      description="Master vocabulary by register in English: formal, neutral, and informal. Learn to choose appropriate words for context and audience."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of formal vs informal language"]}
      estimatedTime="70 min"
    />
  );
};

export default VocabularyByRegisterPage;
