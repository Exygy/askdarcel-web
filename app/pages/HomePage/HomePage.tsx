import React from "react";
import Hero from "components/ui/Hero/Hero";
import { CategorySection } from "components/ui/Section/CategorySection";
import { useHomepageData } from "hooks/StrapiAPI";
import { useAllSFGovEvents } from "hooks/SFGovAPI";
import { Homepage, StrapiDatum } from "models/Strapi";
import { EventCalendar } from "components/ui/Calendar/EventCalendar";
import { HomePageSection } from "pages/HomePage/components/Section";
import { TwoColumnContentSection } from "components/ui/TwoColumnContentSection/TwoColumnContentSection";

export const HomePage = () => {
  const { data: homepageData, isLoading: homepageDataIsLoading } =
    useHomepageData();
  const { data: eventsData, isLoading: eventsAreLoading } = useAllSFGovEvents(); // Fetch 100 upcoming events

  const homepageDataRes = homepageData as StrapiDatum<Homepage>;

  const homePageDataAttrs = homepageDataRes?.attributes;

  if (homepageDataIsLoading || eventsAreLoading) {
    return null;
  }

  const { hero, two_column_content_block } = homePageDataAttrs || {};

  return (
    <>
      <h1 className="sr-only" data-testid={"homepage-title"}>
        Homepage
      </h1>
      {hero && (
        <Hero
          backgroundImage={hero.background_image.data?.attributes.url ?? ""}
          title={hero.title}
          description={hero.description}
          buttons={hero.buttons}
        />
      )}
      <span id="browse-services">
        <CategorySection />
      </span>

      {eventsData && (
        <span id="featured-events">
          <HomePageSection
            title={"Featured resources"}
            description={""}
            backgroundColor={"tertiary"}
          >
            <EventCalendar events={eventsData} />
          </HomePageSection>
        </span>
      )}

      {two_column_content_block?.map((content) => (
        <TwoColumnContentSection key={content.id} {...content} />
      ))}
    </>
  );
};
