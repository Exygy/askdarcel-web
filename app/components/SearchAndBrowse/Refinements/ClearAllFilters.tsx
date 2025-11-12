import React from "react";

import { Button } from "components/ui/inline/Button/Button";
import { useClearRefinements } from "../../../search/hooks";
import { useAppContextUpdater } from "utils";

/**
 * Filter clearing component that handles both facet clearing and map boundary reset
 */
const ClearAllFilter = () => {
  const { setAroundRadius } = useAppContextUpdater();
  const { clearAll } = useClearRefinements();
  return (
    <Button
      tabIndex={0}
      variant="linkBlue"
      onClick={() => {
        clearAll();
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
