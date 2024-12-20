import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import { FormattedDate } from "components/ui/Cards/FormattedDate";
import styles from "./EventCard.module.scss";
import { EventResponse } from 'hooks/StrapiAPI';

export const EventCard = ({event}: {event: EventResponse}) => {
  const {
    calendar_event: calendarEvent,
    title,
    image,
    link,
  } = event;
  const imageUrl = image?.data?.attributes?.url;
  const imageAlternativeText = image?.data?.attributes.alternativeText || "";
  const linkUrl = link?.url;

  return (
    <div className={styles.eventCard}>
      <img data-testid={"eventcard-title"}
        alt={imageAlternativeText}
        src={imageUrl}
        className={styles.cardImage}
      />


      <div className={styles.content}>
        <div>
          <h4 className={styles.contentTitle}>
            <a href={linkUrl} data-testid={"eventcard-link"}>{title}</a>
          </h4>
          {calendarEvent && (
            <div className={styles.contentTime} >
              <FormattedDate calendarEvent={calendarEvent} />
            </div>
          )}
        </div>

        <Button arrowVariant="after" variant="linkBlue" size="lg" isVisualOnly>
          View more
        </Button>
      </div>
    </div>
  )
}
