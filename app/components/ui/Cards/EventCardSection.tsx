import React, { useState, useMemo } from "react";
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

  // Sort events so featured events come first
  const sortedEvents = useMemo(() => {
    if (!events) return null;

    return [...events].sort((a, b) => {
      // Featured items first (true > false, so we reverse the comparison)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [events]);

  if (!sortedEvents) {
    return <Loader />;
  }

  const displayedEvents = showAll ? sortedEvents : sortedEvents.slice(0, 4);
  const hasMoreEvents = sortedEvents.length > 4;

  return (
    <>
      {events && (
        <div className={styles.cardsContainer} id="event-cards-container">
          {displayedEvents?.map((eventData) => (
            <EventCard key={eventData.id} event={eventData} />
          ))}
        </div>
      )}
      {hasMoreEvents && !showAll && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(true)}
          aria-expanded="false"
          aria-controls="event-cards-container"
        >
          Show More
        </button>
      )}
      {hasMoreEvents && showAll && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(false)}
          aria-expanded="true"
          aria-controls="event-cards-container"
        >
          Show Less
        </button>
      )}
    </>
  );
};
