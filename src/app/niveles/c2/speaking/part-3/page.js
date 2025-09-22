import NavigationButtons from '@/components/NavigationButtons';

export default function SpeakingPart3() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Speaking – Part 3: Collaborative Task</h1>
      <p>In this part, you and your partner are given a visual prompt and asked to discuss a scenario.</p>

      <h2>Example Task:</h2>
      <p>Talk to your partner about the best ways to stay healthy. Here are some ideas: diet, exercise, mental health, medical checkups, sleep, etc.</p>

      <p><strong>Goal:</strong> Have a conversation where you exchange ideas and reach a decision together.</p>

      <NavigationButtons
        back="/niveles/c2/speaking/part-2"
        next="/niveles/c2/speaking/part-4"
      />
    </div>
  );
}
