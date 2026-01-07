/**
 * Haptic feedback utility for mobile devices
 * Uses the Vibration API when available
 */

type HapticType = "light" | "medium" | "heavy" | "success" | "error";

const hapticPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 50, 50],
};

/**
 * Trigger haptic feedback on supported devices
 */
export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined") return;

  // Check if vibration is supported
  if (!("vibrate" in navigator)) return;

  const pattern = hapticPatterns[type];

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail if vibration is not allowed
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "vibrate" in navigator;
}
