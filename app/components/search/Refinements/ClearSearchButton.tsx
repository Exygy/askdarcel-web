import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import { useInstantSearch } from "react-instantsearch-core";

const ClearSearchButton = () => {
  const { setIndexUiState } = useInstantSearch();

  // Algolia provides a hook that can manage the query state, specifically *clearing*:
  // ```
  // const { clear } = useSearchBox();
  // onClick(() => clear);
  // ```
  // However, in practice using this hook causes unnecessary re-renders when no results are returned.
  // Fortunately, we can use another hook set the index state manually.
  const handleOnClick = () =>
    setIndexUiState({
      query: "",
      page: 0,
    });

  return (
    <Button
      variant="linkBlue"
      size="lg"
      mobileFullWidth={false}
      onClick={handleOnClick}
    >
      Clear Search
    </Button>
  );
};

export default ClearSearchButton;
