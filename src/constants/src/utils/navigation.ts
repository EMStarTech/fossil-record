/**
 * Fossil Dashboard — Navigation Utility
 * Locked: March 24, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * This is the single source of truth for node navigation.
 * All TraceNode click handlers must reference this function.
 * No inline navigation logic permitted in component files.
 * Test C3 compliance is enforced here and nowhere else.
 */

/**
 * Defensive client-side safeguard for node navigation.
 * Suppresses navigation if pr_url is missing or malformed.
 *
 * NOTE: This is a client-side safeguard, not a normal API response condition.
 * The API contract requires pr_url as a required field.
 * This guard exists to protect against legacy or malformed data only.
 *
 * Test C3: If pr_url is null, undefined, or empty — no navigation,
 * no error state, no visible reaction. The system does nothing visible.
 */
export const validateAndNavigate = (url: string | null | undefined): void => {
  if (!url || url.trim() === '') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Fossil Dashboard] Test C3: Navigation suppressed — pr_url is null or missing. ' +
        'This is a client-side safeguard, not a normal API response condition.'
      );
    }
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};
