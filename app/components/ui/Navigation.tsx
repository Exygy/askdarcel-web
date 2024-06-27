import React from "react";
import { Link } from "react-router-dom";
import {
  StrapiModel,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
} from "models/Strapi";
import Translate from "components/ui/Translate";
import { useNavigationData } from "../../hooks/StrapiAPI";
import styles from "./Navigation.module.scss";

export const Navigation = ({
  toggleHamburgerMenu,
}: {
  toggleHamburgerMenu: () => void;
}) => {
  const { data: navigationResponse, error, isLoading } = useNavigationData();
  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menuData =
    extractNavigationMenusFromNavigationResponse(navigationResponse);

  // TODO
  if (error) {
    return <span>ERROR</span>;
  }

  // TODO
  if (isLoading) {
    return <span>is loading...</span>;
  }

  return (
    <nav className={styles.siteNav}>
      <div className={styles.primaryRow}>
        <div className={styles.navLeft}>
          <Link className={`${styles.navLogo}`} to="/">
            <img src={logoData?.url} alt={logoData?.alternativeText} />
          </Link>
        </div>

        <ul className={styles.navRight}>
          {menuData?.map((item) => (
            <>
              <span>{item.title}</span>
              {item.link.map((linkItem: StrapiModel.Link) => (
                <Link to={linkItem.url}>{linkItem.text}</Link>
              ))}
            </>
          ))}
          <Translate />
        </ul>
        <div className={styles.mobileNavigation}>
          <button
            type="button"
            aria-label="navigation menu"
            className={styles.hamburgerButton}
            onClick={toggleHamburgerMenu}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
