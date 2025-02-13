import React from "react";
import { Loader } from "components/ui/Loader";
import { useFaqPageData } from "hooks/StrapiAPI";
import { Masthead } from "../../components/ui/Masthead/Masthead";
import { FaqPageContent, StrapiDatum } from "models/Strapi";
import Accordion from "components/ui/Accordions/Accordion";
import styles from "./FaqPage.module.scss";

export const FaqPage = () => {
  const { data, isLoading } = useFaqPageData();

  const res = data as StrapiDatum<FaqPageContent>;

  const pageData = res?.attributes || null;
  const image = {
    url: pageData?.image?.data?.attributes?.url,
    alternativeText:
      pageData?.image?.data?.attributes?.alternativeText ?? "FAQ page image",
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    pageData && (
      <div>
        <Masthead title={pageData.masthead} />
        <div className={styles["faq-page-container"]}>
          <div className={styles["faq-page-content"]}>
            {pageData.faq && (
              <div>
                <h2>{pageData.headercontent}</h2>
                <Accordion items={pageData.faq} />
              </div>
            )}
            {pageData.image && (
              <div>
                <img src={image.url} alt={image.alternativeText} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};
