import React, { useCallback } from "react";
import { Button } from "components/ui/inline/Button/Button";
import { useInstantSearch } from "react-instantsearch-core";

const ClearSearchButton = ({ onClearAll }: { onClearAll?: () => void }) => {
  const { setIndexUiState } = useInstantSearch();

  const handleOnClick = useCallback(() => {
    if (onClearAll) {
      // Full clear: query + filters + location marker
      onClearAll();
    } else {
      // Fallback: query only (e.g. when used outside a page that owns filter state)
      setIndexUiState((prev) => ({ ...prev, query: "" }));
    }
  }, [onClearAll, setIndexUiState]);

  return (
    <Button
      variant="linkBlue"
      size="lg"
      mobileFullWidth={false}
      onClick={handleOnClick}
    >
      <span className="no-print" data-testid={"clear-search-button"}>
        Clear Search
      </span>
    </Button>
  );
};

export default ClearSearchButton;
