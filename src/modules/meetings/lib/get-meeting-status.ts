export type MeetingStatus = "upcoming" | "active" | "completed";

/** Derives status from the meeting's window instead of a stored field, so it never drifts out of sync. */
export const getMeetingStatus = (
  startsAt: Date,
  durationMinutes: number,
  now: Date = new Date()
): MeetingStatus => {
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

  if (now < startsAt) return "upcoming";
  if (now > endsAt) return "completed";
  return "active";
};
