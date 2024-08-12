import React from "react";
import { ServiceCategory } from "pages/constants";
import { useMenuToggle } from "../../../hooks/MenuHooks";
import DropdownSubmenu from "./DropdownSubmenu";

export const CategoryDropdown = ({
  categories,
  resultsTitle,
}: {
  categories: Readonly<ServiceCategory[]>;
  resultsTitle: string;
}) => {
  const { activeSubMenu, handleMenuToggle, menuRef } = useMenuToggle();

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
    <DropdownSubmenu
      title={resultsTitle}
      links={links}
      activeSubMenu={activeSubMenu}
      handleMenuToggle={handleMenuToggle}
      uniqueKey={uniqueKey}
      menuRef={menuRef}
      variant="category"
    />
  );
};
