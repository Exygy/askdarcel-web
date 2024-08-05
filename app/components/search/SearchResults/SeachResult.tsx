import React from "react";
import { SearchHit } from "models";
import { Link } from "react-router-dom";
import { LabelTag } from "components/ui/LabelTag";
import { Tooltip } from "react-tippy";
import { formatPhoneNumber, renderAddressMetadata } from "utils";
import { removeAsterisksAndHashes } from "utils/strings";
import ReactMarkdown from "react-markdown";
import styles from "./SearchResults.module.scss";

export const SearchResult = ({ hit }: { hit: SearchHit }) => {
  return (
    <div className={styles.searchResult}>
      <div className={styles.searchResultContentContainer}>
        <div>
          <div className={styles.titleContainer}>
            <div>
              <h2 className={styles.title}>
                {hit.hitIndex}.{" "}
                <Link
                  to={{ pathname: hit.path }}
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
        {hit.phoneNumber && (
          <a
            href={`tel:${hit.phoneNumber}`}
            className={`${styles.icon} ${styles["icon-phone"]}`}
          >
            <span className="sr-only">
              Call {formatPhoneNumber(hit.phoneNumber)}
            </span>
          </a>
        )}
        {hit.url && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={hit.url}
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
