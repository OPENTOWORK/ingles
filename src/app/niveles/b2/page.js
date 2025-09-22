import Link from "next/link";

export default function B2Page() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>B2 – First (FCE)</h1>

      <p style={{ maxWidth: "700px", margin: "1rem auto", textAlign: "center", fontSize: "1.1rem" }}>
        This exam assesses English language skills at an upper-intermediate level. It is divided into four main papers, each with specific parts. Practice each section or try a full interactive mock exam.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Exam Structure</h2>

        <h3>1. Reading and Use of English</h3>
        <ul>
          <li>Part 1: Multiple-choice cloze</li>
          <li>Part 2: Open cloze</li>
          <li>Part 3: Word formation</li>
          <li>Part 4: Key word transformations</li>
          <li>Part 5: Multiple-choice reading</li>
          <li>Part 6: Gapped text</li>
          <li>Part 7: Multiple matching</li>
        </ul>

        <h3>2. Writing</h3>
        <ul>
          <li>Part 1: Essay (mandatory)</li>
          <li>Part 2: Article, letter, report or review (optional)</li>
        </ul>

        <h3>3. Listening</h3>
        <ul>
          <li>Part 1: Several short extracts</li>
          <li>Part 2: Monologue with sentence completion</li>
          <li>Part 3: Conversation with multiple-choice questions</li>
          <li>Part 4: Several extracts with multiple choice</li>
        </ul>

        <h3>4. Speaking</h3>
        <ul>
          <li>Part 1: Personal questions</li>
          <li>Part 2: Photo description</li>
          <li>Part 3: Collaborative task</li>
          <li>Part 4: General discussion</li>
        </ul>
      </section>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
        <Link href="/niveles/b2/exam-1" className="card special">
          📝 Full Exam: Exam 1
        </Link>
      </div>

      <p style={{ marginTop: "2rem", fontStyle: "italic", textAlign: "center" }}>
        Coming soon: interactive exercises for every part.
      </p>

      <footer style={{ marginTop: "3rem", fontSize: "0.9rem", color: "#555", textAlign: "center" }}>
        © 2025 English Practice
      </footer>
    </main>
  );
}
