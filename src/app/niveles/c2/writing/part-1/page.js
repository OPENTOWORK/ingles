import NavigationButtons from '@/components/NavigationButtons';

export default function WritingPart1() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Writing – Part 1: Essay (Compulsory)</h1>
      <p>Discuss two points and provide your opinion.</p>

      <h2>Example:</h2>
      <ul>
        <li>Practical skills</li>
        <li>Academic knowledge</li>
        <li><i>(your idea)</i></li>
      </ul>

      <NavigationButtons next="/niveles/c2/writing/part-2" />
    </div>
  );
}
