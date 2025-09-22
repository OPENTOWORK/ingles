'use client';
import { useState } from 'react';
import Link from 'next/link';

const questions = [
  {
    number: 31,
    question: "In the first paragraph, what is Caitlin’s main point about the island?",
    options: {
      A: "It can be dangerous to try to cross from the mainland.",
      B: "It is much smaller than it looks from the mainland.",
      C: "It is only completely cut off at certain times.",
      D: "It can be a difficult place for people to live in."
    },
    answer: "C"
  },
  {
    number: 32,
    question: "What does Caitlin suggest about her father?",
    options: {
      A: "His writing prevents him from doing things he wants to with his family.",
      B: "His initial reaction to his son’s request is different from usual.",
      C: "His true feelings are easily hidden from his daughter.",
      D: "His son’s arrival is one event he will take time off for."
    },
    answer: "B"
  },
  {
    number: 33,
    question: "Caitlin emphasises her feelings of discomfort because she",
    options: {
      A: "is embarrassed that she doesn’t understand what her brother is talking about.",
      B: "feels confused about why she can’t relate to her brother any more.",
      C: "is upset by the unexpected change in her brother’s behaviour.",
      D: "feels foolish that her brother’s attention is so important to her."
    },
    answer: "C"
  },
  {
    number: 34,
    question: "In the fourth paragraph, what is Caitlin’s purpose in describing the island?",
    options: {
      A: "To express her positive feelings about it",
      B: "To explain how the road was built",
      C: "To illustrate what kind of weather was usual",
      D: "To describe her journey home"
    },
    answer: "D"
  },
  {
    number: 35,
    question: "In ‘because of that’ in line 31, ‘that’ refers to the fact that",
    options: {
      A: "locals think it is odd to walk anywhere.",
      B: "it is easier for people to take the bus than walk.",
      C: "people have everything they need on the island.",
      D: "there is nowhere in particular to walk to from the island."
    },
    answer: "B"
  },
  {
    number: 36,
    question: "What do we learn about Caitlin’s reactions to the boy?",
    options: {
      A: "She felt his air of confidence contrasted with his physical appearance.",
      B: "She was able to come up with a reason for him being there.",
      C: "She realised her first impression of him was inaccurate.",
      D: "She thought she had seen him somewhere before."
    },
    answer: "A"
  }
];

export default function Part5Page() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (qNumber, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qNumber]: option });
    setShowFeedback(true);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Part 5: Multiple Choice Reading</h1>

      <section style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "6px", marginBottom: "2rem", lineHeight: 1.6 }}>
        <h2>Reading Text</h2>
        <p>We live on the island of Hale. It’s about four kilometres long and two kilometres wide at its broadest point, and it’s joined to the mainland by a causeway called the Stand - a narrow road built across the mouth of the river which separates us from the rest of the country. Most of the time you wouldn’t know we’re on an island because the river mouth between us and the mainland is just a vast stretch of tall grasses and brown mud. But when there’s a high tide and the water rises a half a metre or so above the road and nothing can pass until the tide goes out again a few hours later, then you know it’s an island.</p>

        <p>We were on our way back from the mainland. My older brother, Dominic, had just finished his first year at university in a town 150 km away. Dominic’s train was due in at five and he’d asked for a lift back from the station. Now, Dad normally hates being disturbed when he’s writing (which is just about all the time), and he also hates having to go anywhere, but despite the typical sighs and moans – why can’t he get a taxi? what’s wrong with the bus? – I could tell by the sparkle in his eyes that he was really looking forward to seeing Dominic.</p>

        <p>So, anyway, Dad and I had driven to the mainland and picked up Dominic from the station. He had been talking non-stop from the moment he’d slung his rucksack in the boot and got in the car. University this, university that, writers, books, parties, people, money, gigs…. And when I say talking, I don’t mean talking as in having a conversation, I mean talking as in jabbering like a mad thing. I didn’t like it … the way he spoke and waved his hands around as if he was some kind of intellectual or something. It was embarrassing. It made me feel uncomfortable – that kind of discomfort you feel when someone you like, someone close to you, suddenly starts acting like a complete idiot. And I didn’t like the way he was ignoring me, either. For all the attention I was getting I might as well not have been there. I felt a stranger in my own car.</p>

        <p>As we approached the island on that Friday afternoon, the tide was low and the Stand welcomed us home, stretched out before us, clear and dry, beautifully hazy in the heat – a raised strip of grey concrete bound by white railings and a low footpath on either side, with rough cobbled banks leading down to the water. Beyond the railings, the water was glinting with that wonderful silver light we sometimes get here in the late afternoon which lazes through to the early evening.</p>

        <p>We were about halfway across when I saw the boy. My first thought was how odd it was to see someone walking on the Stand. You don’t often see people walking around here. Between Hale and Moulton (the nearest town about thirty kilometres away on the mainland), there’s nothing but small cottages, farmland, heathland and a couple of hills. So islanders don’t walk because of that. If they’re going to Moulton they tend to take the bus. So the only pedestrians you’re likely to see around here are walkers or bird-watchers. But even from a distance I could tell that the figure ahead didn’t fit into either of these categories. I wasn’t sure how I knew, I just did.</p>

        <p>As we drew closer, he became clearer. He was actually a young man rather than a boy. Although he was on the small side, he wasn’t as slight as I’d first thought. He wasn’t exactly muscular, but he wasn’t weedy-looking either. It’s hard to explain. There was just something sleek about him, a graceful strength that showed in his balance, the way he held himself, the way he walked…</p>
      </section>

      <section>
        {questions.map((q) => (
          <div key={q.number} style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
            <p><strong>{q.number}.</strong> {q.question}</p>
            {Object.entries(q.options).map(([key, text]) => (
              <div key={key} style={{ marginBottom: "0.4rem" }}>
                <button
                  onClick={() => handleSelect(q.number, key)}
                  style={{
                    backgroundColor: selectedAnswers[q.number] === key
                      ? (key === q.answer ? "#d4edda" : "#f8d7da")
                      : "#e0e0e0",
                    color: "#000",
                    padding: "0.5rem 1rem",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  {key}. {text}
                </button>
              </div>
            ))}
            {showFeedback && selectedAnswers[q.number] && (
              <p style={{ marginTop: "0.5rem", color: selectedAnswers[q.number] === q.answer ? "green" : "red" }}>
                {selectedAnswers[q.number] === q.answer ? "✔ Correct!" : `✘ Incorrect. Correct answer: ${q.answer}`}
              </p>
            )}
          </div>
        ))}
      </section>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/b2/exam-1/part-4">⬅ Back to Part 4</Link>
        <Link href="/niveles/b2/exam-1/part-6">Next ➡️</Link>
      </div>
    </main>
  );
}
