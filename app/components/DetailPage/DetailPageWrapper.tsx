import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ActionSidebar } from "components/DetailPage";
import styles from "./DetailPageWrapper.module.scss";
import { DetailAction } from "models";

type DetailPageWrapperProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  sidebarActions: DetailAction[];
  onClickAction: (action: DetailAction) => void;
};

const DetailPageWrapper = ({
  title,
  description,
  children,
  sidebarActions,
  onClickAction,
}: DetailPageWrapperProps) => {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className={styles[`detail-wrapper`]}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <article className={styles.detail} id="resource">
        <div className={styles["detail--main"]}>
          <div className={styles["detail--main--left"]}>{children}</div>
          <div className={`${styles["detail--aside"]} no-print`}>
            <ActionSidebar
              actions={sidebarActions}
              onClickAction={onClickAction}
            />
          </div>
        </div>
      </article>
    </div>
  );
};
export default DetailPageWrapper;
