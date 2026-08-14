export function shouldReduceMotion(reduceMotionSetting = false): boolean {
  if (reduceMotionSetting) {
    return true;
  }

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
