import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import { useSearchQuery } from "../../../search/hooks";

const ClearSearchButton = () => {
  const { clearQuery } = useSearchQuery();

  // Clear the search query when the button is clicked
  const handleOnClick = () => {
    clearQuery();
  };

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
