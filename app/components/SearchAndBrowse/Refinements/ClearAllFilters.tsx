import React from "react";

import { Button } from "components/ui/inline/Button/Button";
import { useClearRefinements } from "react-instantsearch";
import { useAppContextUpdater } from "utils";

/**
 * Filter clearing component that handles both facet clearing and map boundary reset
 */
const ClearAllFilter = () => {
  const { setAroundRadius } = useAppContextUpdater();
  const { refine } = useClearRefinements();
  return (
    <Button
      tabIndex={0}
      variant="linkBlue"
      onClick={() => {
        refine();
        setAroundRadius("all");
      }}
      mobileFullWidth={false}
      size="lg"
    >
      Clear all
    </Button>
  );
};

export default ClearAllFilter;
