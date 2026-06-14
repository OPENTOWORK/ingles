import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isDraloAiFeatureEnabled } from '@/lib/aiUsage';

/** Check if Dralo AI advanced tools are accessible (feature flag or admin). */
export async function GET(req) {
  const adminAuth = await authenticateAdminRequest(req);
  const isAdmin = !adminAuth.error;
  const featureEnabled = isDraloAiFeatureEnabled();

  return NextResponse.json({
    allowed: featureEnabled || isAdmin,
    featureFlag: featureEnabled,
    admin: isAdmin,
  });
}
