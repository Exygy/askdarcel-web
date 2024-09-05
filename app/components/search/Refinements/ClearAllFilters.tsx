import React from "react";

// import type { Refinement, RefinementValue } from "react-instantsearch-core";
import { Button } from "components/ui/inline/Button/Button";
import { useClearRefinements } from "react-instantsearch";
import { AroundRadius } from "algoliasearch";

const ClearAllFilter = ({
  setSearchRadius,
}: {
  setSearchRadius: (radius: AroundRadius) => void;
}) => {
  const { refine, canRefine, createURL } = useClearRefinements();
  return (
    <Button
      tabIndex={0}
      variant="linkBlue"
      onClick={() => {
        refine();
        setSearchRadius("all");
      }}
      mobileFullWidth={false}
      size="lg"
    >
      Clear all
    </Button>
  );
};

export default ClearAllFilter;
