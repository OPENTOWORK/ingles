import { NextResponse } from 'next/server';
import { isSpeakingB2FixtureRuntime } from '@/features/speaking-b2-motor/fixtures/runtime';
import { getSpeakingB2Fixture } from '@/features/speaking-b2-motor/fixtures/catalog';
import { materializeSpeakingB2Fixture } from '@/features/speaking-b2-motor/fixtures/materialize';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  if (!isSpeakingB2FixtureRuntime()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const id = String(params?.id || '');
  const fixture = getSpeakingB2Fixture(id);
  if (!fixture) {
    return NextResponse.json({ error: 'Unknown fixture' }, { status: 404 });
  }
  if (fixture.expectedAudioCode) {
    return NextResponse.json(
      { error: 'Fixture is not streamable.', code: fixture.expectedAudioCode, id: fixture.id },
      { status: 400 },
    );
  }
  const loaded = materializeSpeakingB2Fixture(fixture);
  if (!loaded?.available || !loaded.buffer) {
    return NextResponse.json(
      { error: 'No intelligible speech audio is available.', code: loaded?.reason || 'NO_SPEECH_AUDIO', id: fixture.id },
      { status: 422 },
    );
  }
  return new NextResponse(loaded.buffer, {
    status: 200,
    headers: {
      'Content-Type': loaded.mimeType,
      'Cache-Control': 'no-store',
      'X-Speaking-Fixture': fixture.id,
    },
  });
}
