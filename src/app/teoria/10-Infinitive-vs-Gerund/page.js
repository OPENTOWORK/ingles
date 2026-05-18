'use client';
import { build10InfinitiveVsGerundExercises } from './infinitiveVsGerundExercises';
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


const InfinitiveVsGerundPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Infinitive and Gerund?" icon="🔤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The <strong>infinitive</strong> and the <strong>gerund</strong> are verb forms that function as nouns. 
          Knowing when to use each one is crucial for speaking English correctly, since some verbs require the infinitive, others the gerund, and some accept both.
        </p>
        
        <QuickReference items={[
          "Infinitive: to + base verb (to go, to eat, to study)",
          "Gerund: verb + ing (going, eating, studying)",
          "Some verbs require only the infinitive",
          "Some verbs require only the gerund",
          "Some verbs accept both with different meanings"
        ]} />
      </TheorySection>

      <TheorySection title="Infinitive" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The infinitive is the base form of the verb preceded by &quot;to&quot;. It is used in various grammatical structures.
        </p>

        <GrammarTable
          caption="Uses of the Infinitive"
          headers={["Use", "Structure", "Example", "Meaning"]}
          rows={[
            ["After specific verbs", "verb + to + infinitive", "I want to go", "I want to go"],
            ["After adjectives", "adjective + to + infinitive", "It's easy to learn", "It's easy to learn"],
            ["To express purpose", "to + infinitive", "I study to pass", "I study to pass"],
            ["After some nouns", "noun + to + infinitive", "time to go", "time to go"],
            ["With 'too' and 'enough'", "too/enough + to + infinitive", "too tired to work", "too tired to work"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Quiero aprender inglés"
            english="I want to learn English"
          />
          <Example 
            spanish="Es importante estudiar"
            english="It's important to study"
          />
          <Example 
            spanish="Voy a la tienda para comprar leche"
            english="I go to the store to buy milk"
          />
        </div>

        <Rule 
          title="Verbs That Require the Infinitive"
          description="These verbs are followed by the infinitive:"
          examples={[
            "Want, need, hope, decide, plan, promise",
            "Agree, refuse, offer, attempt, fail",
            "Learn, teach, help (optional), choose"
          ]}
        />

        <Tip type="info">
          <strong>Remember:</strong> After these verbs we always use &quot;to + infinitive&quot;, never the gerund.
        </Tip>
      </TheorySection>

      <TheorySection title="Gerund" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The gerund is the &quot;-ing&quot; form of the verb that functions as a noun. It is used in various structures.
        </p>

        <GrammarTable
          caption="Uses of the Gerund"
          headers={["Use", "Structure", "Example", "Meaning"]}
          rows={[
            ["As subject", "gerund + verb", "Swimming is fun", "Swimming is fun"],
            ["After specific verbs", "verb + gerund", "I enjoy reading", "I enjoy reading"],
            ["After prepositions", "preposition + gerund", "good at singing", "good at singing"],
            ["After some expressions", "expression + gerund", "It's worth trying", "It's worth trying"],
            ["As direct object", "verb + gerund", "I finished working", "I finished working"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Nadar es bueno para la salud"
            english="Swimming is good for health"
          />
          <Example 
            spanish="Disfruto cocinando"
            english="I enjoy cooking"
          />
          <Example 
            spanish="Soy bueno cantando"
            english="I am good at singing"
          />
        </div>

        <Rule 
          title="Verbs That Require the Gerund"
          description="These verbs are followed by the gerund:"
          examples={[
            "Enjoy, like, love, hate, prefer",
            "Avoid, consider, suggest, recommend",
            "Finish, stop, quit, give up, keep on",
            "Mind, imagine, practice, admit, deny"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> After these verbs we use the gerund, not the infinitive.
        </Tip>
      </TheorySection>

      <TheorySection title="Verbs That Accept Both" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some verbs can be followed by both the infinitive and the gerund, but with different meanings.
        </p>

        <GrammarTable
          caption="Verbs with Both Uses"
          headers={["Verb", "With Infinitive", "With Gerund", "Difference"]}
          rows={[
            ["Remember", "remember to do (remember to do)", "remember doing (remember having done)", "Timing of the action"],
            ["Forget", "forget to do (forget to do)", "forget doing (forget having done)", "Timing of the action"],
            ["Try", "try to do (try to do)", "try doing (try doing)", "Purpose vs experiment"],
            ["Stop", "stop to do (stop in order to do)", "stop doing (stop doing)", "Purpose vs cease"],
            ["Like", "like to do (prefer to do)", "like doing (enjoy doing)", "Preference vs enjoyment"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Recuerda cerrar la puerta"
            english="Remember to close the door"
          />
          <Example 
            spanish="Recuerdo haber cerrado la puerta"
            english="I remember closing the door"
          />
          <Example 
            spanish="Intento aprender inglés"
            english="I try to learn English"
          />
          <Example 
            spanish="Pruebo aprender inglés"
            english="I try learning English"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> The main difference is timing: infinitive = future, gerund = past.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Expressions" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Many expressions require the infinitive or gerund specifically.
        </p>

        <GrammarTable
          caption="Expressions with Infinitive and Gerund"
          headers={["Expression", "Form", "Example", "Meaning"]}
          rows={[
            ["It's + adjective", "to + infinitive", "It's important to study", "It's important to study"],
            ["Too + adjective", "to + infinitive", "too tired to work", "too tired to work"],
            ["Adjective + enough", "to + infinitive", "old enough to drive", "old enough to drive"],
            ["Be good/bad at", "gerund", "good at swimming", "good at swimming"],
            ["Be interested in", "gerund", "interested in learning", "interested in learning"],
            ["Look forward to", "gerund", "look forward to seeing", "look forward to seeing"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Es fácil aprender inglés"
            english="It's easy to learn English"
          />
          <Example 
            spanish="Soy bueno nadando"
            english="I am good at swimming"
          />
          <Example 
            spanish="Tengo ganas de verte"
            english="I look forward to seeing you"
          />
        </div>

        <Tip type="info">
          <strong>Note:</strong> &quot;Look forward to&quot; is followed by a gerund, even though &quot;to&quot; looks like an infinitive marker.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> &quot;I enjoy to read&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I enjoy reading&quot; ✅<br/>
            <em>&apos;Enjoy&apos; is followed by a gerund, not an infinitive</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;I want going home&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I want to go home&quot; ✅<br/>
            <em>&apos;Want&apos; is followed by an infinitive, not a gerund</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;I&apos;m looking forward to see you&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I&apos;m looking forward to seeing you&quot; ✅<br/>
            <em>&apos;Look forward to&apos; is followed by a gerund</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;I stopped to smoke&quot; (to quit smoking) ❌<br/>
            <strong>Correct:</strong> &quot;I stopped smoking&quot; ✅<br/>
            <em>To express &apos;stop doing something&apos; we use the gerund</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Preference verbs"
            description="Like, love, hate, prefer can use both, but with different nuances."
            examples={[
              "I like to swim (general preference)",
              "I like swimming (I enjoy the activity)"
            ]}
          />

          <Rule 
            title="2. After prepositions"
            description="We always use the gerund after prepositions."
            examples={[
              "Good at swimming",
              "Interested in learning",
              "Afraid of flying"
            ]}
          />

          <Rule 
            title="3. As subject"
            description="Both infinitive and gerund can be subjects, but the gerund is more common."
            examples={[
              "Swimming is fun (more common)",
              "To swim is fun (less common)"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Infinitive vs Gerund"
      description="Master the use of the infinitive and gerund in English. Learn which verbs require each form and when to use each one to express yourself correctly."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build10InfinitiveVsGerundExercises}
      prerequisites={["Present Tenses", "Basic vocabulary", "Understanding of verb forms"]}
      estimatedTime="65 min"
    />
  );
};

export default InfinitiveVsGerundPage;
