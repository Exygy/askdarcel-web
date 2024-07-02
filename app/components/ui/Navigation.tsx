import React, { useState } from "react";
import { Link } from "react-router-dom";
import Translate from "components/ui/Translate";
import styles from "components/ui/Navigation.module.scss";
import { push as Menu } from "react-burger-menu";
import {
  StrapiModel,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
} from "../../models/Strapi";
import { PopUpMessage, PopupMessageProp } from "../../components/ui";
import { Router } from "../../Router";
import { useNavigationData } from "../../hooks/StrapiAPI";
import { OUTER_CONTAINER_ID } from "../../App";

const PAGE_WRAP_ID = "page-wrap";
const BURGER_STYLES = {
  bmBurgerButton: {
    display: "none",
  },
  bmCrossButton: {
    display: "none",
  },
  bmMenu: {
    padding: "0",
    borderLeft: "1px solid #f4f4f4",
  },
  bmOverlay: {
    display: "none",
  },
};

const Navigation = () => {
  const [mobileNavIsOpen, setmobileNavIsOpen] = useState(false);
  const toggleMobileNav = () => setmobileNavIsOpen((prev) => !prev);
  const [popUpMessage, setPopUpMessage] = useState<PopupMessageProp>({
    message: "",
    visible: false,
    type: "success",
  });
  const { data: navigationResponse, error, isLoading } = useNavigationData();
  const [dropdown, setDropdown] = useState(false);
  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menus =
    extractNavigationMenusFromNavigationResponse(navigationResponse);

  // TODO
  if (error) {
    return <span>ERROR</span>;
  }

  // TODO
  if (isLoading) {
    return <span>is loading...</span>;
  }

  interface NavigationMenuProps {
    menus: StrapiModel.NavigationMenu[];
  }
  const NavigationMenu: React.FC<NavigationMenuProps> = ({
    menus,
  }): JSX.Element => (
    <>
      {menus.map((menu) => (
        <div key={menu.id.toString()}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdown ? "true" : "false"}
            onClick={() => setDropdown((prev) => !prev)}
          >
            {menu.title}
          </button>

          <ul>
            {menu.link.map((linkItem: StrapiModel.Link) => (
              <li key={linkItem.id} className="menu-item">
                <Link to={linkItem.url}>{linkItem.text}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Translate />
    </>
  );

  return (
    <>
      {mobileNavIsOpen && (
        <span className={styles.hamburgerContainer}>
          <Menu
            isOpen={mobileNavIsOpen}
            onStateChange={() => toggleMobileNav}
            outerContainerId={OUTER_CONTAINER_ID}
            pageWrapId={PAGE_WRAP_ID}
            right
            styles={BURGER_STYLES}
            width="275px"
          >
            {mobileNavIsOpen && menus?.length && (
              <NavigationMenu menus={menus} />
            )}
          </Menu>
        </span>
      )}
      <div id={PAGE_WRAP_ID}>
        <nav className={styles.siteNav}>
          <div className={styles.primaryRow}>
            <div className={styles.navLeft}>
              <Link className={`${styles.navLogo}`} to="/">
                <img src={logoData?.url} alt={logoData?.alternativeText} />
              </Link>
            </div>

            <ul className={styles.navRight}>
              {menus?.length && <NavigationMenu menus={menus} />}
            </ul>
            <div className={styles.mobileNavigation}>
              <button
                type="button"
                aria-label="navigation menu"
                className={styles.hamburgerButton}
                onClick={toggleMobileNav}
              />
            </div>
          </div>
        </nav>
        <div className="container">
          <Router setPopUpMessage={setPopUpMessage} />
        </div>
        {popUpMessage && <PopUpMessage popUpMessage={popUpMessage} />}
      </div>
    </>
  );
};

export default Navigation;
