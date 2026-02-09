import { HomePageSection } from "pages/HomePage/components/Section";
import React from "react";
import { BackgroundColorVariant } from "models";
import { useTopLevelCategories } from "hooks/TypesenseHooks";
import { getCategoryIcon, categoryToSlug } from "utils/categoryIcons";
import { CategoryCard } from "../Cards/CategoryCard";
import { Loader } from "components/ui/Loader";
import styles from "./CategorySection.module.scss";

export interface FeaturedCategoriesData {
  header: string;
  subheader: string;
  backgroundColor: BackgroundColorVariant;
}

/**
 * Displays a grid of categories on the home page
 * Categories are loaded dynamically from Typesense
 */
export const CategorySection = () => {
  const { categories, isLoading } = useTopLevelCategories();

  // Show loader while fetching categories
  if (isLoading) {
    return (
      <HomePageSection
        title={tempCategoriesSection.header}
        description={tempCategoriesSection.subheader}
        backgroundColor="secondary"
      >
        <div className={styles.categorySection}>
          <Loader />
        </div>
      </HomePageSection>
    );
  }

  return (
    <HomePageSection
      title={tempCategoriesSection.header}
      description={tempCategoriesSection.subheader}
      backgroundColor="secondary"
    >
      <div className={styles.categorySection}>
        <div className={styles.categoryCards}>
          {categories.map((category) => {
            const slug = categoryToSlug(category.value);
            const icon = getCategoryIcon(category.value);

            return (
              <CategoryCard
                key={category.value}
                label={category.value}
                href={`/${slug}/results`}
                icon={icon}
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

// TODO: Add to CMS
const tempCategoriesSection = {
  header: "Browse services",
  subheader: "Click on the category that best fits what you’re looking for.",
};
