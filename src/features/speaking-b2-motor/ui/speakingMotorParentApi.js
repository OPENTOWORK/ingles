export const SPEAKING_MOTOR_START_MODE = {
  self: 'self',
  parent: 'parent',
};

export function describeSpeakingMotorLifecycle({ screen = 'select', busy = false, allowed = true } = {}) {
  return {
    screen,
    busy,
    canStart: allowed && screen === 'select' && !busy,
    interviewStarted: screen !== 'select',
  };
}

export function createSpeakingStartLock() {
  let locked = false;
  return {
    acquire() {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() {
      locked = false;
    },
    isLocked() {
      return locked;
    },
  };
}

export function resolveEmbeddedStartMode(parentControlled) {
  return parentControlled ? SPEAKING_MOTOR_START_MODE.parent : SPEAKING_MOTOR_START_MODE.self;
}
