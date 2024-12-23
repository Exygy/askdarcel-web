import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { ActionBarMobile, MapOfLocations } from "components/DetailPage";
import { InfoTable } from "components/DetailPage/InfoTable";
import { Loader } from "components/ui/Loader";
import { removeAsterisksAndHashes } from "utils/strings";
import { DetailInfoSection } from "components/ui/Cards/DetailInfoSection";
import ListingPageHeader from "components/DetailPage/PageHeader";
import DetailPageWrapper from "components/DetailPage/DetailPageWrapper";
import { DetailAction } from "../../models";
import PageNotFound from "components/ui/PageNotFound";
import { useEventData } from 'hooks/StrapiAPI';
import { formatCalendarEvent } from 'components/ui/Cards/FormattedDate';

export const EventDetailPage = () => {
  const { eventListingId } = useParams();
  console.log("🪵 ~ EventDetailPage ~ eventListingId:", eventListingId);
  // const [event, setEvent] = useState<Service | null>(null);
  // const [error, setError] = useState<FetchServiceError>();
  // const details = useMemo(
  //   () => (service ? generateServiceDetails(service) : []),
  //   [service]
  // );
  //\
  const { data, error } = useEventData(eventListingId as string);
  console.log("🪵 ~ EventDetailPage ~ data:", data, error);

  useEffect(() => window.scrollTo(0, 0), []);


  if (error) {
    return (
      <DetailPageWrapper
        title="Our415 - Page Error"
        description=""
        sidebarActions={[]}
        onClickAction={() => "noop"}
      >
        <PageNotFound />
      </DetailPageWrapper>
    );
  }

  if (!data) {
    return <Loader />;
  }


  const eventDetails = [
    {
      title: "Date/Time",
      value: formatCalendarEvent(data.calendar_event),
    }
  ];


  // Returning `undefined` instead of `null` since consuming code prefers this
  const formattedLongDescription = data.description
    ? removeAsterisksAndHashes(data.description)
    : undefined;
  // const locations = getLocationsFromAddresses(data);
  // const allActions = getDetailActions(resource);
  // const sidebarActions = allActions.filter((a) =>
  //   ["print", "phone", "directions"].includes(a.icon)
  // );
  // const mobileActions = allActions.filter((a) =>
  //   ["phone", "directions"].includes(a.icon)
  // );
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
      description={data.description || ""}
      sidebarActions={[]}
      onClickAction={onClickAction}
    >
      <ListingPageHeader title={data.title} dataCy="event-page-title">
        {/* <span className={styles["event--program--details"]}>
          A service
          {data.program ? ` in the ${data.program.name} program` : null}
          {" offered by "}
          <a href={`/organizations/${organization.id}`}>{organization.name}</a>
        </span> */}
      </ListingPageHeader>

      <span className="no-print">
        <ActionBarMobile
          actions={[]}
          onClickAction={onClickAction}
        />
      </span>

      <DetailInfoSection title="About" data-cy="event-about-section">
        <ReactMarkdown className="rendered-markdown" linkTarget="_blank">
          {formattedLongDescription || ""}
        </ReactMarkdown>
      </DetailInfoSection>

      {eventDetails.length > 0 && (
        <DetailInfoSection title="Details" data-cy="event-details-section">
          <InfoTable<{ title: string; value: string }>
            rowRenderer={(detail) => (
              <tr key={detail.title}>
                <th>{detail.title}</th>
                <td>
                  <ReactMarkdown className="rendered-markdown">
                    {detail.value}
                  </ReactMarkdown>
                </td>
              </tr>
            )}
            rows={eventDetails}
          />
        </DetailInfoSection>
      )}

      {/* {locations.length > 0 && (
        <DetailInfoSection
          title="Location and hours"
          data-cy="event-loc-hours-section"
        >
          <MapOfLocations locations={locations} />
        </DetailInfoSection>
      )} */}

      {/* {(data.categories.length > 0 || data.eligibilities.length > 0) && (
        <DetailInfoSection
          title="Tags"
          borderBottom={false}
          data-cy="event-tags-section"
        >
          <InfoTable>
            <LabelTagRows
              categories={data.categories}
              eligibilities={data.eligibilities}
            />
          </InfoTable>
        </DetailInfoSection>
      )} */}
    </DetailPageWrapper>
  );
};
