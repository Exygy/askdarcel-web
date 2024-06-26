import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "utils";
import { useNavigationData } from "hooks/StrapiAPI";
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
  }

  return (
    <nav className={siteNavStyle}>
      <div className={styles.primaryRow}>
        <div className={styles.navLeft}>
          <SiteLogo src={data?.logo.url} />
        </div>

        <SiteLinks />

        {showMobileNav && (
          <div className={styles.mobileNavigation}>
            <button
              type="button"
              aria-label="search for a service"
              className={styles.searchButton}
              onClick={() => setShowSecondarySearch(!showSecondarySearch)}
            />
            <button
              type="button"
              aria-label="navigation menu"
              className={styles.hamburgerButton}
              onClick={toggleHamburgerMenu}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

const SiteLogo = ({ src }: {}) =>
  /^https?:\/\//.test(logoLinkDestination) ? (
    <a
      className={`${navLogoStyle} ${styles.navLogo}`}
      href={logoLinkDestination}
    >
      <img src={src} alt={title} />
    </a>
  ) : (
    <Link className={`${navLogoStyle} ${styles.navLogo}`} to="/">
      <img src={src} alt={title} />
    </Link>
  );

const SiteLinks = () => {
  const { authState } = useAppContext();

  return (
    <ul className={styles.navRight}>
      {/* Todo: This will eventually be replaced by a user icon with a dropdown menu of account related options.
          The designs are still forthcoming. For now, it serves as a basic log-out functionality for the purposes
          of development and testing.
      */}
      {authState && (
        <li>
          <Link to="/log-out">Log Out</Link>
        </li>
      )}
      <Translate />
    </ul>
  );
};

export default SiteSearch;
