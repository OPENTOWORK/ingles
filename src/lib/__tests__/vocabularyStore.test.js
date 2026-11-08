import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createVocabularyEntry } from '../vocabularyStore.js';

describe('vocabulary entries', () => {
  it('keeps word, meaning, translation and pronunciation', () => {
    const entry = createVocabularyEntry({
      word: '  example ',
      meaning: 'a model',
      translation: 'ejemplo',
      pronunciation: '/ɪɡˈzɑːmpəl/',
    });
    assert.equal(entry.word, 'example');
    assert.equal(entry.meaning, 'a model');
    assert.equal(entry.translation, 'ejemplo');
    assert.equal(entry.pronunciation, '/ɪɡˈzɑːmpəl/');
    assert.ok(entry.id);
  });

  it('rejects an empty word', () => {
    assert.equal(createVocabularyEntry({ word: '   ', meaning: 'x' }), null);
  });
});
