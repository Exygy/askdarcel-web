import { HomePageSection } from "pages/HomePage/components/Section";
import React from "react";
import { BackgroundColorVariant } from "models";
import { CATEGORIES } from "pages/constants";
import { CategoryCard } from "../Cards/CategoryCard";
import styles from "./CategorySection.module.scss";

export interface FeaturedCategoriesData {
  header: string;
  subheader: string;
  backgroundColor: BackgroundColorVariant;
}

/**
 * Displays a grid of categories on the home page
 */
export const CategorySection = () => (
  <HomePageSection
    title={tempCategoriesSection.header}
    description={tempCategoriesSection.subheader}
    backgroundColor="secondary"
  >
    <div className={styles.categorySection}>
      <div className={styles.categoryCards}>
        {CATEGORIES.map((category) => {
          return (
            <CategoryCard
              key={category.name}
              label={category.name}
              href={`/${category.slug}/results`}
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

// TODO: Add to CMS
const tempCategoriesSection = {
  header: "Browse services",
  subheader: "Click on the category that best fits what you’re looking for.",
};
