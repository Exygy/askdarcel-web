import React from "react";
// import { Refinement, RefinementValue } from "react-instantsearch-core";
import { Button } from "components/ui/inline/Button/Button";
import { CurrentRefinements } from "react-instantsearch";
// import { RefinementList } from "react-instantsearch/dom";

const ClearAllFilter = ({ items, refine, setSearchRadius }: any) => (
  <Button
    tabIndex={0}
    variant="linkBlue"
    onClick={() => {
      refine(items);
      setSearchRadius("all");
    }}
    mobileFullWidth={false}
    size="lg"
  >
    Clear all
  </Button>
);

export default ClearAllFilter;
