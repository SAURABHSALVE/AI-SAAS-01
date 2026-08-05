import { format } from "date-fns";

/** Combines a "yyyy-MM-dd" date string and "HH:mm" time string into a Date. */
export const combineDateAndTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}`);
};

/** Splits a Date into the "yyyy-MM-dd" / "HH:mm" pair the form fields expect. */
export const splitDateAndTime = (value: Date) => {
  return {
    date: format(value, "yyyy-MM-dd"),
    time: format(value, "HH:mm"),
  };
};
