import NavigationButtons from '@/components/NavigationButtons';

export default function SpeakingPart1() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Speaking – Part 1: Interview</h1>
      <p>This part includes personal questions about your life, habits, and interests.</p>

      <h2>Example Questions:</h2>
      <ul>
        <li>Where are you from?</li>
        <li>What do you like about your hometown?</li>
        <li>Do you prefer studying alone or with others?</li>
      </ul>

      <NavigationButtons next="/niveles/c2/speaking/part-2" />
    </div>
  );
}
