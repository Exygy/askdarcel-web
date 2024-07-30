import { HomePageSection } from "pages/HomePage/components/Section";
import React from "react";
import { StrapiModel } from "models/Strapi";
import { OppEventCard } from "../Cards/OppEventCard";
import styles from "./OppEventCardSection.module.scss";
import { Loader } from "../Loader";

interface OppEventCardSectionProps {
  sectionType: "event" | "opportunity";
  sectionData: StrapiModel.ContentBlock;
  events?: { attributes: StrapiModel.Event }[];
  opportunities?: { attributes: StrapiModel.Opportunity }[];
}

export const OppEventCardSection = (props: OppEventCardSectionProps) => {
  const { sectionType, sectionData, events, opportunities } = props;
  const { header, subheader, background_color, link } = sectionData;

  if (!sectionData) {
    return <Loader />;
  }

  return (
    <HomePageSection
      title={header}
      description={subheader}
      backgroundColor={background_color.color}
      link={link}
    >
      {events && (
        <div className={`${styles.cardsContainer} ${styles[sectionType]}`}>
          {events?.map((event): JSX.Element => {
            const {
              attributes: { title, id, calendar_event, image },
            } = event;
            const cardImage = image?.image?.data?.attributes.url ?? "";

            return (
              <OppEventCard
                key={title}
                title={title}
                slug={id}
                calendarEvent={calendar_event}
                image={cardImage}
                sectionType={sectionType}
              />
            );
          })}
        </div>
      )}
      {opportunities && (
        <div className={`${styles.cardsContainer} ${styles[sectionType]}`}>
          {opportunities?.map((opp): JSX.Element => {
            const {
              attributes: { title, id, calendar_event, image },
            } = opp;
            const cardImage = image?.image?.data?.attributes.url ?? "";

            return (
              <OppEventCard
                key={title}
                title={title}
                slug={id}
                calendarEvent={calendar_event}
                image={cardImage}
                sectionType={sectionType}
              />
            );
          })}
        </div>
      )}
    </HomePageSection>
  );
};
