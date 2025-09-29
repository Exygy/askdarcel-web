import React from "react";
import { Button } from "./inline/Button/Button";
import styles from "./PageNotFound.module.scss";

export enum NotFoundType {
  ORGANIZATION_INACTIVE = "organization_inactive",
  SERVICE_INACTIVE = "service_inactive",
  ORGANIZATION_NOT_FOUND = "organization_not_found",
  SERVICE_NOT_FOUND = "service_not_found",
  EVENT_NOT_FOUND = "event_not_found",
  PAGE_NOT_FOUND = "page_not_found",
}

interface NotFoundContent {
  header: string;
  body: string;
  ctaText: string;
  ctaLink: string;
}

const notFoundConfig: Record<NotFoundType, NotFoundContent> = {
  [NotFoundType.ORGANIZATION_INACTIVE]: {
    header: "Resource not active",
    body: "This organization is currently inactive. It may become active again at a future date, or be permanently discontinued.",
    ctaText: "Browse organizations",
    ctaLink: "/search",
  },
  [NotFoundType.SERVICE_INACTIVE]: {
    header: "Resource not active",
    body: "This service is currently inactive. It may become active again at a future date, or be permanently discontinued.",
    ctaText: "Browse services",
    ctaLink: "/search",
  },
  [NotFoundType.ORGANIZATION_NOT_FOUND]: {
    header: "Resource does not exist",
    body: "This organization cannot be found.",
    ctaText: "Browse organizations",
    ctaLink: "/search",
  },
  [NotFoundType.SERVICE_NOT_FOUND]: {
    header: "Resource does not exist",
    body: "This service cannot be found.",
    ctaText: "Browse services",
    ctaLink: "/search",
  },
  [NotFoundType.EVENT_NOT_FOUND]: {
    header: "Event details not found",
    body: "This event cannot be found.",
    ctaText: "Browse events",
    ctaLink: "/",
  },
  [NotFoundType.PAGE_NOT_FOUND]: {
    header: "Page not found",
    body: "This page cannot be found. It may have been moved or deleted.",
    ctaText: "Go to homepage",
    ctaLink: "/",
  },
};

interface PageNotFoundProps {
  type?: NotFoundType;
  isInactive?: boolean;
}

const PageNotFound: React.FC<PageNotFoundProps> = ({
  type = NotFoundType.PAGE_NOT_FOUND,
}) => {
  // Handle legacy isInactive prop for backward compatibility
  const config = notFoundConfig[type];

  return (
    <div>
      <h1>{config.header}</h1>
      <p className={styles.description}>{config.body}</p>
      <Button href={config.ctaLink} arrowVariant="after">
        {config.ctaText}
      </Button>
    </div>
  );
};

export default PageNotFound;
