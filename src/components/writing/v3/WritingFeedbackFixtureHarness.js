'use client';

import { useState } from 'react';
import WritingFeedbackPage from './WritingFeedbackPage';

/**
 * Internal Phase-8 review surface.
 *
 * It renders a validated Phase-6 `feedback_payload` from a JSON fixture. There is
 * no engine call, no OpenAI call, no database read and no submission: the fixtures
 * were produced offline by `scripts/generate-writing-v3-fixtures.mjs` and parsed
 * through the real contracts. Its only job is letting us look at the interface.
 */
export default function WritingFeedbackFixtureHarness({ fixtures, initialFixture }) {
  const names = Object.keys(fixtures);
  const [active, setActive] = useState(
    names.includes(initialFixture) ? initialFixture : names[0],
  );
  const fixture = fixtures[active];

  return (
    <div className="writing-v3-harness">
      <div className="writing-v3-harness__bar">
        <p className="writing-v3-harness__title">
          Writing v3 preview · internal · fixture data only
        </p>
        <div className="writing-v3-harness__tabs" role="tablist" aria-label="Fixture">
          {names.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={name === active}
              className={`writing-v3-harness__tab${
                name === active ? ' writing-v3-harness__tab--active' : ''
              }`}
              onClick={() => setActive(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="writing-v3-harness__note">{fixture.description}</p>
      </div>

      <WritingFeedbackPage
        key={active}
        candidateResponse={fixture.candidate_response}
        feedbackPayload={fixture.feedback_payload}
        taskPrompt={fixture.task_prompt}
      />
    </div>
  );
}
