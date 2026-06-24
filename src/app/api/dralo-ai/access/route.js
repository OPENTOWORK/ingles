import { NextResponse } from 'next/server';
import { getDraloAiAccessFromRequest } from '@/lib/draloAiAccess';

/** Check if Dralo AI is accessible for the current user (staff roles only). */
export async function GET(req) {
  const access = await getDraloAiAccessFromRequest(req);

  return NextResponse.json({
    allowed: access.allowed,
    reason: access.reason,
    role: access.roleName,
  });
}
