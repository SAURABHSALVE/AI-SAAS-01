export const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
] as const;

export const MEETING_FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const;

export type MeetingFilter = (typeof MEETING_FILTERS)[number]["value"];

export const MEETING_DURATION_FILTERS = [
  { value: "any", label: "Any duration" },
  { value: "short", label: "Under 30 min" },
  { value: "medium", label: "30–60 min" },
  { value: "long", label: "Over 60 min" },
] as const;

export type MeetingDurationFilter =
  (typeof MEETING_DURATION_FILTERS)[number]["value"];
