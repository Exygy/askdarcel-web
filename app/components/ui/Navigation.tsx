import React, { useState } from "react";
import { Link } from "react-router-dom";
import Translate from "components/ui/Translate";
import navigationStyles from "components/ui/Navigation.module.scss";
import { push as Menu } from "react-burger-menu";
import {
  StrapiModel,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
} from "../../models/Strapi";
import { PopUpMessage, PopupMessageProp } from "../../components/ui";
import { Router } from "../../Router";
import { useNavigationData } from "../../hooks/StrapiAPI";

const outerContainerId = "outer-container";
const pageWrapId = "page-wrap";
const burgerStyles = {
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

// Until new nav is introduced, screen reader is reading hamburger links on desktop. This fixes that.

const Navigation = () => {
  const [hamburgerisOpen, setHamburgerisOpen] = useState(false);
  const toggleHamburgerMenu = () => setHamburgerisOpen((prev) => !prev);
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
      <Menu
        isOpen={hamburgerisOpen}
        onStateChange={() => toggleHamburgerMenu}
        outerContainerId={outerContainerId}
        pageWrapId={pageWrapId}
        right
        styles={burgerStyles}
        width="275px"
      >
        {menus?.length && <NavigationMenu menus={menus} />}
      </Menu>
      <div id={pageWrapId}>
        <nav className={navigationStyles.siteNav}>
          <div className={navigationStyles.primaryRow}>
            <div className={navigationStyles.navLeft}>
              <Link className={`${navigationStyles.navLogo}`} to="/">
                <img src={logoData?.url} alt={logoData?.alternativeText} />
              </Link>
            </div>

            <ul className={navigationStyles.navRight}>
              {menus?.length && <NavigationMenu menus={menus} />}
            </ul>
            <div className={navigationStyles.mobileNavigation}>
              <button
                type="button"
                aria-label="navigation menu"
                className={navigationStyles.hamburgerButton}
                onClick={toggleHamburgerMenu}
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
