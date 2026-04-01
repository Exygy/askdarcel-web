import React, { useId } from "react";
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
import { Button } from "components/ui/inline/Button/Button";
import styles from "./FilterHeader.module.scss";

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLDivElement>;
  footer?: React.ReactNode;
}

export const FilterDropdown = ({
  isOpen,
  onClose,
  title,
  children,
  triggerRef,
  footer,
}: FilterDropdownProps) => {
  const titleId = useId();

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
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
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, update, {
        ancestorScroll: false,
      }),
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  // Sync the trigger ref with floating-ui's ref
  React.useEffect(() => {
    if (triggerRef.current) {
      refs.setReference(triggerRef.current);
    }
  }, [triggerRef, refs]);

  if (!isOpen) return null;

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: Full-screen overlay
    return (
      <FloatingPortal>
        <FloatingFocusManager context={context} modal>
          <div className={styles.filterDropdownMobileOverlay}>
            <div
              ref={refs.setFloating}
              className={styles.filterDropdownMobile}
              aria-labelledby={titleId}
              {...getFloatingProps()}
            >
              <div className={styles.filterDropdownHeader}>
                <h3
                  id={titleId}
                  className={styles.filterDropdownTitle}
                >
                  {title}
                </h3>
                <Button variant="linkBlue" onClick={onClose} size="sm">
                  Close
                </Button>
              </div>
              <div className={styles.filterDropdownContent}>{children}</div>
              {footer && (
                <div className={styles.filterDropdownFooter}>{footer}</div>
              )}
            </div>
          </div>
        </FloatingFocusManager>
      </FloatingPortal>
    );
  }

  // Desktop: Floating dropdown
  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false}>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={styles.filterDropdown}
          aria-labelledby={titleId}
          {...getFloatingProps()}
        >
          <div className={styles.filterDropdownHeader}>
            <h3
              id={titleId}
              className={styles.filterDropdownTitle}
            >
              {title}
            </h3>
            <Button variant="linkBlue" onClick={onClose} size="sm">
              Close
            </Button>
          </div>
          <div className={styles.filterDropdownContent}>{children}</div>
          {footer && (
            <div className={styles.filterDropdownFooter}>{footer}</div>
          )}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
};
