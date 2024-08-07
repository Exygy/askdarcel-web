import { StrapiModel } from "models/Strapi";
import React from "react";
import formatEventDate from "utils/formatEventDate";
import formatEventTime from "utils/formatEventTime";

const ERROR_MESSAGE = "Invalid Date: missing property {startdate}";

// Renders a human-friendly date
export const FormattedDate = ({
  calendarEvent,
}: {
  calendarEvent: StrapiModel.CalendarEvent;
}): JSX.Element => {
  if (calendarEvent?.startdate === undefined) {
    return <em>{ERROR_MESSAGE}</em>;
  }
  const formattedStartDate = formatEventDate(calendarEvent.startdate);
  // If the end date is unset, let's assume it's a single day event and assign the enddate to the startdate
  const formattedEndDate = formatEventDate(
    calendarEvent.enddate || calendarEvent.startdate
  );
  const isSingleDayEvent = formattedStartDate === formattedEndDate;

  if (isSingleDayEvent) {
    const formattedStartTime = formatEventTime(calendarEvent.startdate);
    const endTimeDisplay = calendarEvent.endtime
      ? `- ${formatEventTime(calendarEvent.endtime)}`
      : "";

    return (
      <p>{`${formattedStartDate} · ${formattedStartTime} ${endTimeDisplay}`}</p>
    );
  }

  return <p>{`${formattedStartDate} - ${formattedEndDate}`}</p>;
};
