import { StrapiModel } from "models/Strapi";
import React from "react";
import formatEventDate from "utils/formatEventDate";
import formatEventTime from "utils/formatEventTime";

const ERROR_MESSAGE = "Invalid Date: missing property {startdate}";

export const FormattedDate = ({
  calendarEvent,
}: {
  calendarEvent: StrapiModel.CalendarEvent;
}): JSX.Element => {
  if (calendarEvent?.startdate === undefined) {
    return <em>{ERROR_MESSAGE}</em>;
  }
  const formattedStartDate = formatEventDate(calendarEvent.startdate);
  const formattedEndDate = formatEventDate(calendarEvent.enddate || "");
  const isSingleDayEvent = formattedStartDate === formattedEndDate;

  if (isSingleDayEvent) {
    const formattedStartTime = formatEventTime(calendarEvent.startdate);
    const formattedEndTime = formatEventTime(calendarEvent.enddate || "");
    const hasEndTime = formattedStartTime !== formattedEndTime;
    const endTime = hasEndTime ? `- ${formattedEndTime} ` : "";

    return <p>{`${formattedStartDate} · ${formattedStartTime} ${endTime}`}</p>;
  }

  return <p>{`${formattedStartDate} - ${formattedEndDate}`}</p>;
};
