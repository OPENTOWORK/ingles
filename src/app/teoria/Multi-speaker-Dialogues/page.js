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

const MultiSpeakerDialoguesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Multi-speaker Dialogues?" icon="👥">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Multi-speaker dialogues</strong> are conversations among three or more people 
          that appear in advanced listening exams. They require sophisticated comprehension and tracking skills.
        </p>
        
        <QuickReference items={[
          "Participants: 3 or more people",
          "Length: 4–10 minutes",
          "Contexts: debates, meetings, group discussions",
          "Goal: complex information and relationships",
          "Level: B2–C1–C2 (upper-intermediate to advanced)"
        ]} />
      </TheorySection>

      <TheorySection title="Features of Multi-speaker Dialogues" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Multi-speaker dialogues have distinctive features that make them especially challenging.
        </p>

        <GrammarTable
          caption="Features of Multi-speaker Dialogues"
          headers={["Feature", "Description", "Challenge", "Strategy"]}
          rows={[
            ["Multiple voices", "3+ people speaking", "Telling every voice apart", "Systematic identification"],
            ["Complex interactions", "Several conversational threads", "Following every exchange", "Mapping relationships"],
            ["Interruptions", "Frequent overlapping speech", "Keeping context amid interruptions", "Use context to infer"],
            ["Rapid shifts", "Frequent speaker changes", "Following quick turn-taking", "Anticipation and preparation"],
            ["Fragmented information", "Facts spread across speakers", "Piecing together several sources", "Information synthesis"],
            ["Group dynamics", "Complex hierarchy and rapport", "Grasping social dynamics", "Watch for patterns"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Context: Team meeting with four people"
          />
          <Example 
            english="Participants: Manager, Designer, Developer, Analyst"
          />
          <Example 
            english="Challenge: Following several conversational threads at once"
          />
        </div>

        <Rule 
          title="Distinctive Challenges of Multi-speaker Dialogues"
          description="Specific challenges include:"
          examples={[
            "Telling several voices apart at the same time",
            "Following multiple conversational threads",
            "Handling interruptions and overlapping speech",
            "Piecing together information from several sources",
            "Understanding complex group dynamics"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Multi-speaker dialogues call for parallel processing and synthesis skills.
        </Tip>
      </TheorySection>

      <TheorySection title="Types of Multi-speaker Dialogues" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Multi-speaker dialogues vary by setting and purpose.
        </p>

        <GrammarTable
          caption="Types of Multi-speaker Dialogues"
          headers={["Type", "Context", "Participants", "Key Information"]}
          rows={[
            ["Work meeting", "Company, project, team", "Manager, team members", "Decisions, tasks, deadlines"],
            ["Academic debate", "University, conference", "Professors, students", "Arguments, evidence, conclusions"],
            ["Panel discussion", "Media, conference", "Experts, moderator", "Opinions, analysis, perspectives"],
            ["Medical consultation", "Hospital, clinic", "Doctor, patient, family", "Symptoms, diagnosis, treatment"],
            ["Negotiation", "Company, contract", "Negotiating parties", "Terms, conditions, agreements"],
            ["Social chat", "Group of friends", "Several friends", "Events, plans, experiences"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Meeting: 'Project meeting with the manager and three developers'"
          />
          <Example 
            english="Debate: 'Academic debate on climate change'"
          />
          <Example 
            english="Panel: 'Panel of technology experts'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Spot the dialogue type early to anticipate roles, dynamics, and the kind of information you will hear.
        </Tip>
      </TheorySection>

      <TheorySection title="Strategies for Multi-speaker Dialogues" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Multi-speaker dialogues benefit from specialised strategies for managing complexity.
        </p>

        <GrammarTable
          caption="Specialised Strategies for Multi-speaker Dialogues"
          headers={["Strategy", "Description", "When to Use It", "Benefit"]}
          rows={[
            ["Voice mapping", "Mental map of who sounds like what and does what", "At the opening of the dialogue", "Consistent identification"],
            ["Turn tracking", "Note who speaks when", "Throughout the conversation", "Stay oriented"],
            ["Pattern spotting", "Notice recurrent interaction routines", "As the dialogue unfolds", "Anticipate behaviour"],
            ["Information synthesis", "Combine clues from multiple speakers", "During and after listening", "Fuller understanding"],
            ["Interruption management", "Cope with overlap", "When people cut in", "Preserve overall meaning"],
            ["Dynamics analysis", "Track relationships and hierarchy", "Throughout the dialogue", "Deeper comprehension"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Mapping: 'Manager (deep voice), Designer (higher pitch), Developer (younger voice)'"
          />
          <Example 
            english="Tracking: 'Manager asks → Designer answers → Developer cuts in'"
          />
          <Example 
            english="Synthesis: 'Manager wants X, Designer prefers Y, Developer suggests Z'"
          />
        </div>

        <Rule 
          title="Step-by-step Process"
          description="Follow this process for multi-speaker dialogues:"
          examples={[
            "1. Identify and map every speaker you can",
            "2. Assign roles and functions to each voice",
            "3. Read all questions beforehand so you know what to listen for",
            "4. Follow turn-taking and interaction patterns",
            "5. Synthesise facts from multiple sources",
            "6. Analyse dynamics and relationships between speakers"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not try to track everything at once—prioritise the information the questions demand.
        </Tip>
      </TheorySection>

      <TheorySection title="Identifying and Mapping Voices" icon="🗺️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Systematically identifying voices is crucial for navigating multi-speaker dialogue.
        </p>

        <GrammarTable
          caption="Voice Identification System"
          headers={["Feature", "Description", "Example", "How to Use It"]}
          rows={[
            ["Vocal quality", "Pitch, tone, timbre", "Low vs higher voice", "Tell speakers apart physically"],
            ["Speaking style", "Speed, rhythm, pauses", "Fast vs slow delivery", "Match speech habits to speakers"],
            ["Vocabulary", "Level, jargon, register", "Technical vs informal", "Discriminate by word choice"],
            ["Functional role", "What they do in the talk", "Moderator vs panelist", "Discriminate by job in the dialogue"],
            ["Interaction habits", "When and how they speak", "Opens vs replies", "Track behaviour patterns"],
            ["Attitude and tone", "Emotional stance", "Combative vs collaborative", "Discriminate by attitude"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Qualities: 'Manager: slow, low voice; Designer: higher, faster pace'"
          />
          <Example 
            english="Roles: 'Manager: steers; Designer: proposes; Developer: pushes back'"
          />
          <Example 
            english="Pattern: 'Manager kicks off; Designer expands; Developer interrupts'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Combine several cues to build a clear mental profile for each speaker.
        </Tip>
      </TheorySection>

      <TheorySection title="Handling Interruptions and Overlap" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Overlap and interruptions are common in multi-speaker dialogue and demand targeted tactics.
        </p>

        <GrammarTable
          caption="Strategies for Handling Interruptions"
          headers={["Situation", "Strategy", "Example", "Outcome"]}
          rows={[
            ["Overlapping speech", "Infer from context", "Two people talking at once", "Grasp the overall message"],
            ["Abrupt interruption", "Mark where the switch happens", "One speaker barges in on another", "Track the new speaker"],
            ["Gradual takeover", "Watch the transition", "One speaker eases into the floor", "Follow the natural shift"],
            ["Polite interruption", "Hear bids for the floor", "\"Can I just say…?\"", "Expect a speaker change"],
            ["Return to topic", "Notice when thread resumes", "\"Going back to what you were saying…\"", "Stay with the topic"],
            ["Clarification", "Lean on wider context", "\"What do you mean?\"", "Infer intent"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Overlapping speech: 'Two people speak simultaneously'"
          />
          <Example 
            english="Interruption: 'The manager cuts off the Designer'"
          />
          <Example 
            english="Returning: \"Going back to what the Designer was saying…\""
          />
        </div>

        <Rule 
          title="Tips for Handling Interruptions"
          description="To handle interruptions effectively:"
          examples={[
            "Do not stress over hearing every syllable",
            "Use surrounding context to infer meaning",
            "Notice who has the floor at each moment",
            "Watch patterns of intrusion and recovery",
            "Keep your attention on answer-relevant information"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Interruptions are normal in groups—stay calm and use context cues.
        </Tip>
      </TheorySection>

      <TheorySection title="Multi-source Information Synthesis" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Combining information across speakers is central to succeeding on multi-speaker tasks.
        </p>

        <GrammarTable
          caption="Multi-source Synthesis Techniques"
          headers={["Technique", "Description", "Example", "Benefit"]}
          rows={[
            ["Theme-based integration", "Merge facts around one subtopic", "Budget: Manager $100k, Designer $80k", "Full view of one thread"],
            ["Opinion comparison", "Contrast standpoints", "Manager: upbeat; Designer: cautious; Developer: negative", "See different viewpoints"],
            ["Time sequencing", "Track how ideas evolve", "Manager proposes → Designer expands", "See how an issue unfolds"],
            ["Information hierarchy", "Weight facts by importance", "Manager: final call; Designer: idea; Developer: detail", "Grasp relative weight"],
            ["Agreement vs disagreement", "Spot alignment and clash", "Manager and Designer align; Developer dissents", "Read group dynamics"],
            ["Complementary detail", "Join pieces that fit", "Manager: goal; Designer: method; Developer: resources", "One coherent picture"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Integration: 'Budget: Manager $100k, Designer $80k, Developer $120k'"
          />
          <Example 
            english="Contrast: 'Manager: optimistic; Designer: realistic; Developer: pessimistic'"
          />
          <Example 
            english="Agreement: 'Manager and Designer agree; Developer has reservations'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Synthesis helps you see the whole picture—not only isolated contributions.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Never mapping voices in a disciplined way ❌<br/>
            <strong>Better:</strong> Build a voice map from the first minute ✅<br/>
            <em>Systematic ID is crucial with several speakers</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Trying to follow everything at once ❌<br/>
            <strong>Better:</strong> Prioritise relevant information ✅<br/>
            <em>Focus on what the items ask</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Getting lost when overlap hits ❌<br/>
            <strong>Better:</strong> Lean on context to hold meaning ✅<br/>
            <em>Overlaps happen—context keeps you anchored</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Failing to synthesise ❌<br/>
            <strong>Better:</strong> Combine facts from multiple sources ✅<br/>
            <em>Synthesis unlocks the full picture</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Principles" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Systematic identification"
            description="Map every distinct voice early."
            examples={[
              "Catch each speaker’s opening lines",
              "Note memorable vocal fingerprints",
              "Assign roles",
              "Update your map throughout"
            ]}
          />

          <Rule 
            title="2. Track patterns"
            description="Observe and follow recurring interaction rhythms."
            examples={[
              "Monitor who tends to speak when",
              "Notice interruption habits",
              "Follow topic shifts and returns",
              "Recognise broader group dynamics"
            ]}
          />

          <Rule 
            title="3. Active synthesis"
            description="Integrate cues from multiple sources."
            examples={[
              "Cluster details by topic",
              "Compare perspectives",
              "Flag consensus and dissent",
              "Produce one integrated view of the issue"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="How many people take part in a multi-speaker dialogue?"
      options={[
        "2 participants",
        "3 or more participants",
        "Just 1 participant",
        "At most 2 participants"
      ]}
      correctAnswer={1}
      explanation="Multi-speaker dialogues are defined by having three or more participants, making them denser than two-person exchanges."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which strategy matters most for multi-speaker dialogues?"
      options={[
        "Take no notes",
        "Draw a mental map of voices right away",
        "Only listen at the end",
        "Ignore interruptions"
      ]}
      correctAnswer={1}
      explanation="Mapping voices immediately helps you tell speakers apart in a repeatable way—the foundation for everything else."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Multi-speaker dialogues require systematic identification of voices.",
          isTrue: true,
          explanation: "Correct. You need an identification system that mixes vocal and behavioural cues."
        },
        {
          text: "You should attempt to monitor every detail simultaneously.",
          isTrue: false,
          explanation: "Incorrect. Prioritise task-relevant information and use synthesis to manage load."
        },
        {
          text: "Interruptions are normal in multi-speaker dialogue.",
          isTrue: true,
          explanation: "Correct. Cut-ins and overlap are frequent in groups and merit specific coping tactics."
        },
        {
          text: "Cross-speaker synthesis is unimportant.",
          isTrue: false,
          explanation: "Incorrect. Combining information from multiple speakers is essential for the full scenario."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which factor best helps you recognise individual speakers?"
      options={[
        "Pitch alone",
        "Vocabulary alone",
        "A bundle of cues together",
        "Their functional role alone"
      ]}
      correctAnswer={2}
      explanation="Layering pitch, wording, behaviour, and role yields the most stable speaker identification."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the strongest tactic when interruptions multiply?"
      options={[
        "Ignore them outright",
        "Use context to preserve meaning",
        "Listen only to the dominant voice",
        "Write down every utterance verbatim"
      ]}
      correctAnswer={1}
      explanation="Context keeps the thread coherent; interruptions remain normal in natural group talk."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Multi-speaker dialogues are always more difficult than two-person conversations.",
          isTrue: true,
          explanation: "Correct. Several voices and competing threads raise cognitive load consistently."
        },
        {
          text: "You should concentrate on only one speaker.",
          isTrue: false,
          explanation: "Incorrect. Tracking several voices is essential for viewpoints and conclusions."
        },
        {
          text: "Interruptions are more frequent when more speakers are involved.",
          isTrue: true,
          explanation: "Correct. More participants usually means more overlaps and interruptions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What is usually hardest to track in multi-speaker audio?"
      options={[
        "Vocabulary complexity",
        "Rapid shifts of speaker and perspective",
        "Raw speech rate",
        "Speaker accent"
      ]}
      correctAnswer={1}
      explanation="Rapid alternating perspectives taxes working memory hardest."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which technique identifies speakers best in chaotic dialogue?"
      options={[
        "Rely solely on proper names when given",
        "Blend vocal cues, roles, and substantive content",
        "Listen only to overall pitch",
        "Ignore individual differences completely"
      ]}
      correctAnswer={1}
      explanation="Vocal signals plus role plus message content beats any single cue."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Consensus and disagreement patterns matter in multi-speaker dialogue.",
          isTrue: true,
          explanation: "Correct. Watching alignment helps you infer outcomes."
        },
        {
          text: "Note-taking matters less here than for monologue listening.",
          isTrue: false,
          explanation: "Incorrect. Jotting who said what remains vital for juggling perspectives."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="When two voices overlap strongly, what should you do?"
      options={[
        "Stop engaging",
        "Anchor on the clearest speaker and scaffold with context",
        "Demand perfect verbatim capture",
        "Mentally change topic"
      ]}
      correctAnswer={1}
      explanation="The dominant line plus pragmatic context resolves most overlaps."
    />
  ];

  return (
    <TheoryLayout
      title="Multi-speaker Dialogues"
      description="Master multi-speaker listening in English. Learn tactics for juggling voices, interruptions, and complex synthesis tasks."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Experience with long conversations", "Advanced listening skills"]}
      estimatedTime="85 min"
    />
  );
};

export default MultiSpeakerDialoguesPage;
