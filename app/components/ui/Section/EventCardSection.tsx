import React from "react";
import { StrapiModel } from "models/Strapi";
import { CardDate } from "components/ui/Cards/CardDate";
import { Button } from "components/ui/inline/Button/Button";
import sectionstyles from "pages/HomePage/components/Section/Section.module.scss";
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
    <section
      className={`${sectionstyles.section} ${
        sectionstyles[background_color.color]
      }`}
    >
      <div className={sectionstyles.content}>
        <div className={sectionstyles.header}>
          <div>
            <h2 className={sectionstyles.title}>{header}</h2>
            <p className={sectionstyles.description}>{subheader}</p>
          </div>

          {link && (
            <Button href={link.url} arrowVariant="after" size="lg">
              {link.text}
            </Button>
          )}
        </div>

        {data && (
          <div className={`${eventCardSectionStyles.cardsContainer}`}>
            {data?.map((item) => {
              const { title, id, date, image } = item;
              const imageSrc = image?.image?.data?.attributes.url ?? ""; // TODO PLACEHOLDER IMAGE

              return (
                <div key={title} className={`${eventCardStyles.eventCard}`}>
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
                      {date && (
                        <div className={eventCardStyles.contentTime}>
                          <CardDate date={date} />
                        </div>
                      )}
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
      </div>
    </section>
  );
};
