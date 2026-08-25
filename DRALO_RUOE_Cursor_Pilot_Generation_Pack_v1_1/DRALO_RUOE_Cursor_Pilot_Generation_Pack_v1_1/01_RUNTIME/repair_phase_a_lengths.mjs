/**
 * Local mechanical length repairs for PHASE A failed outputs.
 * Does not change briefs, style cards or architecture.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function countWords(text) {
  return String(text || '')
    .replace(/\([0-9]+\)/g, ' ')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function save(rel, mutator) {
  const full = path.join(PACK, rel);
  const doc = JSON.parse(fs.readFileSync(full, 'utf8'));
  mutator(doc);
  const t = doc.exercise.passage_with_gaps || doc.exercise.article;
  const wc = countWords(t);
  doc.repair_pass = { at: new Date().toISOString(), kind: 'manual_length_edit_local' };
  doc.attempt = (doc.attempt || 0) + 1;
  fs.writeFileSync(full, JSON.stringify(doc, null, 2));
  console.log(rel, 'words', wc);
}

save('05_OUTPUTS/EXAM-01/CB-PILOT-001_Part1.json', (doc) => {
  doc.exercise.passage_with_gaps = `Imagine a bird trying to reach food placed just out of its (0) ____. It may stretch its neck first, then look for a stick or another object when that fails. This behaviour is (1) ____ because the bird is not merely following one fixed instinctive pattern; it is adapting to an unfamiliar situation.

When animals meet a problem, they must decide whether to repeat a familiar action or (2) ____ their behaviour. A monkey, for example, may try several ways to open a container before it (3) ____ succeeds. That trial-and-error process (4) ____ that the animal is learning from what happens around it.

Memory, attention to surroundings and trial-and-error can all be important (5) ____ in solving new problems. Animals that can (6) ____ these abilities often cope better with challenges. Observers look for flexible problem-solving, such as an animal (7) ____ a different approach after an early failure. This capacity suggests animals can (8) ____ their actions according to the situation rather than rely on automatic responses alone.`;
});

save('05_OUTPUTS/EXAM-02/CB-PILOT-007_Part1.json', (doc) => {
  doc.exercise.passage_with_gaps = `When the road ends, travellers transfer to a small ferry or continue on foot. This coastal destination (0) ___ visitors to slow down, because the local ferry runs only a few times a day. Limited transport (1) ___ them to plan arrival carefully. Once there, the quieter pace helps visitors (2) ___ local routines, such as early deliveries of fresh produce to small shops.

Many people feel (3) ___ at first by having to carry bags further than expected. Yet they soon notice that this slower pace (4) ___ the place from feeling like any other busy tourist spot. Without constant traffic, the sea and the (5) ___ of local life become clearer. One visitor said the journey itself changed their view of the destination and made them (6) ___ its unusual character. Getting there had not simply delivered them to a location; it had (7) ___ how they experienced it. In that sense, difficult access (8) ___ the place’s distinctive atmosphere.`;
});

save('05_OUTPUTS/EXAM-02/CB-PILOT-009_Part3.json', (doc) => {
  doc.exercise.passage_with_gaps = `It was a small community event, and I was asked to play a simple (0) ____ for a local choir. I had been learning the guitar for a few months, but my (17) ____ was still shaky. I had started out of personal interest, expecting to see (18) ____ quickly. Instead, the (19) ____ practice sessions were becoming tedious, and I nearly gave up.

The request came as a surprise. At first I hesitated, worried about mistakes in front of others. Yet the idea of helping at the event was (20) ____, so I accepted. During the performance I made a small error, but it proved (21) ____. The music still supported the choir and the audience seemed to enjoy it.

Afterwards my perspective changed. I realised the (22) ____ was less about perfection than about sharing music. Practice then felt more (23) ____, because I had a clearer goal: to play music that brought people together rather than only to become “good”. That shift made the whole journey more (24) ____.`;
});

save('05_OUTPUTS/EXAM-01/CB-PILOT-005_Part6.json', (doc) => {
  let t = doc.exercise.passage_with_gaps;
  t = t.replace(
    'I quickly realised that “keeping everything” was not an option.',
    'I quickly realised that “keeping everything” was not an option. I began listing what each box was supposed to protect me from: a future repair, a sudden need, or a version of myself I no longer lived. Seeing those fears written down made the clutter feel less mysterious and more like postponed decisions.',
  );
  t = t.replace(
    'It seemed like a perfect opportunity to see if some of these items could find a new home.',
    'It seemed like a perfect opportunity to see if some of these items could find a new home. Neighbours swapped tools, mended chairs and talked about why certain objects were hard to release. Listening to them helped me notice the difference between usefulness and emotional attachment.',
  );
  t = t.replace(
    'Back at home, I started to develop a rule for what deserved space.',
    'Back at home, I started to develop a rule for what deserved space. I measured shelves, imagined daily routes through the rooms and asked whether each kept object would earn its place in an ordinary week rather than in an imaginary emergency.',
  );
  if (countWords(t) < 500) {
    t +=
      ' Over the following weeks I returned to the same questions whenever a new delivery or gift arrived. The smaller home had not simply forced me to discard objects; it had taught me to choose more deliberately, and that habit continued long after the final empty box left the hallway.';
  }
  doc.exercise.passage_with_gaps = t;
});

save('05_OUTPUTS/EXAM-02/CB-PILOT-011_Part6.json', (doc) => {
  let t = doc.exercise.passage_with_gaps;
  t = t.replace(
    'Yet, even after all that effort, I still felt tired most mornings.',
    'Yet, even after all that effort, I still felt tired most mornings. I would wake already rehearsing conversations and unfinished messages, as if the night had never fully interrupted the working day.',
  );
  t = t.replace(
    'I realised that I was still mentally checking unfinished work, which kept my mind active long after I had left the office.',
    'I realised that I was still mentally checking unfinished work, which kept my mind active long after I had left the office. The problem was not the absence of calming activities; it was the absence of a firm boundary.',
  );
  t = t.replace(
    'This small change made a significant difference, allowing me to mentally close the door on work each day.',
    'This small change made a significant difference, allowing me to mentally close the door on work each day. Within a fortnight I noticed that evenings lasted longer in feeling, even when the clock said otherwise.',
  );
  if (countWords(t) < 500) {
    t +=
      ' Looking back, the turning point was surprisingly practical. Once work had a clear finishing gesture, the rest of the evening no longer had to fight for attention, and rest stopped feeling like another task I was failing to complete.';
  }
  doc.exercise.passage_with_gaps = t;
});
