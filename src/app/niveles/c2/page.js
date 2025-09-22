// src/app/niveles/c2/page.js
import Link from 'next/link';

export default function C2Page() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>C2 Exam: Proficiency (CPE)</h1>
      <p>This is the highest-level Cambridge English exam, proving mastery of the language.</p>

      <h2>1. Reading and Use of English</h2>
      <ul>
        <li>
          <Link href="/niveles/c2/reading-and-use-of-english/parts-1-4">
            Parts 1–4: Use of English
          </Link>
        </li>
        <li>
          <Link href="/niveles/c2/reading-and-use-of-english/parts-5-7">
            Parts 5–7: Reading comprehension
          </Link>
        </li>
      </ul>

      <h2>2. Writing</h2>
      <ul>
        <li>
          <Link href="/niveles/c2/writing/part-1">
            Part 1: Essay (compulsory)
          </Link>
        </li>
        <li>
          <Link href="/niveles/c2/writing/part-2">
            Part 2: Report, review, letter, etc.
          </Link>
        </li>
      </ul>

      <h2>3. Listening</h2>
      <ul>
        <li>
          <Link href="/niveles/c2/listening-parts-1-4">
            Parts 1–4: Short extracts, monologues, discussions
          </Link>
        </li>
      </ul>

      <h2>4. Speaking</h2>
      <ul>
        <li>
          <Link href="/niveles/c2/speaking/part-1">
            Part 1: Interview
          </Link>
        </li>
        <li>
          <Link href="/niveles/c2/speaking/part-2">
            Part 2: Long turn
          </Link>
        </li>
        <li>
          <Link href="/niveles/c2/speaking/part-3">
            Part 3: Collaborative task
          </Link>
        </li>
        <li>
          <Link href="/niveles/c2/speaking/part-4">
            Part 4: Discussion
          </Link>
        </li>
      </ul>
    </div>
  );
}
