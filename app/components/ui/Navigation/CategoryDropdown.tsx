import React from "react";
import { ServiceCategory } from "pages/constants";
import DropdownMenu from "./DropdownMenu";

export const CategoryDropdown = ({
  categories,
  resultsTitle,
}: {
  categories: Readonly<ServiceCategory[]>;
  resultsTitle: string;
}) => {
  const links = [
    {
      id: "all-categories",
      url: "/search",
      text: "All categories",
    },
    ...categories.map((category) => ({
      id: category.slug,
      url: `/${category.slug}/results`,
      text: category.name,
    })),
  ];

  const uniqueKey = resultsTitle;

  return (
    <DropdownMenu
      title={resultsTitle}
      links={links}
      uniqueKey={uniqueKey}
      variant="category"
    />
  );
};
