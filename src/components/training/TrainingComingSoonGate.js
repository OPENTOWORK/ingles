'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { isTrainingLockedForUser } from '@/constants/studentFeatureAccess';

export default function TrainingComingSoonGate({ children }) {
  const router = useRouter();
  const { userRole } = useUserRole();
  const locked = isTrainingLockedForUser(userRole);

  useEffect(() => {
    if (locked) {
      router.replace('/training');
    }
  }, [locked, router]);

  if (locked) {
    return null;
  }

  return children;
}
