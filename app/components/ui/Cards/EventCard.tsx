import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import { formatCalendarEventDisplay } from "components/ui/Cards/FormattedDate";
import styles from "./EventCard.module.scss";
import { EventResponse } from "hooks/StrapiAPI";

export const EventCard = ({ event }: { event: EventResponse }) => {
  const { calendar_event: calendarEvent, title, image, page_link } = event;
  const imageUrl = image?.data?.attributes?.url;
  const imageAlternativeText = image?.data?.attributes.alternativeText || "";
  const linkUrl = page_link?.url;

  const isEventExpired = React.useMemo(() => {
    if (!calendarEvent) return false;

    const now = new Date();

    // If there's an end date, check if it's in the past
    if (calendarEvent.enddate) {
      const endDate = new Date(calendarEvent.enddate);
      // If end time exists, add it to the end date
      if (calendarEvent.endtime) {
        const [hours, minutes] = calendarEvent.endtime.split(":").map(Number);
        endDate.setHours(hours, minutes);
      } else {
        // If no end time specified, assume end of day (23:59:59)
        endDate.setHours(23, 59, 59);
      }
      return now > endDate;
    }

    // If no end date but there's a start date, check if start date is in the past
    if (calendarEvent.startdate) {
      const startDate = new Date(calendarEvent.startdate);
      // If start time exists, add it to the start date
      if (calendarEvent.starttime) {
        const [hours, minutes] = calendarEvent.starttime.split(":").map(Number);
        startDate.setHours(hours, minutes);
      } else {
        // If no start time specified, assume end of day (23:59:59)
        startDate.setHours(23, 59, 59);
      }
      return now > startDate;
    }

    return false;
  }, [calendarEvent]);

  // Return null if the event has already passed
  if (isEventExpired) {
    return null;
  }

  const formattedDate = calendarEvent?.startdate
    ? formatCalendarEventDisplay(calendarEvent)
    : null;

  return (
    <div className={styles.eventCard} data-testid={"eventcard"}>
      <img
        data-testid={"eventcard-title"}
        alt={imageAlternativeText}
        src={imageUrl}
        className={styles.cardImage}
      />

      <div className={styles.content}>
        <div>
          <h3 className={styles.contentTitle}>
            <a
              href={linkUrl}
              data-testid={"eventcard-link"}
              // While events are external links:
              target="_blank"
              rel="noopener noreferrer"
            >
              {title}
            </a>
          </h3>
          {calendarEvent && calendarEvent?.startdate && (
            <div className={styles.contentTime}>
              <p data-testid="eventcard-formatteddate">{formattedDate}</p>
            </div>
          )}
        </div>

        <Button
          arrowVariant="after"
          variant="linkBlue"
          size="lg"
          mobileFullWidth={false}
          isVisualOnly
        >
          View more
        </Button>
      </div>
    </div>
  );
};
