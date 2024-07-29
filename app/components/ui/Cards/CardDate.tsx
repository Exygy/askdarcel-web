import { StrapiModel } from "models/Strapi";
import React from "react";
import formatEventDate from "utils/formatEventDate";
import formatEventTime from "utils/formatEventTime";

export const CardDate = ({ date }: { date: StrapiModel.Date }) => {
  const formattedStartDate = formatEventDate(date.startdate);
  const formattedEndDate = formatEventDate(date.enddate || "");
  const formattedStartTime = formatEventTime(date.startdate);
  const formattedEndTime = formatEventTime(date.enddate || "");
  const hasEndTime = formattedStartTime !== formattedEndTime;
  const isSingleDayEvent = formattedStartDate === formattedEndDate;

  if (isSingleDayEvent) {
    const endTime = hasEndTime ? `- ${formattedEndTime} ` : "";

    return <p>{`${formattedStartDate} · ${formattedStartTime} ${endTime}`}</p>;
  }

  return <p>{`${formattedStartDate} - ${formattedEndDate}`}</p>;
};
