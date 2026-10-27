'use client';

import { useCallback, useRef, useState } from 'react';
import {
  describeSpeakingMotorLifecycle,
  SPEAKING_MOTOR_START_MODE,
} from './speakingMotorParentApi';

export function useSpeakingMotorParent() {
  const motorRef = useRef(null);
  const [lifecycle, setLifecycle] = useState(() => describeSpeakingMotorLifecycle());

  const beginAudioCheck = useCallback(() => {
    if (!motorRef.current?.beginAudioCheck) {
      return Promise.resolve({ started: false, reason: 'UNMOUNTED' });
    }
    return motorRef.current.beginAudioCheck();
  }, []);

  return {
    motorRef,
    startMode: SPEAKING_MOTOR_START_MODE.parent,
    lifecycle,
    onLifecycleChange: setLifecycle,
    beginAudioCheck,
  };
}
