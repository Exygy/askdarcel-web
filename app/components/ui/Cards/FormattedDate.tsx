import { StrapiModel } from "models/Strapi";
import React from "react";
import formatEventDate from "utils/formatEventDate";
import formatEventTime from "utils/formatEventTime";

// Renders a human-friendly date
export const FormattedDate = ({
  calendarEvent,
}: {
  calendarEvent: StrapiModel.CalendarEvent;
}): JSX.Element => {
  const formattedStartDate = formatEventDate(calendarEvent.startdate);
  // If the end date is unset, let's assume it's a single day event and assign the enddate to the startdate
  const formattedEndDate = formatEventDate(
    calendarEvent.enddate || calendarEvent.startdate
  );
  const isSingleDayEvent = formattedStartDate === formattedEndDate;

  if (isSingleDayEvent) {
    const startTimeDateStr = `${calendarEvent.startdate} ${calendarEvent.starttime}`;
    const endTimeDateStr = `${calendarEvent.startdate} ${calendarEvent.endtime}`;
    const formattedStartTime = formatEventTime(startTimeDateStr);
    const formattedEndTime = formatEventTime(endTimeDateStr);
    const endTimeDisplay = calendarEvent.endtime ? `- ${formattedEndTime}` : "";

    return (
      <p>{`${formattedStartDate} · ${formattedStartTime} ${endTimeDisplay}`}</p>
    );
  }

  return <p>{`${formattedStartDate} - ${formattedEndDate}`}</p>;
};