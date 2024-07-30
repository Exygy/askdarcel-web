import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import { StrapiModel } from "models/Strapi";
import styles from "./OppEventCard.module.scss";
import { FormattedDate } from "./FormattedDate";

interface OppEventCardProps {
  details: {
    id: string;
    imageUrl: string | null;
    title: string;
    calendarEvent: StrapiModel.CalendarEvent;
  };
  sectionType: "event" | "opportunity";
}

export const OppEventCard = (props: OppEventCardProps) => {
  const {
    details: { title, id, calendarEvent, imageUrl },
    sectionType,
  } = props;
  // TODO: waiting on design
  const url = imageUrl || "/placeholder.img";

  return (
    <div className={`${styles.oppEventCard} ${styles[sectionType]}`}>
      <img
        alt={title}
        src={url}
        className={`${styles.cardImage} ${styles[sectionType]}`}
      />
      <div className={styles.content}>
        <div>
          <h4 className={styles.contentTitle}>
            <a href={id}>{title}</a>
          </h4>
          <div className={styles.contentTime}>
            <FormattedDate calendarEvent={calendarEvent} />
          </div>
        </div>

        <Button arrowVariant="after" variant="linkBlue" size="lg">
          View more
        </Button>
      </div>
    </div>
  );
};
