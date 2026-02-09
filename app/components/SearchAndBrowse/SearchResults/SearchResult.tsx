import React, { forwardRef } from "react";
import type { SearchHit } from "../../../search/types";
import { Link } from "react-router-dom";
import { LabelTag } from "components/ui/LabelTag";
import { formatPhoneNumber, renderAddressMetadata } from "utils";
import { removeAsterisksAndHashes } from "utils/strings";
import ReactMarkdown from "react-markdown";
import styles from "./SearchResults.module.scss";

interface SearchResultProps {
  hit: SearchHit;
  index: number;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SearchResult = forwardRef<HTMLDivElement, SearchResultProps>(
  (props, ref) => {
    const { hit, index, isHighlighted, onMouseEnter, onMouseLeave } = props;

    return (
      // ref is for focusing on the first search hit when user paginates and scrolls to top
      <div
        className={`${styles.searchResult} ${
          isHighlighted ? styles.searchResultHighlighted : ""
        }`}
        ref={ref}
        tabIndex={-1}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={styles.searchResultContentContainer}>
          <div>
            <div className={styles.titleContainer}>
              <div>
                <h2 className={styles.title}>
                  <Link
                    to={{
                      pathname:
                        hit.type === "service"
                          ? `/services/${hit.service_id}`
                          : `/organizations/${hit.organization_id}`,
                    }}
                    className={`notranslate ${styles.titleLink}`}
                  >
                    {hit.name}
                  </Link>
                </h2>
                {hit.type === "service" && (
                  <div className={styles.serviceOf}>
                    <Link
                      to={`/organizations/${hit.organization_id}`}
                      className={`notranslate ${styles.serviceOfLink}`}
                    >
                      {hit.organization_name}
                    </Link>
                  </div>
                )}
              </div>
              <div className={styles.searchResultSubcatContainer}>
                <LabelTag label={hit.type} />
              </div>
            </div>
          </div>
          <div className="print-only">
            <p>
              <strong>Call:</strong> {hit.phoneNumber}
            </p>
            <p>
              <strong>Website:</strong> {hit.websiteUrl}
            </p>
          </div>
          <div className={styles.searchResultContent}>
            <div className={styles.searchText}>
              <div className={`notranslate ${styles.address}`}>
                {renderAddressMetadata(hit)}
              </div>
              {/* Once we can update all dependencies, we can add remarkBreaks as remarkPlugin here */}
              <ReactMarkdown
                className={`rendered-markdown ${styles.description}`}
                linkTarget="_blank"
              >
                {hit.description
                  ? removeAsterisksAndHashes(hit.description)
                  : ""}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <div className={`${styles.sideLinks} no-print`}>
          {hit.phoneNumber && (
            <a
              href={`tel:${hit.phoneNumber}`}
              className={`${styles.icon} ${styles["icon-phone"]}`}
              title={`Call ${formatPhoneNumber(hit.phoneNumber)}`}
            >
              <span className="sr-only">
                Call {formatPhoneNumber(hit.phoneNumber)}
              </span>
            </a>
          )}
          {hit.organization_website && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={hit.organization_website}
              className={`${styles.icon} ${styles["icon-popout"]}`}
              title="Go to website"
            >
              <span className="sr-only">Go to website</span>
            </a>
          )}
        </div>
      </div>
    );
  }
);
