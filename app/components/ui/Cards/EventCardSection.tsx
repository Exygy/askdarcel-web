import { HomePageSection } from "pages/HomePage/components/Section";
import React from "react";
import { EventCard } from "./EventCard";
import styles from "./EventCardSection.module.scss";
import { Loader } from "../Loader";
import { EventResponse } from 'hooks/StrapiAPI';

export const EventCardSection = ({events}: {events: EventResponse[]}) => {
  if (!events) {
    return <Loader />;
  }

  return (
    <HomePageSection
      title={'Upcoming events'}
      description={'Description text eplaining this section'}
      backgroundColor={"tertiary"}
    >
      {events && (
        <div className={styles.cardsContainer}>
          {events?.map((eventData) => (
            <EventCard
              key={eventData.id}
              event={eventData}
            />
          ))}
        </div>
      )}
    </HomePageSection>
  );
};
