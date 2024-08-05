import React from "react";
import MobileMenuItems from "./MobileMenuItems";
import styles from "components/ui/Navigation/MobileNavigation.module.scss";
import { push as SidebarPushPanel } from "react-burger-menu";
import { ExtractedNavigationMenusFromNavigationResponse } from "../../../models/Strapi";
import { OUTER_CONTAINER_ID } from "../../../App";

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
    background: "white",
  },
  bmOverlay: {
    display: "none",
  },
};

const MobileNavigation = ({
  isOpen,
  setIsOpen,
  menuData,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  menuData: ExtractedNavigationMenusFromNavigationResponse | null;
}) => {
  const [activeMobileSubMenu, setActiveMobileSubMenu] = React.useState("");

  const closeMobileMenu = () => {
    setIsOpen(false);
    setActiveMobileSubMenu("");
  };

  return (
    <SidebarPushPanel
      isOpen={isOpen}
      outerContainerId={OUTER_CONTAINER_ID}
      pageWrapId={PAGE_WRAP_ID}
      right
      styles={BURGER_STYLES}
      width="275px"
    >
      <div className={styles.mobileNavigationContainer}>
        {menuData?.map((menuDataItem) => (
          <MobileMenuItems
            menuItem={menuDataItem}
            activeMobileSubMenu={activeMobileSubMenu}
            setActiveMobileSubMenu={setActiveMobileSubMenu}
            closeMobileMenu={closeMobileMenu}
            key={menuDataItem.id}
          />
        ))}
      </div>
    </SidebarPushPanel>
  );
};

export default MobileNavigation;
