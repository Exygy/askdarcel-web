import React from "react";
import styles from "./SingleColumnContentSection.module.scss";
import { Button } from "../inline/Button/Button";
import { SingleColumnContentBlockResponse } from "hooks/StrapiAPI";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

/**
 * Displays a section with two columns, typically text next to media
 *
 * TODO: media can be a video URL, update component to handle
 * TODO: update use srcset and the different media sizes for images
 */
export const SingleColumnContentSection = (
  props: SingleColumnContentBlockResponse
) => {
  const { content } = props;

  return (
    <section
      className={styles.SingleColumnContentSectionContainer}
      data-testid={"single-column-content-section"}
    >
      <div>
        <div className={styles.innerContainer}>
          <BlocksRenderer content={content} />
        </div>
      </div>
    </section>
  );
};
