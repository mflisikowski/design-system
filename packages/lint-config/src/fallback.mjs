/**
 * @typedef {object} OxlintFallbackEvidence
 * @property {number} [ciLoadFailures]
 * @property {boolean} [nondeterministicOrStaleResults]
 * @property {boolean} [unavoidableFalsePositives]
 * @property {boolean} [monorepoResolutionFailure]
 * @property {boolean} [upgradeBlockedWithoutWorkingPinnedVersion]
 */

/** @type {{ matches: (evidence: OxlintFallbackEvidence) => boolean, reason: string }[]} */
const fallbackChecks = [
  {
    matches: ({ ciLoadFailures = 0 }) => ciLoadFailures >= 2,
    reason: "repeated CI plugin load failures",
  },
  {
    matches: ({ nondeterministicOrStaleResults = false }) => nondeterministicOrStaleResults,
    reason: "nondeterministic or stale results",
  },
  {
    matches: ({ unavoidableFalsePositives = false }) => unavoidableFalsePositives,
    reason: "unavoidable component-contract false positives",
  },
  {
    matches: ({ monorepoResolutionFailure = false }) => monorepoResolutionFailure,
    reason: "monorepo resolution failure",
  },
  {
    matches: ({ upgradeBlockedWithoutWorkingPinnedVersion = false }) =>
      upgradeBlockedWithoutWorkingPinnedVersion,
    reason: "upgrade blocked without a working pinned version",
  },
];

/** @param {OxlintFallbackEvidence} evidence */
export function evaluateOxlintFallback(evidence) {
  const reasons = fallbackChecks
    .filter(({ matches }) => matches(evidence))
    .map(({ reason }) => reason);

  return { permitted: reasons.length > 0, reasons };
}
