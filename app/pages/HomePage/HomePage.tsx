import Hero from "components/ui/Hero/Hero";
import { CategorySection } from "components/ui/Section/CategorySection";
import { OppCardSection } from "components/ui/Section/OppCardSection";
import { EventCardSection } from "components/ui/Section/EventCardSection";
import { TwoColumnContentSection } from "components/ui/TwoColumnContentSection/TwoColumnContentSection";
import React from "react";
import { StrapiModel } from "models/Strapi";
import { useHomepageData } from "../../hooks/StrapiAPI";

export const HomePage = () => {
  const { data, isLoading } = useHomepageData();

  const res = data as StrapiModel.StrapiDatum<StrapiModel.Homepage>;

  const homePageData = res?.attributes;

  if (isLoading) {
    return null;
  }

  const {
    opportunity_section,
    opportunities,
    event_section,
    events,
    hero,
    two_column_content_blocks,
  } = homePageData;
  const eventsData = events.data?.map((item) => item.attributes);

  const twoColumnContentData = two_column_content_blocks.data;

  return (
    <>
      {hero && (
        <Hero
          backgroundImage={hero.background_image.data?.attributes.url ?? ""}
          title={hero.title}
          description={hero.description}
          buttons={hero.buttons}
        />
      )}
      <CategorySection />
      {/* <OppCardSection
        sectionData={opportunity_section}
        opportunities={opportunities.data ?? []}
      /> */}
      {eventsData && (
        <EventCardSection sectionConfig={event_section} data={eventsData} />
      )}
      {twoColumnContentData?.map((content) => (
        <TwoColumnContentSection key={content.id} {...content.attributes} />
      ))}

      {/* Newsletter Component */}
    </>
  );
};
