'use client';
import { buildSpeakingConnectorsExercises } from './speakingConnectorsExercises';
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


const SpeakingConnectorsPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Speaking Connectors?" icon="🗣️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Speaking connectors</strong> are words and phrases that help you link 
          ideas, organize your speech, and make your speaking more fluent and coherent in English.
        </p>
        
        <QuickReference items={[
          "Connectors to organize ideas: first, second, finally",
          "Connectors to add information: also, besides, furthermore",
          "Connectors to contrast: but, however, on the other hand",
          "Connectors to give examples: for example, such as, like",
          "Connectors to express opinion: I think, in my opinion, personally"
        ]} />
      </TheorySection>

      <TheorySection title="Connectors to Organize Ideas" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These connectors help you structure your speech and make it easy to follow.
        </p>

        <GrammarTable
          caption="Organization Connectors"
          headers={["Function", "Connectors", "Use", "Example"]}
          rows={[
            ["Beginning", "First, To begin with, Firstly", "Start a list or argument", "First, I think technology is important"],
            ["Continuation", "Second, Then, Next, Also", "Add further points", "Second, it helps communication"],
            ["End", "Finally, Lastly, To conclude", "End a list or argument", "Finally, it makes life easier"],
            ["Sequence", "First... second... third", "Ordered list", "First, we need money. Second, we need time"],
            ["Transition", "Now, So, Well", "Change topic or idea", "Now, let's talk about education"],
            ["Summary", "In summary, To sum up", "Summarize main ideas", "In summary, technology is beneficial"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Beginning: 'First, I think technology is important'"
          />
          <Example 
            english="Continuation: 'Second, it helps with communication'"
          />
          <Example 
            english="End: 'Finally, it makes life easier'"
          />
        </div>

        <Rule 
          title="Using Organization Connectors"
          description="To use them effectively:"
          examples={[
            "Use connectors appropriate for each function",
            "Keep your speech consistent",
            "Don't use too many connectors in a row",
            "Vary connectors to avoid repetition"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Organization connectors make your speech more professional and easier to follow.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors to Add Information" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These connectors let you add extra information and develop your ideas.
        </p>

        <GrammarTable
          caption="Addition Connectors"
          headers={["Connector", "Formality Level", "Use", "Example"]}
          rows={[
            ["And", "Informal", "Add simple information", "I like music and movies"],
            ["Also", "Neutral", "Add extra information", "I like music. Also, I enjoy movies"],
            ["Besides", "Neutral", "Add an extra point", "Besides music, I like movies"],
            ["Furthermore", "Formal", "Add important information", "Music is enjoyable. Furthermore, it's educational"],
            ["Moreover", "Formal", "Add a significant point", "It's fun. Moreover, it's good for health"],
            ["In addition", "Formal", "Add complementary information", "It's fun. In addition, it's educational"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Neutral: 'I like music. Also, I enjoy movies'"
          />
          <Example 
            english="Formal: 'It's fun. Furthermore, it's educational'"
          />
          <Example 
            english="Informal: 'I like music and movies'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Vary connectors according to the formality of your speech.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors to Contrast" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These connectors let you show differences, oppositions, or contrasts between ideas.
        </p>

        <GrammarTable
          caption="Contrast Connectors"
          headers={["Connector", "Formality Level", "Use", "Example"]}
          rows={[
            ["But", "Informal", "Simple contrast", "I like music, but I don't like jazz"],
            ["However", "Formal", "Strong contrast", "I like music. However, I don't like jazz"],
            ["On the other hand", "Formal", "Show an alternative", "Music is fun. On the other hand, it can be expensive"],
            ["Although", "Neutral", "Concessive contrast", "Although I like music, I don't play any instruments"],
            ["Despite", "Formal", "Contrast despite obstacle", "Despite the cost, I still buy music"],
            ["Yet", "Neutral", "Unexpected contrast", "It's expensive, yet I still buy it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Informal: 'I like music, but I don't like jazz'"
          />
          <Example 
            english="Formal: 'I like music. However, I don't like jazz'"
          />
          <Example 
            english="Neutral: 'Although I like music, I don't play instruments'"
          />
        </div>

        <Rule 
          title="Using Contrast Connectors"
          description="To contrast effectively:"
          examples={[
            "Use connectors appropriate for the level of formality",
            "Make sure the contrast is clear",
            "Don't use too many contrast connectors in a row",
            "Vary connectors to avoid repetition"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Don't use 'but' and 'however' together — they are redundant.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors to Give Examples" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These connectors help you illustrate your ideas with specific examples.
        </p>

        <GrammarTable
          caption="Example Connectors"
          headers={["Connector", "Use", "Position", "Example"]}
          rows={[
            ["For example", "Give a specific example", "Start of sentence", "I like many genres. For example, I enjoy rock"],
            ["For instance", "Give a specific example", "Start of sentence", "Music is diverse. For instance, there's jazz"],
            ["Such as", "List examples", "Middle of sentence", "I like genres such as rock and jazz"],
            ["Like", "Give an informal example", "Middle of sentence", "I like genres like rock and jazz"],
            ["Namely", "Specify exactly", "Start of sentence", "I like two genres, namely rock and jazz"],
            ["Including", "Include in a list", "Middle of sentence", "I like many genres, including rock and jazz"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Specific: 'I like many genres. For example, I enjoy rock'"
          />
          <Example 
            english="List: 'I like genres such as rock and jazz'"
          />
          <Example 
            english="Specific: 'I like two genres, namely rock and jazz'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Examples make your speech more convincing and easier to understand.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors to Express Opinion" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These connectors let you express your opinion clearly and appropriately.
        </p>

        <GrammarTable
          caption="Opinion Connectors"
          headers={["Connector", "Certainty Level", "Use", "Example"]}
          rows={[
            ["I think", "Moderate", "Personal opinion", "I think music is important"],
            ["In my opinion", "Moderate", "Personal opinion formal", "In my opinion, music is important"],
            ["Personally", "Personal", "Very personal opinion", "Personally, I love music"],
            ["I believe", "Strong", "Strong belief", "I believe music is essential"],
            ["I feel", "Emotional", "Personal feeling", "I feel music connects people"],
            ["From my perspective", "Formal", "Personal point of view", "From my perspective, music is valuable"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Moderate: 'I think music is important'"
          />
          <Example 
            english="Strong: 'I believe music is essential'"
          />
          <Example 
            english="Emotional: 'I feel music connects people'"
          />
        </div>

        <Rule 
          title="Using Opinion Connectors"
          description="To express opinions effectively:"
          examples={[
            "Choose connectors appropriate for your level of certainty",
            "Vary connectors to avoid repetition",
            "Use formal connectors in professional contexts",
            "Be consistent with the level of formality"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Opinion connectors make your speech more personal and persuasive.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors for Cause and Result" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These connectors let you explain cause-and-effect relationships.
        </p>

        <GrammarTable
          caption="Cause and Result Connectors"
          headers={["Type", "Connectors", "Use", "Example"]}
          rows={[
            ["Cause", "Because, Since, As", "Explain reason", "I like music because it's relaxing"],
            ["Result", "So, Therefore, Thus", "Show consequence", "Music is relaxing, so I listen daily"],
            ["Cause Formal", "Due to, Owing to", "Explain cause formally", "Due to its benefits, I listen to music"],
            ["Result Formal", "Consequently, As a result", "Show result formally", "It's relaxing. Consequently, I listen daily"],
            ["Cause Informal", "Because of", "Explain cause informally", "Because of its benefits, I listen to music"],
            ["Result Informal", "So, That's why", "Show result informally", "It's relaxing, so I listen daily"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Cause: 'I like music because it's relaxing'"
          />
          <Example 
            english="Result: 'It's relaxing, so I listen daily'"
          />
          <Example 
            english="Formal cause: 'Due to its benefits, I listen to music'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Cause-and-result connectors make your speech more logical and persuasive.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Using too many connectors in a row ❌<br/>
            <strong>Correct:</strong> Using connectors in a balanced way ✅<br/>
            <em>Too many connectors make speech sound artificial</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mixing levels of formality ❌<br/>
            <strong>Correct:</strong> Keeping register consistent ✅<br/>
            <em>Consistency improves clarity</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using the wrong connector for the function ❌<br/>
            <strong>Correct:</strong> Choosing appropriate connectors ✅<br/>
            <em>Each connector has a specific function</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Not varying connectors ❌<br/>
            <strong>Correct:</strong> Using different connectors ✅<br/>
            <em>Variety makes speech more interesting</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Specific function"
            description="Each connector has a specific function."
            examples={[
              "Organization connectors: structure ideas",
              "Addition connectors: add information",
              "Contrast connectors: show differences",
              "Example connectors: illustrate ideas"
            ]}
          />

          <Rule 
            title="2. Level of formality"
            description="Choose connectors appropriate for the context."
            examples={[
              "Informal: and, but, so",
              "Neutral: also, however, therefore",
              "Formal: furthermore, nevertheless, consequently",
              "Keep consistency throughout your speech"
            ]}
          />

          <Rule 
            title="3. Variety and balance"
            description="Use different connectors in a balanced way."
            examples={[
              "Don't use the same connector repeatedly",
              "Vary connectors according to function",
              "Don't use too many connectors in a row",
              "Balance connectors with natural pauses"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Speaking Connectors"
      description="Master speaking connectors in English: organization, addition, contrast, examples, and opinion. Learn to make your speech more fluent and coherent."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildSpeakingConnectorsExercises}
      prerequisites={["Basic speaking skills", "Understanding of sentence structure"]}
      estimatedTime="70 min"
    />
  );
};

export default SpeakingConnectorsPage;





















