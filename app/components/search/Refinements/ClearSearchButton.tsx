import React from "react";
import { Button } from "components/ui/inline/Button/Button";
import { useInstantSearch } from "react-instantsearch-core";

const ClearSearchButton = () => {
  const { setIndexUiState } = useInstantSearch();

  // Algolia does provide a hook that can manage the query state, specifically *clearing*:
  // ```
  // const { clear } = useSearchBox();
  // onClick(() => clear);
  // ```
  // However in practice using this hook results in unexpected behavior in which it ends causing
  // unnecessary re-renders when no results are returned. Fortunately resetting the index state
  // achieves what we need.
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
