import React, { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { CalendarEvent } from "models/Strapi";
import { DetailAction } from "../../models";
import { InfoTable } from "components/DetailPage/InfoTable";
import { DetailInfoSection } from "components/ui/Cards/DetailInfoSection";
import { formatCalendarEventDisplay } from "components/ui/Cards/FormattedDate";
import { Loader } from "components/ui/Loader";
import DetailPageWrapper from "components/DetailPage/DetailPageWrapper";
import ListingPageHeader from "components/DetailPage/PageHeader";
import { ActionBarMobile } from "components/DetailPage";
import PageNotFound, { NotFoundType } from "components/ui/PageNotFound";
import { useEventData } from "hooks/StrapiAPI";
import { LabelTag } from "components/ui/LabelTag";

type TagRow = { title: string; value: ReactNode[] };

export const EventDetailPage = () => {
  const { eventListingId } = useParams();
  const { data, error, isLoading } = useEventData(eventListingId as string);

  if (error) {
    return (
      <DetailPageWrapper
        title="Our415 - Page Error"
        description=""
        sidebarActions={[]}
        onClickAction={() => "noop"}
      >
        <PageNotFound type={NotFoundType.EVENT_NOT_FOUND} />
      </DetailPageWrapper>
    );
  }

  if (!data || isLoading) {
    return <Loader />;
  }

  // Hotfix. NOT a long term solution. Need to make sure bad event slugs are throwing 404s not 400s and that Page Not Found is rendering properly based on error = true
  if (
    data.categories === undefined &&
    data.eligibilities === undefined &&
    data.id === undefined
  ) {
    return (
      <DetailPageWrapper
        title="Our415 - Page Not Found"
        description=""
        sidebarActions={[]}
        onClickAction={() => "noop"}
      >
        <PageNotFound type={NotFoundType.EVENT_NOT_FOUND} />
      </DetailPageWrapper>
    );
  }

  const detailsRows = [
    {
      title: "Date & Time",
      value:
        data.calendar_event?.startdate &&
        formatCalendarEventDisplay(data.calendar_event as CalendarEvent),
    },
    {
      title: "Location",
      value: data.location_name,
    },
    {
      title: "Language",
      value: data.Language,
    },
  ].filter((row) => !!row.value);

  const registrationRows = [
    {
      title: "View Details",
      value: data.registration_link?.url ? (
        <a
          href={data.registration_link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.registration_link.url}
        </a>
      ) : null,
    },
  ];

  const tagRows = [
    {
      title: "Categories",
      value: data.categories?.map((category) => (
        <LabelTag key={category.id} label={category.label} />
      )),
    },
    {
      title: "Eligibilities",
      value: data.eligibilities?.map((eligibility) => (
        <LabelTag key={eligibility.id} label={eligibility.label} />
      )),
    },
    {
      title: "Age Group",
      value: data.age_group && <LabelTag label={data.age_group} />,
    },
  ].filter((row) => row.value !== undefined) as Array<TagRow>;

  const onClickAction = (action: DetailAction) => {
    switch (action.icon) {
      case "print":
        window.print();
        break;
      default:
        break;
    }
  };

  return (
    <DetailPageWrapper
      title={`Our415 - ${data.title}`}
      description={""}
      sidebarActions={[]}
      onClickAction={onClickAction}
    >
      <ListingPageHeader
        title={data.title as string}
        dataCy="event-page-title"
      />

      <span className="no-print">
        <ActionBarMobile actions={[]} onClickAction={onClickAction} />
      </span>

      <DetailInfoSection
        title="About"
        data-testid="eventdetailpage-detailinfosection"
      >
        <BlocksRenderer content={data.description || []} />
      </DetailInfoSection>

      <DetailInfoSection
        title="Details"
        data-testid="eventdetailpage-detailinfosection"
      >
        <InfoTable<{ title: string; value: ReactNode }>
          rowRenderer={(detail) => (
            <tr key={detail.title}>
              <th>{detail.title}</th>
              <td>{detail.value}</td>
            </tr>
          )}
          rows={detailsRows}
        />
      </DetailInfoSection>

      {data.registration_link?.url && (
        <DetailInfoSection
          title="Additional Information"
          data-testid="eventdetailpage-detailinfosection"
        >
          <InfoTable<{ title: string; value: ReactNode }>
            rowRenderer={(detail) => (
              <tr key={detail.title}>
                <th>{detail.title}</th>
                <td>{detail.value}</td>
              </tr>
            )}
            rows={registrationRows}
          />
        </DetailInfoSection>
      )}
      <DetailInfoSection
        title="Tags"
        borderBottom={false}
        data-testid="eventdetailpage-detailinfosection"
      >
        <InfoTable<TagRow>
          rowRenderer={(row) => (
            <tr key={row.title}>
              <th>{row.title}</th>
              <td>{row.value}</td>
            </tr>
          )}
          rows={tagRows}
        />
      </DetailInfoSection>
    </DetailPageWrapper>
  );
};
