import React from "react";

// import type { Refinement, RefinementValue } from "react-instantsearch-core";
import { Button } from "components/ui/inline/Button/Button";

// type Props = {
//   items: Refinement[];
//   refine: (value: Refinement[] | RefinementValue | RefinementValue[]) => void;
//   setSearchRadius: (radius: string) => void;
// };

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
