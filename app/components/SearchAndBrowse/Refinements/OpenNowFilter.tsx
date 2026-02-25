import React, { useState } from "react";
import { useRefinementList } from "react-instantsearch";
import { getCurrentDayTime } from "utils/index";
import { useSearchCapabilities } from "../../../search/hooks";
import styles from "./RefinementFilters.module.scss";

/**
 * A custom Algolia InstantSearch RefinementList widget representing the Open
 * Now checkbox.
 *
 * We implement this as a custom widget because we want to show users a
 * different representation of the search parameter than is actually stored
 * internally. Internally the open_times attribute is represented as an array of
 * times in 30-minute chunks, where the presence of a chunk indicates that the
 * organization or service is open during that chunk. Externally, we only want
 * to present a binary Open Now filter where activating the filter means
 * filtering for schedules where an open_times chunk exists for the user's
 * current local time.
 *
 * For example, if it is Sunday 10:00 AM locally, then enabling the Open Now
 * filter should filter for organizations or services which have 'Su-10:00' in
 * the open_times array.
 */
const OpenNowFilter = () => {
  const { facetableFields } = useSearchCapabilities();
  const canShowOpenNow = facetableFields.includes("open_times");

  // Don't render if provider doesn't support open_times facet
  // Early return to avoid calling useRefinementList hook
  if (!canShowOpenNow) {
    return null;
  }

  return <OpenNowFilterContent />;
};

/**
 * Internal component that uses the InstantSearch hook
 * This is separated so we only call useRefinementList when the feature is supported
 */
const OpenNowFilterContent = () => {
  const { refine } = useRefinementList({ attribute: "open_times" });
  const [isChecked, setChecked] = useState(false);

  const toggleRefinement = () => {
    const currentDayTime = getCurrentDayTime();
    setChecked((prev) => !prev);
    refine(currentDayTime);
  };

  return (
    <label key="openNow" className={styles.checkBox}>
      Open Now
      <input
        type="checkbox"
        name="openNow"
        id="openNow"
        className={styles.refinementInput}
        value="openNow"
        checked={isChecked}
        onChange={toggleRefinement}
      />
    </label>
  );
};

export default OpenNowFilter;
