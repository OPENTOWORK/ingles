import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  TUTORIAL_AUTO_OPEN_SINCE,
  TUTORIAL_SEEN_METADATA_KEY,
  isTutorialAutoOpenPath,
  rememberTutorialSeenOnDevice,
  shouldAutoOpenTutorial,
  wasTutorialSeenOnDevice,
} from '@/lib/tutorialState.js';

const newUser = (extra = {}) => ({
  id: 'user-a',
  created_at: new Date(TUTORIAL_AUTO_OPEN_SINCE + 60_000).toISOString(),
  user_metadata: {},
  ...extra,
});

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

describe('tutorialState', () => {
  afterEach(() => {
    delete globalThis.window;
  });

  it('se abre solo en una cuenta nueva que aún no lo ha visto', () => {
    assert.equal(shouldAutoOpenTutorial(newUser()), true);
  });

  it('no se abre sin usuario', () => {
    assert.equal(shouldAutoOpenTutorial(null), false);
    assert.equal(shouldAutoOpenTutorial({}), false);
  });

  it('no vuelve a abrirse si la cuenta ya lo vio', () => {
    const seen = newUser({ user_metadata: { [TUTORIAL_SEEN_METADATA_KEY]: '2026-10-12T10:00:00.000Z' } });
    assert.equal(shouldAutoOpenTutorial(seen), false);
  });

  it('no vuelve a abrirse si ya se vio en este dispositivo', () => {
    assert.equal(shouldAutoOpenTutorial(newUser(), { seenOnDevice: true }), false);
  });

  it('no salta a cuentas creadas antes del tutorial', () => {
    const old = newUser({ created_at: new Date(TUTORIAL_AUTO_OPEN_SINCE - 1).toISOString() });
    assert.equal(shouldAutoOpenTutorial(old), false);
    assert.equal(shouldAutoOpenTutorial(newUser({ created_at: 'no-date' })), false);
    assert.equal(shouldAutoOpenTutorial(newUser({ created_at: undefined })), false);
  });

  it('se abre en las páginas de entrada, con o sin barra final', () => {
    assert.equal(isTutorialAutoOpenPath('/'), true);
    assert.equal(isTutorialAutoOpenPath('/exam-practice/b2/'), true);
    assert.equal(isTutorialAutoOpenPath('/exam-practice/b2/exam-reading-and-use-of-english/', '?part=2'), true);
    assert.equal(isTutorialAutoOpenPath('/training'), true);
  });

  it('reconoce las rutas antiguas de /niveles', () => {
    assert.equal(isTutorialAutoOpenPath('/niveles/b2/exam-listening/'), true);
  });

  it('nunca corta el simulacro cronometrado ni un ejercicio', () => {
    assert.equal(
      isTutorialAutoOpenPath('/exam-practice/b2/exam-reading-and-use-of-english/', '?examen=1&examMode=1'),
      false,
    );
    assert.equal(isTutorialAutoOpenPath('/exam-practice/b2/exam-mode/'), false);
    assert.equal(isTutorialAutoOpenPath('/training/3/'), false);
    assert.equal(isTutorialAutoOpenPath('/quiz-game/'), false);
  });

  it('recuerda en el dispositivo que la cuenta ya lo vio', () => {
    globalThis.window = { localStorage: fakeStorage() };
    assert.equal(wasTutorialSeenOnDevice('user-a'), false);
    rememberTutorialSeenOnDevice('user-a');
    assert.equal(wasTutorialSeenOnDevice('user-a'), true);
    assert.equal(wasTutorialSeenOnDevice('user-b'), false);
  });

  it('sin almacenamiento disponible no rompe', () => {
    globalThis.window = {
      localStorage: {
        getItem() {
          throw new Error('blocked');
        },
        setItem() {
          throw new Error('blocked');
        },
      },
    };
    assert.doesNotThrow(() => rememberTutorialSeenOnDevice('user-a'));
    assert.equal(wasTutorialSeenOnDevice('user-a'), false);
  });
});
