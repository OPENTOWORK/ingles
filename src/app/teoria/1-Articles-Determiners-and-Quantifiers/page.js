'use client';
import { build1ArticlesDeterminersAndQuantifiersExercises } from './articlesDeterminersAndQuantifiersExercises';
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


const ArticlesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What are Articles, Determiners and Quantifiers?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Articles</strong>, <strong>determiners</strong> and <strong>quantifiers</strong> are small but very important words in English. 
          They help us specify what kind of information we are giving about a noun.
        </p>
        
        <QuickReference items={[
          "Articles: a, an, the",
          "Determiners: this, that, these, those, my, your, his, her, etc.",
          "Quantifiers: some, any, many, much, few, little, all, every, etc.",
          "They go BEFORE the noun",
          "They tell us how much or what kind of thing"
        ]} />
      </TheorySection>

      <TheorySection title="Articles" icon="📰">
        <Rule 
          title="The Articles: a, an, the"
          description="Articles are words that go before nouns to indicate whether we refer to something specific or general."
        />
        
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🔤 A / An (Indefinite Articles)</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.75rem' }}>
              They are used with singular countable nouns when we talk about something for the first time or in a general way.
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: '#4a5568' }}>
              <li><strong>A:</strong> Used before words that start with a consonant sound</li>
              <li><strong>An:</strong> Used before words that start with a vowel sound (a, e, i, o, u)</li>
            </ul>
            
            <Example 
              spanish="Un perro está en el jardín"
              english="A dog is in the garden"
            />
            <Example 
              spanish="Una manzana es roja"
              english="An apple is red"
            />
            
            <Tip type="warning">
              <strong>Watch out!</strong> We use &quot;an&quot; before words that start with a vowel sound, not necessarily the letter. 
              For example: &quot;an hour&quot; because &quot;hour&quot; is pronounced /aʊər/.
            </Tip>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🎯 The (Definite Article)</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.75rem' }}>
              It is used when we refer to something specific that we already know or that is unique.
            </p>
            
            <Example 
              spanish="El perro que vimos ayer está aquí"
              english="The dog we saw yesterday is here"
            />
            <Example 
              spanish="El sol brilla"
              english="The sun is shining"
            />
            
            <Tip type="info">
              <strong>Remember:</strong> &quot;The&quot; can be used with singular and plural nouns, countable and uncountable.
            </Tip>
          </div>
        </div>
      </TheorySection>

      <TheorySection title="Determiners" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1.5rem' }}>
          Determiners help us identify or specify which noun we are referring to.
        </p>

        <GrammarTable
          caption="Types of Determiners"
          headers={["Type", "Examples", "Use"]}
          rows={[
            ["Demonstrative", "this, that, these, those", "Indicate distance and number"],
            ["Possessive", "my, your, his, her, its, our, their", "Indicate possession"],
            ["Interrogative", "which, what, whose", "Used in questions"],
            ["Indefinite", "some, any, no, every", "Indefinite quantity"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este libro es mío"
            english="This book is mine"
          />
          <Example 
            spanish="¿Cuál es tu nombre?"
            english="What is your name?"
          />
        </div>
      </TheorySection>

      <TheorySection title="Quantifiers" icon="📊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1.5rem' }}>
          Quantifiers tell us how much or how many of something there is. They are very important for expressing quantity.
        </p>

        <GrammarTable
          caption="Common Quantifiers"
          headers={["Quantifier", "With Countables", "With Uncountables", "Example"]}
          rows={[
            ["some", "✅", "✅", "I have some books"],
            ["any", "✅", "✅", "Do you have any money?"],
            ["many", "✅", "❌", "Many students"],
            ["much", "❌", "✅", "Much water"],
            ["few", "✅", "❌", "Few people"],
            ["little", "❌", "✅", "Little time"],
            ["all", "✅", "✅", "All students"],
            ["every", "✅", "❌", "Every day"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> In negative questions and negative sentences, we generally use &quot;any&quot; instead of &quot;some&quot;.
        </Tip>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Hay muchos libros en la biblioteca"
            english="There are many books in the library"
          />
          <Example 
            spanish="No hay mucha agua"
            english="There isn't much water"
          />
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Do not use articles with general plural nouns"
            description="When we talk about plural nouns in a general way, we do not use an article."
            examples={[
              "Dogs are friendly (Dogs are friendly)",
              "Children like toys (Children like toys)"
            ]}
          />

          <Rule 
            title="2. Use 'the' with unique things"
            description="For things that exist only once in the world."
            examples={[
              "The moon is beautiful (The moon is beautiful)",
              "The president is speaking (The president is speaking)"
            ]}
          />

          <Rule 
            title="3. Much vs Many"
            description="Much for uncountables, many for countables."
            examples={[
              "Much time (much time)",
              "Many friends (many friends)"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> &quot;I have a money&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I have some money&quot; or &quot;I have money&quot; ✅
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;I need many advices&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I need much advice&quot; ✅
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;The happiness is important&quot; ❌<br/>
            <strong>Correct:</strong> &quot;Happiness is important&quot; ✅
          </Tip>
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Articles, Determiners and Quantifiers"
      description="Learn to use articles (a, an, the), determiners (this, that, my, your) and quantifiers (some, any, many, much) correctly in English."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build1ArticlesDeterminersAndQuantifiersExercises}
      prerequisites={["Basic understanding of nouns"]}
      estimatedTime="45 min"
    />
  );
};

export default ArticlesPage;
