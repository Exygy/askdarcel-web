import React from "react";
import { Loader } from "components/ui/Loader";
import {
  SingleColumnContentBlockResponse,
  useContentPageData,
} from "hooks/StrapiAPI";
import { Masthead } from "../../components/ui/Masthead/Masthead";
import { TwoColumnContentSection } from "../../components/ui/TwoColumnContentSection/TwoColumnContentSection";
import { PageContent, StrapiDatum, TwoColumnContentBlock } from "models/Strapi";
import { SingleColumnContentSection } from "components/ui/TwoColumnContentSection/SingleColumnContentSection";

export const FaqPage = () => {
  const { data, isLoading } = useContentPageData("FAQ");

  const res = data as Array<StrapiDatum<PageContent>>;

  const pageData = res?.length ? res[0].attributes : null;

  if (isLoading) {
    return <Loader />;
  }

  return (
    pageData && (
      <>
        <Masthead title={pageData.masthead} />
        {pageData.content_block?.map((contentBlock) =>
          contentBlock.__component === "content.single-column-content-block" ? (
            <SingleColumnContentSection
              key={contentBlock.id}
              {...contentBlock}
            />
          ) : (
            <TwoColumnContentSection
              key={contentBlock.id}
              // TODO: Let's see if we can find a better way to narrow the type
              // without having to force it here
              {...(contentBlock as TwoColumnContentBlock)}
            />
          )
        )}
      </>
    )
  );
};
