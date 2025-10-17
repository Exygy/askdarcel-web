import React from "react";
import Hero from "components/ui/Hero/Hero";
import { CategorySection } from "components/ui/Section/CategorySection";
import {
  useHomepageData,
  useHomePageFeaturedResourcesData,
} from "hooks/StrapiAPI";
import { Homepage, StrapiDatum } from "models/Strapi";
import { EventCalendar } from "components/ui/Calendar";
import { HomePageSection } from "pages/HomePage/components/Section";
import { TwoColumnContentSection } from "components/ui/TwoColumnContentSection/TwoColumnContentSection";
import { EventCardSection } from "components/ui/Cards/EventCardSection";
import { ErrorBoundary } from "components/ui/ErrorBoundary";

export const HomePage = () => {
  const { data: homepageData, isLoading: homepageDataIsLoading } =
    useHomepageData();

  const {
    data: featuredResourcesData,
    isLoading: featuredResourcesAreLoading,
  } = useHomePageFeaturedResourcesData();

  const homepageDataRes = homepageData as StrapiDatum<Homepage>;

  const homePageDataAttrs = homepageDataRes?.attributes;

  if (homepageDataIsLoading) {
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

      {!featuredResourcesAreLoading && (
        <span id="featured-resources">
          <ErrorBoundary sectionName="Featured resources">
            <HomePageSection
              title={"Featured resources"}
              description={""}
              backgroundColor={"tertiary"}
            >
              <EventCardSection events={featuredResourcesData ?? []} />
            </HomePageSection>
          </ErrorBoundary>
        </span>
      )}
      <span id="featured-events">
        <ErrorBoundary sectionName="Events calendar">
          <HomePageSection
            title={"Events calendar"}
            description={""}
            backgroundColor={"primary"}
          >
            <EventCalendar />
          </HomePageSection>
        </ErrorBoundary>
      </span>

      {two_column_content_block?.map((content) => (
        <TwoColumnContentSection key={content.id} {...content} />
      ))}
    </>
  );
};
