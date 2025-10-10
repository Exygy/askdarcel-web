import React, { useState } from "react";
import { EventCard } from "./EventCard";
import styles from "./EventCardSection.module.scss";
import { Loader } from "../Loader";
import { formatHomePageEventsData } from "hooks/StrapiAPI";

export const EventCardSection = ({
  events,
}: {
  events: ReturnType<typeof formatHomePageEventsData>;
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!events) {
    return <Loader />;
  }

  const displayedEvents = showAll ? events : events.slice(0, 4);
  const hasMoreEvents = events.length > 4;

  return (
    <>
      {events && (
        <div className={styles.cardsContainer}>
          {displayedEvents?.map((eventData) => (
            <EventCard key={eventData.id} event={eventData} />
          ))}
        </div>
      )}
      {hasMoreEvents && !showAll && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(true)}
        >
          Show More
        </button>
      )}
      {hasMoreEvents && showAll && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(false)}
        >
          Show Less
        </button>
      )}
    </>
  );
};
