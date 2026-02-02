import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import styles from "./FilterHeader.module.scss";

interface FilterFooterProps {
  pendingCount: number;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export const FilterFooter = ({
  pendingCount,
  onApply,
  onClear,
  onClose,
}: FilterFooterProps) => {
  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <div className={styles.filterFooter}>
      <Button variant="linkBlue" onClick={handleClear} size="sm">
        Clear filters
      </Button>
      <Button variant="primary" onClick={handleApply} size="base">
        {pendingCount > 0
          ? `Apply ${pendingCount} filter${pendingCount !== 1 ? "s" : ""}`
          : "Apply filters"}
      </Button>
    </div>
  );
};
