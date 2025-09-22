import Link from 'next/link';

const buttonStyle = {
  backgroundColor: '#d1fae5',
  color: '#047857',
  padding: '0.75rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  textDecoration: 'none',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
};

export default function C1Page() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>C1 Exam: Advanced (CAE)</h1>

      <p style={{ maxWidth: '700px', margin: '1rem auto', textAlign: 'center', fontSize: '1.1rem' }}>
        This is an advanced English language qualification for professional and academic purposes.
      </p>

      <h2>1. Reading and Use of English</h2>
      <ul>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-1">Part 1: Multiple-choice cloze</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-2">Part 2: Open cloze</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-3">Part 3: Word formation</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-4">Part 4: Key word transformations</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-5">Part 5: Multiple choice (reading)</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-6">Part 6: Cross-text multiple matching</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-7">Part 7: Gapped text</Link></li>
        <li><Link href="/niveles/c1/reading-and-use-of-english/part-8">Part 8: Multiple matching</Link></li>
      </ul>

      <h2>2. Writing</h2>
      <ul>
        <li><Link href="/niveles/c1/writing/part-1">Part 1: Compulsory essay</Link></li>
        <li><Link href="/niveles/c1/writing/part-2">Part 2: Choose from article, review, report, letter, etc.</Link></li>
      </ul>

      <h2>3. Listening</h2>
      <ul>
        <li><Link href="/niveles/c1/listening/part-1">Part 1: Short extracts – multiple choice</Link></li>
        <li><Link href="/niveles/c1/listening/part-2">Part 2: Monologue – sentence completion</Link></li>
        <li><Link href="/niveles/c1/listening/part-3">Part 3: Long conversation – multiple choice</Link></li>
        <li><Link href="/niveles/c1/listening/part-4">Part 4: Multiple speakers – matching task</Link></li>
      </ul>

      <h2>4. Speaking</h2>
      <ul>
        <li><Link href="/niveles/c1/speaking/part-1">Part 1: General conversation</Link></li>
        <li><Link href="/niveles/c1/speaking/part-2">Part 2: Long turn (describe photos)</Link></li>
        <li><Link href="/niveles/c1/speaking/part-3">Part 3: Collaborative task</Link></li>
        <li><Link href="/niveles/c1/speaking/part-4">Part 4: Discussion</Link></li>
      </ul>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "3rem" }}>
        <Link href="/niveles/c1/exam-1" className="card special" style={buttonStyle}>📝 Full Exam</Link>
        <Link href="/niveles/c1/exam-useofenglish" className="card special" style={buttonStyle}>📘 Use of English</Link>
        <Link href="/niveles/c1/exam-reading" className="card special" style={buttonStyle}>📖 Reading</Link>
        <Link href="/niveles/c1/exam-writing" className="card special" style={buttonStyle}>✍️ Writing</Link>
        <Link href="/niveles/c1/exam-listening" className="card special" style={buttonStyle}>🎧 Listening</Link>
        <Link href="/niveles/c1/exam-speaking" className="card special" style={buttonStyle}>🗣️ Speaking</Link>
      </div>

      <p style={{ marginTop: '2rem', fontStyle: 'italic', textAlign: 'center' }}>
        Interactive examples and exam simulations coming soon.
      </p>

      <footer style={{ marginTop: "3rem", fontSize: "0.9rem", color: "#555", textAlign: "center" }}>
        © 2025 English Practice
      </footer>
    </div>
  );
}
