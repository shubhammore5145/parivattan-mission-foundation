/**
 * ============================================================================
 * CLIENT-SIDE SUBMISSION THROTTLER & RATE LIMITER
 * ============================================================================
 * Prevents rapid double-clicks, button mashing, and spamming form submissions
 * in the user's browser.
 */

const STORAGE_PREFIX = "pmf_ratelimit_";

/**
 * Checks if a specific action or form can be submitted right now.
 *
 * @param actionKey Unique key for the form/action (e.g., 'course_registration', 'contact_form')
 * @param cooldownSeconds Number of seconds required between submissions (default: 15)
 * @returns { allowed: boolean, remainingSeconds: number }
 */
export function checkCooldown(
  actionKey: string,
  cooldownSeconds: number = 15
): { allowed: boolean; remainingSeconds: number } {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${actionKey}`);
    if (!raw) return { allowed: true, remainingSeconds: 0 };

    const lastTime = parseInt(raw, 10);
    if (isNaN(lastTime)) return { allowed: true, remainingSeconds: 0 };

    const elapsedSeconds = Math.floor((Date.now() - lastTime) / 1000);
    const remainingSeconds = Math.max(0, cooldownSeconds - elapsedSeconds);

    if (remainingSeconds > 0) {
      return { allowed: false, remainingSeconds };
    }

    return { allowed: true, remainingSeconds: 0 };
  } catch {
    return { allowed: true, remainingSeconds: 0 };
  }
}

/**
 * Records that an action or form was submitted, starting the cooldown timer.
 *
 * @param actionKey Unique key for the form/action
 */
export function recordSubmission(actionKey: string): void {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${actionKey}`, Date.now().toString());
  } catch {}
}

/**
 * Clears the cooldown for an action (e.g. if the form had a validation error before network call).
 *
 * @param actionKey Unique key for the form/action
 */
export function resetCooldown(actionKey: string): void {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${actionKey}`);
  } catch {}
}

/**
 * Formats a friendly Marathi/English cooldown error message.
 */
export function getCooldownMessage(remainingSeconds: number, actionName = "अर्ज (Submission)"): string {
  return `कृपया ${remainingSeconds} सेकंद थांबा. ${actionName} आधीच प्रक्रियेत आहे. (Please wait ${remainingSeconds}s before submitting again.)`;
}
