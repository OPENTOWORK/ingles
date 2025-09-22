import NavigationButtons from '@/components/NavigationButtons';

export default function ListeningParts1to4() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Listening – Parts 1–4</h1>
      <p>This section includes short extracts, monologues, and discussions.</p>

      <h2>Example – Part 2: Sentence Completion</h2>
      <p><i>(Audio would play here)</i></p>
      <p>Complete the sentence:</p>
      <p>The speaker says he prefers to work at night because...</p>
      <p><strong>Answer:</strong> it is quieter and there are fewer distractions.</p>

      <NavigationButtons
        next="/niveles/c2/reading-and-use-of-english/parts-5-7"
        home="/niveles/c2"
      />
    </div>
  );
}
