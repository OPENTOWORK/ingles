'use client';
import { buildLongConversationsExercises } from './longConversationsExercises';
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


const LongConversationsPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Long Conversations?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Long conversations</strong> are extended dialogues between two or more people in listening exams. They require advanced comprehension and tracking skills.
        </p>
        
        <QuickReference items={[
          "Duration: 3–8 minutes",
          "Participants: 2–4 people",
          "Contexts: debates, interviews, discussions",
          "Goal: detailed information and relationships",
          "Level: B1–B2 (intermediate to upper-intermediate)"
        ]} />
      </TheorySection>

      <TheorySection title="Features of Long Conversations" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Long conversations differ from short dialogues in specific ways.
        </p>

        <GrammarTable
          caption="Features of Long Conversations"
          headers={["Feature", "Description", "Challenge", "Strategy"]}
          rows={[
            ["Extended length", "3–8 minutes of talk", "Staying focused", "Active note-taking"],
            ["Multiple voices", "2–4 speakers", "Telling speakers apart", "Track voices and roles"],
            ["Topic shifts", "Several topics in one talk", "Following transitions", "Spot connectors"],
            ["Overlaps", "Overlapping speech, interruptions", "Keeping context", "Use context to infer"],
            ["Complex information", "Details, opinions, facts", "Processing a lot at once", "Prioritize task-relevant detail"],
            ["Relationships", "How speakers interact", "Understanding dynamics", "Notice tone and attitude"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Context: 5-minute job interview" />
          <Example english="Participants: Interviewer and candidate" />
          <Example english="Objective: Assess skills and experience" />
        </div>

        <Rule 
          title="Challenges of Long Conversations"
          description="Main challenges include:"
          examples={[
            "Maintaining focus for the full recording",
            "Distinguishing different speakers",
            "Following topic shifts and transitions",
            "Processing several kinds of information at once"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Long conversations need active listening and solid information management.
        </Tip>
      </TheorySection>

      <TheorySection title="Types of Long Conversations" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          They vary by context and purpose.
        </p>

        <GrammarTable
          caption="Types of Long Conversations"
          headers={["Type", "Context", "Participants", "Key Information"]}
          rows={[
            ["Interview", "Work, research, media", "Interviewer and interviewee", "Experience, opinions, plans"],
            ["Debate", "Politics, society, education", "Several participants", "Arguments, rebuttals, views"],
            ["Discussion", "Work, study, personal", "2–4 people", "Problems, solutions, decisions"],
            ["Consultation", "Medical, legal, professional", "Professional and client", "Symptoms, advice, recommendations"],
            ["Meeting", "Work, committee, project", "Team", "Agenda, decisions, actions"],
            ["Social chat", "Friends, family, acquaintances", "2–4 people", "Events, plans, experiences"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Interview: 'Job interview about previous experience'" />
          <Example english="Debate: 'Discussion about climate change'" />
          <Example english="Consultation: 'Medical consultation about symptoms'" />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Identify the conversation type to anticipate information and interaction patterns.
        </Tip>
      </TheorySection>

      <TheorySection title="Strategies for Long Conversations" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Long conversations need targeted strategies for complexity and length.
        </p>

        <GrammarTable
          caption="Strategies for Long Conversations"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Speaker ID", "Tell voices/speakers apart", "Early in the recording", "Track who says what"],
            ["Topic tracking", "Notice topic changes", "Throughout", "Stay oriented"],
            ["Structured notes", "Organize by speaker/topic", "Throughout", "Retain information"],
            ["Relationship clues", "Grasp dynamics between speakers", "Throughout", "Deeper understanding"],
            ["Information management", "Prioritize relevant points", "Throughout", "Stay on what matters"],
            ["Ongoing verification", "Check understanding as you go", "At natural breaks", "Stay accurate"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Identification: 'Interviewer (deep voice) vs candidate (higher voice)'" />
          <Example english="Tracking: 'They move from experience to future plans'" />
          <Example english="Note-taking: 'Candidate: 5 years experience; interviewer: asks about leadership'" />
        </div>

        <Rule 
          title="Step-by-Step Process"
          description="Use this process for long conversations:"
          examples={[
            "1. Identify speakers and roles",
            "2. Read all questions to see what you need",
            "3. Take notes organized by speaker/topic",
            "4. Follow topic shifts and transitions",
            "5. Notice how speakers relate to each other",
            "6. Check your understanding as you listen"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not get lost in minor details—stay focused on the information you need.
        </Tip>
      </TheorySection>

      <TheorySection title="Identifying Speakers" icon="👥">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Telling speakers apart is essential in long conversations.
        </p>

        <GrammarTable
          caption="Ways to Identify Speakers"
          headers={["Cue", "Description", "Example", "How to Use It"]}
          rows={[
            ["Voice", "Pitch, tone, quality", "Deep vs higher voice", "Use vocal traits"],
            ["Role", "Function in the talk", "Interviewer vs interviewee", "Use job in the conversation"],
            ["Language", "Style, vocabulary, formality", "Formal vs informal", "Contrast registers"],
            ["Content", "What each person contributes", "Questions vs answers", "Use communicative role"],
            ["Turn-taking", "Who speaks when", "Opens vs responds", "Follow conversation pattern"],
            ["Attitude", "Emotional tone, stance", "Friendly vs formal", "Listen to how they sound"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Voice: 'Interviewer has a deep, slow voice'" />
          <Example english="Role: 'Interviewer asks questions; candidate answers'" />
          <Example english="Language: 'Interviewer uses formal language'" />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Combine several cues to identify speakers reliably.
        </Tip>
      </TheorySection>

      <TheorySection title="Topic Tracking and Transitions" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Following topic shifts and transitions keeps you oriented in long talks.
        </p>

        <GrammarTable
          caption="Types of Transitions"
          headers={["Type", "Indicators", "Example", "Function"]}
          rows={[
            ["Topic shift", "Now, let's talk about...", "Now, let's talk about your experience", "Introduce a new topic"],
            ["Return", "Going back to...", "Going back to your previous job", "Return to an earlier topic"],
            ["Elaboration", "Can you tell me more about...?", "Can you tell me more about that?", "Go deeper"],
            ["Summary", "So, to summarize...", "So, to summarize your experience", "Sum up"],
            ["Clarification", "What do you mean by...?", "What do you mean by leadership?", "Clarify meaning"],
            ["Confirmation", "So you're saying that...", "So you're saying that you led a team?", "Check understanding"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Topic change: 'Now, let's talk about your experience'" />
          <Example english="Elaboration: 'Can you tell me more about that?'" />
          <Example english="Clarification: 'What do you mean by leadership?'" />
        </div>

        <Rule 
          title="Tips for Following Transitions"
          description="To follow transitions effectively:"
          examples={[
            "Listen for transition words and phrases",
            "Notice when the topic changes",
            "Notice shifts in tone and pace",
            "Use context to see why the topic moved"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Transitions help you stay oriented in long conversations.
        </Tip>
      </TheorySection>

      <TheorySection title="Note-Taking for Long Conversations" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Structured notes help you handle complexity and multiple speakers.
        </p>

        <GrammarTable
          caption="Note-Taking System for Long Conversations"
          headers={["Element", "Description", "Example", "Benefit"]}
          rows={[
            ["Speaker tags", "Mark who speaks", "I: (Interviewer), C: (Candidate)", "Track who said what"],
            ["Main topics", "Mark topic shifts", "T1: Experience, T2: Skills", "See structure"],
            ["Key facts", "Important details", "5 years experience, led team", "Retain specifics"],
            ["Opinions and attitude", "Feelings, evaluations", "Enthusiastic, worried, confident", "Grasp dynamics"],
            ["Q and A", "Exchange of information", "Q: Experience? A: 5 years", "Follow the flow"],
            ["Transitions", "Shifts and links", "→ now discussing skills", "Stay oriented"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Identification: 'I: What's your experience? C: I have 5 years'" />
          <Example english="Topics: 'T1: Experience → T2: Skills → T3: Plans'" />
          <Example english="Key info: '5 years, led team of 10, Python, JavaScript'" />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Do not try to write everything—focus on what the questions need.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Not identifying speakers ❌<br/>
            <strong>Better:</strong> Label voices and roles early ✅<br/>
            <em>Speaker ID is crucial in long conversations</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Getting lost when topics change ❌<br/>
            <strong>Better:</strong> Track transitions and shifts ✅<br/>
            <em>Transitions keep you oriented</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Unstructured notes ❌<br/>
            <strong>Better:</strong> Organize by speaker/topic ✅<br/>
            <em>Structure matters when complexity is high</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Losing focus ❌<br/>
            <strong>Better:</strong> Stay actively engaged ✅<br/>
            <em>Sustained attention is essential</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Early identification"
            description="Identify speakers from the start."
            examples={[
              "Listen to each speaker’s first turns",
              "Notice distinctive vocal traits",
              "Observe roles in the interaction",
              "Maintain speaker tags throughout"
            ]}
          />

          <Rule 
            title="2. Active tracking"
            description="Actively track topics and transitions."
            examples={[
              "Listen for transition phrases",
              "Mark topic changes",
              "Notice tone and pace shifts",
              "Use context to infer purpose"
            ]}
          />

          <Rule 
            title="3. Structured notes"
            description="Organize notes in a clear, consistent way."
            examples={[
              "Use a consistent tagging system",
              "Group by speaker and topic",
              "Focus on relevant information",
              "Keep notes legible"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Long Conversations"
      description="Master long conversations in English. Learn to follow multiple speakers, topic shifts, and complex interaction in extended dialogues."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildLongConversationsExercises}
      prerequisites={["Experience with short dialogues and monologues", "Basic note-taking skills"]}
      estimatedTime="80 min"
    />
  );
};

export default LongConversationsPage;
