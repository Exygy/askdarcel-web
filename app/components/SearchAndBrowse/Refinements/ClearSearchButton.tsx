import React, { useCallback } from "react";
import { Button } from "components/ui/inline/Button/Button";
import { useInstantSearch } from "react-instantsearch-core";

const ClearSearchButton = () => {
  const { setIndexUiState } = useInstantSearch();

  // Clear the search query without creating a search box widget
  const handleOnClick = useCallback(() => {
    setIndexUiState((prev) => ({ ...prev, query: "" }));
  }, [setIndexUiState]);

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
