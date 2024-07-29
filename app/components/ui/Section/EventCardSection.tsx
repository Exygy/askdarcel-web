import { HomePageSection } from "pages/HomePage/components/Section";
import React from "react";
import { StrapiModel } from "models/Strapi";
import { OppEventDate } from "components/ui/Cards/OppEventDate";
import { Button } from "components/ui/inline/Button/Button";
import eventCardSectionStyles from "./EventCardSection.module.scss";
import eventCardStyles from "../Cards/EventCard.module.scss";
import { Loader } from "../Loader";

interface EventCardSectionProps {
  sectionConfig: StrapiModel.ContentBlock;
  data: StrapiModel.Event[];
}

export const EventCardSection = (props: EventCardSectionProps) => {
  const { sectionConfig, data } = props;
  const { header, subheader, background_color, link } = sectionConfig;

  if (!sectionConfig) {
    return <Loader />;
  }

  return (
    <HomePageSection
      title={header}
      description={subheader}
      backgroundColor={background_color.color}
      link={link}
    >
      {data && (
        <div className={`${eventCardSectionStyles.cardsContainer}`}>
          {data?.map((item) => {
            const { title, id, date, image } = item;
            const imageSrc = image?.image?.data?.attributes.url ?? "";

            return (
              <div className={`${eventCardStyles.eventCard}`}>
                <img
                  alt={title}
                  src={imageSrc}
                  className={`${eventCardStyles.cardImage}`}
                />
                <div className={eventCardStyles.content}>
                  <div>
                    <h4 className={eventCardStyles.contentTitle}>
                      <a href={id}>{title}</a>
                    </h4>
                    <div className={eventCardStyles.contentTime}>
                      <OppEventDate
                        startDate={new Date(date?.startdate)}
                        endDate={new Date(date?.enddate)}
                      />
                    </div>
                  </div>
                  <Button arrowVariant="after" variant="linkBlue" size="lg">
                    View more
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </HomePageSection>
  );
};
