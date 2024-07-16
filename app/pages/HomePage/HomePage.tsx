import { Footer } from "components/ui";
import Hero from "components/ui/Hero/Hero";
import { CategorySection } from "components/ui/Section/CategorySection";
import { OppEventCardSection } from "components/ui/Section/OppEventCardSection";
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
      <OppEventCardSection
        sectionType="opportunity"
        sectionData={opportunity_section}
        opportunities={opportunities.data ?? []}
      />
      <OppEventCardSection
        sectionType="event"
        sectionData={event_section}
        events={events.data ?? []}
      />
      {twoColumnContentData?.map((content) => (
        <TwoColumnContentSection key={content.id} {...content.attributes} />
      ))}

      {/* Newsletter Component */}
      <Footer />
    </>
  );
};

/* TODO: Remove when new categories are created
 other components are dependent on this list */

export const coreCategories = [
  {
    algoliaCategoryName: "Arts, Culture & Identity",
    name: "Arts, Culture & Identityasdf",
    icon: "food",
    categorySlug: "arts-culture-identity",
  },
  {
    algoliaCategoryName: "Children's Care",
    name: "Children's Care",
    icon: "food",
    categorySlug: "childrens-care",
  },
  {
    algoliaCategoryName: "Education",
    name: "Education",
    icon: "hospital",
    categorySlug: "education",
  },
  {
    algoliaCategoryName: "Family Support",
    name: "Family Support",
    icon: "shower",
    categorySlug: "family-support",
  },
  {
    algoliaCategoryName: "Health & Wellness",
    name: "Health & Wellness",
    icon: "bed",
    categorySlug: "health-wellness",
  },
  {
    algoliaCategoryName: "Sports & Recreation",
    name: "Sports & Recreation",
    icon: "longterm-housing",
    categorySlug: "sports-recreation",
  },
  {
    algoliaCategoryName: "Youth Workforce & Life Skills",
    name: "Youth Workforce & Life Skills",
    icon: "housing-heart",
    categorySlug: "youth-workforce-life-skills",
  },
];
