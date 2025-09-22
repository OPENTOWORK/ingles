import NavigationButtons from '@/components/NavigationButtons';

export default function SpeakingPart2() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Speaking – Part 2: Long Turn</h1>
      <p>You are given two photographs and asked to talk about them for 1 minute.</p>

      <h2>Example Task:</h2>
      <p>Compare two pictures showing different learning environments.</p>

      <NavigationButtons
        back="/niveles/c2/speaking/part-1"
        next="/niveles/c2/speaking/part-3"
      />
    </div>
  );
}
