import React from "react";
import { SearchHit } from "models";
import { Link } from "react-router-dom";
import { LabelTag } from "components/ui/LabelTag";
import { Tooltip } from "react-tippy";
import { formatPhoneNumber, renderAddressMetadata } from "utils";
import { removeAsterisksAndHashes } from "utils/strings";
import ReactMarkdown from "react-markdown";
import styles from "./SearchResults.module.scss";

export const SearchResult = ({
  hit,
  index,
}: {
  hit: SearchHit;
  index: number;
  // categoryId: string | undefined;
}) => {
  // Keep for Phase 2:
  // const [textingIsOpen, setTextingIsOpen] = useState(false);

  // let listing: TextListing;
  // if (hit.type === "service") {
  //   listing = {
  //     listingName: hit.name,
  //     type: hit.type,
  //     serviceId: hit.id,
  //   };
  // } else {
  //   listing = {
  //     listingName: hit.name,
  //     type: hit.type,
  //     resourceId: hit.id,
  //   };
  // }

  // const toggleTextingModal = () => setTextingIsOpen(!textingIsOpen);
  // TODO: this bookmarkAdded boolean should be set in accordance with the value of the bookmark model
  // returned by the API. Fetching the model from the API will need to be done in such a way that it does not
  // block the rendering of the search results and yet does not cause the button to flash in a distracting manner

  // const texting = (
  //   <div
  //     className={styles.sideLink}
  //     data-field="text-me"
  //     role="button"
  //     tabIndex={0}
  //     onClick={toggleTextingModal}
  //   >
  //     <img
  //       src={icon("text-message")}
  //       alt="chat-bubble"
  //       className={styles.sideLinkIcon}
  //     />
  //     <div className={styles.sideLinkText}>Text me the info</div>
  //   </div>
  // );

  const phoneNumber = hit?.phones?.[0]?.number;
  const url = hit.type === "service" ? hit.url : hit.website;
  const basePath = hit.type === "service" ? `services` : `organizations`;

  // TODO: since hit -> categories just come in as one array of category names, we need to compare them against a hardcoded list of top-level categories and display the ones that are NOT top-level in the subcategory LabelTags. Awaiting that PR.

  return (
    <div className={styles.searchResult}>
      {/* Keep for Phase 2: */}
      {/* <Texting
        closeModal={toggleTextingModal}
        listing={listing}
        isShowing={textingIsOpen}
      /> */}
      <div className={styles.searchResultContentContainer}>
        <div>
          <div className={styles.titleContainer}>
            <div>
              <h2 className={styles.title}>
                {index}.{" "}
                <Link
                  to={{ pathname: `/${basePath}/${hit.id}` }}
                  className={`notranslate ${styles.titleLink}`}
                >
                  {hit.name}
                </Link>
              </h2>
              {hit.type === "service" && (
                <div className={styles.serviceOf}>
                  <Link
                    to={`/organizations/${hit.resource_id}`}
                    className={`notranslate ${styles.serviceOfLink}`}
                  >
                    {hit.service_of}
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.searchResultSubcatContainer}>
              {hit.categories.length > 0 && (
                <LabelTag label={hit.categories[0].toString()} />
              )}
              {hit.categories.length > 1 && (
                <Tooltip
                  title={hit.categories.slice(1).join(", ")}
                  position="top"
                  trigger="mouseenter"
                  delay={100}
                  animation="none"
                  arrow
                >
                  <LabelTag
                    label={`+${hit.categories.length - 1}`}
                    withTooltip
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div className={styles.searchResultContent}>
          <div className={styles.searchText}>
            <div className={`notranslate ${styles.address}`}>
              {renderAddressMetadata(hit)}
            </div>
            {/* Once we can update all dependencies, we can add remarkBreaks as remarkPlugin here */}
            <ReactMarkdown
              className={`rendered-markdown ${styles.description}`}
              source={
                hit.long_description
                  ? removeAsterisksAndHashes(hit.long_description)
                  : undefined
              }
              linkTarget="_blank"
            />
          </div>
        </div>
      </div>
      <div className={styles.sideLinks}>
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className={`${styles.icon} ${styles["icon-phone"]}`}
          >
            <span className="sr-only">
              Call {formatPhoneNumber(phoneNumber)}
            </span>
          </a>
        )}
        {url && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={url}
            className={`${styles.icon} ${styles["icon-popout"]}`}
          >
            <span className="sr-only">Go to website</span>
          </a>
        )}
        {/* Keep for phase 2: */}
        {/* {texting} */}
      </div>
    </div>
  );
};
