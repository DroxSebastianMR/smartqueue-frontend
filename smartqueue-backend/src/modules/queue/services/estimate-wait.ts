/** Operational ETA, not an ML prediction. Null means insufficient recent evidence. */
export function estimateWaitMinutes(peopleAhead: number, admissionsLastMinute: number): number | null {
  if (admissionsLastMinute < 5) return null;
  // Include the participant: first in line does not mean immediate admission.
  return Math.ceil(((peopleAhead + 1) / admissionsLastMinute) * 10) / 10;
}
