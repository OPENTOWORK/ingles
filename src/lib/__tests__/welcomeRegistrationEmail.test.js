import { describe, expect, it } from 'vitest';
import { extractAuthUserNombre } from '../welcomeRegistrationEmail.js';

describe('welcomeRegistrationEmail', () => {
  it('extracts Google display name from user metadata', () => {
    expect(
      extractAuthUserNombre({
        user_metadata: { full_name: 'María García' },
      }),
    ).toBe('María García');
  });

  it('falls back to name or nombre metadata keys', () => {
    expect(extractAuthUserNombre({ user_metadata: { name: 'Alex' } })).toBe('Alex');
    expect(extractAuthUserNombre({ user_metadata: { nombre: 'Pablo' } })).toBe('Pablo');
  });
});
