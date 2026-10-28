import { NextResponse } from 'next/server';
import { allowSpeakingB2DevSurface, allowSpeakingB2LanRequest } from './lan-access.js';

export function speakingB2LanGuardResponse(request) {
  const access = allowSpeakingB2LanRequest(request);
  if (access.ok) return null;
  return NextResponse.json({ error: 'Forbidden', code: access.code }, { status: 403 });
}

export function speakingB2DevSurfaceGuardResponse(request) {
  if (allowSpeakingB2DevSurface(request)) return null;
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
