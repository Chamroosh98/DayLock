/**
 * Tactile Vibration Feedback Utilities using navigator.vibrate
 */

export const triggerHapticFeedback = (pattern: 'success' | 'warning' | 'error' | 'pulse') => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  try {
    switch (pattern) {
      case 'success':
        // Distinct short single pulse for successful decryption / unlocking
        navigator.vibrate(60);
        break;
      case 'warning':
      case 'error':
        // Distinct double pulse for security warnings, invalid passwords, or errors
        navigator.vibrate([80, 60, 80]);
        break;
      case 'pulse':
        navigator.vibrate(30);
        break;
      default:
        navigator.vibrate(40);
        break;
    }
  } catch {
    // Fail silently on unsupported environments
  }
};
