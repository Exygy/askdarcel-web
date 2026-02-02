import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/Navigation.module.scss";
import desktopNavigationStyles from "components/ui/Navigation/DesktopNavigation.module.scss";
import DropdownMenu from "components/ui/Navigation/DropdownMenu";
import { MobileNavigation } from "components/ui/Navigation/MobileNavigation";
import {
  ExtractedNavigationMenusFromNavigationResponse,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
  NavigationMenu,
} from "models/Strapi";
import { useNavigationData } from "hooks/StrapiAPI";
import { useTypesenseFacets } from "hooks/TypesenseHooks";
import { categoryToSlug } from "utils/categoryIcons";
import { Router } from "../../../Router";
import NavigationFocusReset from "./NavigationFocusReset";
import SkipButton from "./SkipButton";
import TopBanner from "./TopBanner";
import { SiteSearchInput } from "components/ui/SiteSearchInput";
import { SearchProvider } from "../../../search";
import { Loader } from "components/ui/Loader";
import classNames from "classnames";
import { EmailSignup } from "components/EmailSignup/Emailsignup";

export const Navigation = () => {
  const { data: navigationResponse } = useNavigationData();
  const facets = useTypesenseFacets();

  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menuData =
    extractNavigationMenusFromNavigationResponse(navigationResponse);

  // Create dynamic services menu from Typesense categories
  const servicesMenu = useMemo(() => {
    if (!facets) return null;

    return {
      id: 999, // Use a unique ID that won't conflict
      title: "Services",
      link: facets.categories.map((category, index) => ({
        id: index,
        url: `/${categoryToSlug(category.value)}/results`,
        text: category.value,
      })),
    };
  }, [facets]);

  function menuItemHasLinks(
    menuItem: ExtractedNavigationMenusFromNavigationResponse[number]
  ): menuItem is NavigationMenu {
    return "link" in menuItem;
  }

  if (!menuData || !facets) {
    return <Loader />;
  }

  // Filter out any "Services" menu from Strapi and replace with dynamic one
  const filteredMenuData = menuData.filter(
    (item) => !("title" in item && item.title === "Services")
  );

  // Combine filtered Strapi menus with dynamic services menu
  const combinedMenuData = servicesMenu
    ? [servicesMenu, ...filteredMenuData]
    : filteredMenuData;

  return (
    <SearchProvider>
      <NavigationFocusReset />
      <SkipButton />
      <TopBanner />
      <div>
        <nav className={styles.siteNav}>
          <div className={styles.primaryRow}>
            <Link className={`${styles.navLogo}`} to="/" aria-label="Homepage">
              <img src={logoData?.url} alt="" />
            </Link>
            <SiteSearchInput />

            <MobileNavigation menuData={combinedMenuData} />
            <div
              className={classNames(
                styles.desktopNavigationContainer,
                "no-print"
              )}
            >
              {combinedMenuData.map((menuDataItem) => {
                if (menuItemHasLinks(menuDataItem)) {
                  const links = menuDataItem.link.map((linkItem) => ({
                    id: linkItem.id,
                    url: linkItem.url,
                    text: linkItem.text,
                  }));

                  const uniqueKey = crypto.randomUUID();

                  return (
                    <DropdownMenu
                      key={uniqueKey}
                      id={uniqueKey}
                      title={menuDataItem.title}
                      links={links}
                    />
                  );
                }

                const uniqueKey = crypto.randomUUID();
                return (
                  <Link
                    key={uniqueKey}
                    to={menuDataItem.url}
                    className={desktopNavigationStyles.navigationMenuLink}
                  >
                    {menuDataItem.text}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
        <main className="container" id="main">
          <Router />
          <EmailSignup />
        </main>
      </div>
    </SearchProvider>
  );
};

export default Navigation;
