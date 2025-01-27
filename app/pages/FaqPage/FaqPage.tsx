import React from "react";
import { Loader } from "components/ui/Loader";
import { useFaqPageData, usePageContent } from "hooks/StrapiAPI";
import { Masthead } from "../../components/ui/Masthead/Masthead";
import { TwoColumnContentSection } from "../../components/ui/TwoColumnContentSection/TwoColumnContentSection";
import { FaqPageContent, StrapiDatum } from "models/Strapi";

export const FaqPage = () => {
  const { data, isLoading } = useFaqPageData();

  const res = data as StrapiDatum<FaqPageContent>;

  const pageData = res?.attributes || null;

  if (isLoading) {
    return <Loader />;
  }

  return (
    pageData && (
      <>
        <Masthead title={pageData.masthead} />
        {pageData.faq?.map((content) => (
          <TwoColumnContentSection key={content.id} {...content.attributes} />
        ))}
      </>
    )
  );
};
