import { HomePageSection } from "pages/HomePage/components/Section";
import React from "react";
import { BackgroundColorVariant } from "models";
import { CategoryCard } from "../Cards/CategoryCard";
import styles from "./CategorySection.module.scss";
// import { Loader } from "../Loader";

interface Category {
  icon: {
    name: string;
    provider: string;
  };
  label: string;
  slug: string;
  name: string;
}

interface FeaturedCategoriesSection {
  category: Category[];
  name: string;
}

export interface FeaturedCategoriesData {
  header: string;
  subheader: string;
  backgroundColor: BackgroundColorVariant;
  featuredCategoriesSection: FeaturedCategoriesSection[];
}

export const CategorySection = () => {
  // const { sectionData } = props;

  // if (!sectionData) {
  //   return <div>Loading...</div>;
  // }

  // const { header, subheader, backgroundColor, featuredCategoriesSection } =
  //   sectionData;
  // const featuredCategories = featuredCategoriesSection[0].category;

  return (
    <HomePageSection
      title={tempCategoriesSection.header}
      description={tempCategoriesSection.subheader}
      backgroundColor="secondary"
    >
      <div className={styles.categorySection}>
        <div className={styles.categoryCards}>
          {topLevelCategories.map((category) => {
            return (
              <CategoryCard
                key={category.name}
                label={category.name}
                href={`/${category.categorySlug}/results`}
                icon={category.icon}
              />
            );
          })}
          <CategoryCard
            key="See all services"
            label="See all services"
            href="/search"
            icon={{ provider: "fas", name: "fa-arrow-right" }}
          />
        </div>
      </div>
    </HomePageSection>
  );
};

// TODO: combine topLevelCategories, coreCategories (from Homepage) and CATEGORIES (from ServiceDiscoveryForm constants)
export const topLevelCategories = [
  {
    name: "Arts, Culture & Identity",
    icon: {
      name: "fa-utensils",
      provider: "fa",
    },
    categorySlug: "arts-culture-identity",
  },
  {
    name: "Children's Care",
    icon: {
      name: "fa-hospital",
      provider: "fa",
    },
    categorySlug: "childrens-care",
  },
  {
    name: "Education",
    icon: {
      name: "fa-bed",
      provider: "fa",
    },
    categorySlug: "education",
  },
  {
    name: "Family Support",
    icon: {
      name: "fa-house",
      provider: "fa",
    },
    categorySlug: "family-support",
  },
  {
    name: "Health & Wellness",
    icon: {
      name: "fa-house-chimney-user",
      provider: "fa",
    },
    categorySlug: "health-wellness",
  },
  {
    name: "Sports & Recreation",
    icon: {
      name: "fa-wallet",
      provider: "fa",
    },
    categorySlug: "sports-recreation",
  },
  {
    name: "Youth Workforce & Life Skills",
    icon: {
      name: "fa-briefcase",
      provider: "fa",
    },
    categorySlug: "youth-workforce-life-skills",
  },
];

const tempCategoriesSection = {
  header: "Browse services",
  subheader: "Description text explaining this section goes here.",
};
