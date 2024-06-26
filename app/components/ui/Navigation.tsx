import React from "react";
import { Link } from "react-router-dom";
import { useNavigationData } from "../../hooks/StrapiAPI";
import Translate from "./Translate";
import styles from "./Navigation.module.scss";

export const Navigation = ({
  toggleHamburgerMenu,
}: {
  toggleHamburgerMenu: () => void;
}) => {
  const { data, error, isLoading } = useNavigationData();

  if (error) {
    // TODO
  }

  if (isLoading) {
    // TODO
  }

  return (
    <nav className={styles.siteNav}>
      <div className={styles.primaryRow}>
        <div className={styles.navLeft}>
          <Link className={`${styles.navLogo}`} to="/">
            {data?.logo.url}
          </Link>
        </div>

        <SiteLinks />
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

const SiteLinks = () => {
  return (
    <ul className={styles.navRight}>
      <Translate />
    </ul>
  );
};

export default Navigation;
