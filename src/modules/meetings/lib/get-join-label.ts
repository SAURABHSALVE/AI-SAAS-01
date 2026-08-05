import type { MeetingStatus } from "./get-meeting-status";

/** The scheduled window is informational, not a lock — hosts can start early or rejoin after the fact. */
export const getJoinLabel = (status: MeetingStatus): string => {
  switch (status) {
    case "upcoming":
      return "Start meeting";
    case "active":
      return "Join meeting";
    case "completed":
      return "Rejoin meeting";
  }
};
