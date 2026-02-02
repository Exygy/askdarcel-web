import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import { useMenuToggle } from "hooks/MenuHooks";
import styles from "./DropdownMenu.module.scss";

const DropdownMenu = ({
  title,
  links,
  variant = "navigation",
  id,
}: {
  title: string;
  links: { id: number | string; url: string; text: string }[];
  variant?: "navigation" | "category";
  id: string;
}) => {
  const { activeSubMenu, handleMenuToggle } = useMenuToggle();
  const isOpen = activeSubMenu === id;

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (open) {
        handleMenuToggle(id);
      } else if (isOpen) {
        handleMenuToggle(id); // Toggle off
      }
    },
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: [
          "bottom-start",
          "bottom-end",
          "top-start",
          "top-end",
        ],
      }),
      shift({ padding: 16 }),
    ],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const containerClass = classNames(
    styles.navigationMenuContainer,
    variant === "category" && styles.categoryMenuContainer
  );

  return (
    <div className={containerClass} key={id}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : "false"}
        ref={refs.setReference}
        {...getReferenceProps()}
        className={styles.navigationMenuHeader}
      >
        {title}
        <span className={`fas fa-chevron-down ${styles.chevron}`} />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={styles.navigationSubMenu}
              {...getFloatingProps()}
            >
              {links.map((linkItem) => {
                const uuid = crypto.randomUUID();
                return (
                  <span key={uuid} className={styles.navigationSubMenuItem}>
                    <Link to={linkItem.url} className={styles.menuLink}>
                      {linkItem.text}
                    </Link>
                  </span>
                );
              })}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
};

export default DropdownMenu;
