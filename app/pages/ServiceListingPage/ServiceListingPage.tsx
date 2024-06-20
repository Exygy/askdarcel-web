import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import { useParams, Redirect, useLocation } from "react-router-dom";
import qs from "qs";
import {
  ActionBarMobile,
  ActionSidebar,
  MapOfLocations,
  MOHCDBadge,
  ServiceAttribution,
  ServiceCard,
  TableOfContactInfo,
  TableOfOpeningTimes,
} from "components/listing";
import { Datatable, Footer, Loader } from "components/ui";
import whiteLabel from "../../utils/whitelabel";
import { removeAsterisksAndHashes } from "utils/strings";
import {
  fetchService,
  generateServiceDetails,
  getOrganizationActions,
  getServiceLocations,
  Organization,
  OrganizationAction,
  Service,
} from "../../models";
import styles from "./ServiceListingPage.module.scss";

/*
TODO:
- [x] Links blue
- [x] Headers colors and sizes
- [x] Padding
- [x] turn buttons to Button component
- [x] Figure out what to do with modal / tooltip thing on hover
- [x] Other services section
- [] Pass aria labels to buttons?
- [] Add call button to desktop
- [] Is this max width fine? It is narrower than homepage content
- [] Remove things that aren't being used in here and in scss
*/

const { title: whiteLabelTitle, footerOptions: whiteLabelFooterOpts } =
  whiteLabel;

// Page at /services/123
export const ServiceListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const details = useMemo(
    () => (service ? generateServiceDetails(service) : []),
    [service]
  );
  const { search } = useLocation();
  const searchState = useMemo(() => qs.parse(search.slice(1)), [search]);
  const { visitDeactivated } = searchState;

  useEffect(() => {
    fetchService(id).then((s) => setService(s));
    // TODO Handle Errors
  }, [id]);

  if (!service) {
    return <Loader />;
  }
  if (service.status === "inactive" && !visitDeactivated) {
    return <Redirect to="/" />;
  }

  const { resource, recurringSchedule } = service;
  const formattedLongDescription = removeAsterisksAndHashes(
    service.long_description
  );
  const locations = getServiceLocations(service, resource, recurringSchedule);
  const allActions = getOrganizationActions(resource);
  const sidebarActions = allActions.filter((a) =>
    ["print", "directions"].includes(a.icon)
  );
  const mobileActions = allActions.filter((a) =>
    ["phone", "directions"].includes(a.icon)
  );
  const onClickAction = (action: OrganizationAction) => {
    switch (action.icon) {
      case "print":
        window.print();
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles[`listing-container`]}>
      <Helmet>
        <title>{`${service.name} | ${whiteLabelTitle}`}</title>
        <meta name="description" content={formattedLongDescription} />
      </Helmet>
      <article className={styles[`listing`]} id="service">
        <div
          className={`${styles["listing--main"]} ${styles["weglot-dynamic"]}`}
        >
          <div className={styles["listing--main--left"]}>
            <header>
              <div className={styles["org--main--header--title-container"]}>
                <h1 data-cy="service-page-title">{service.name}</h1>
                <MOHCDBadge resource={resource} />
              </div>
              {/* {service.alsoNamed ? <p>Also Known As</p> : null} */}
              <ServiceProgramDetails
                service={service}
                organization={resource}
              />
            </header>

            {/* Should action bar desktop and mobile have different actions? */}
            <ActionBarMobile
              actions={mobileActions}
              onClickAction={onClickAction}
            />

            <ServiceListingSection
              title="About"
              data-cy="service-about-section"
            >
              <ReactMarkdown
                className="rendered-markdown"
                source={formattedLongDescription}
                linkTarget="_blank"
              />
              <ServiceAttribution
                attribution={resource.source_attribution}
                status={resource.status}
              />
            </ServiceListingSection>

            {details.length > 0 && (
              <ServiceListingSection
                title="Details"
                data-cy="service-details-section"
              >
                <Datatable
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
                  rows={details}
                />
              </ServiceListingSection>
            )}

            <ServiceListingSection
              title="Contact Info"
              data-cy="service-contact-section"
            >
              <TableOfContactInfo service={service} />
            </ServiceListingSection>

            {locations.length > 0 && (
              <ServiceListingSection
                title="Location and Hours"
                data-cy="service-loc-hours-section"
              >
                <MapOfLocations
                  locations={locations}
                  locationRenderer={(location: any) => (
                    <TableOfOpeningTimes
                      recurringSchedule={location.recurringSchedule}
                    />
                  )}
                />
                {/* TODO Transport Options */}
              </ServiceListingSection>
            )}

            {resource.services.length > 0 && (
              <ServiceListingSection
                title="Other Services at this organization"
                data-cy="service-other-section"
              >
                {resource.services
                  .filter((srv) => srv.id !== service.id)
                  .map((srv) => (
                    <>
                      {console.log(service)}
                      <ServiceCard service={srv} key={srv.id} />
                    </>
                  ))}
              </ServiceListingSection>
            )}

            {/* TODO Need an API to get similar services, maybe same category for now? */}
            {/* <section>
                <h2>Similar Services Near You</h2>
              </section>
            */}
          </div>
          <aside className={styles["listing--aside"]}>
            <ActionSidebar
              actions={sidebarActions}
              onClickAction={onClickAction}
            />
          </aside>
        </div>
      </article>
      {whiteLabelFooterOpts.showOnListingPages && <Footer />}
    </div>
  );
};

type ServiceListingSectionProps = {
  title: string;
} & React.HTMLProps<HTMLDivElement>;

// A title with the content of a section
export const ServiceListingSection = ({
  children,
  title,
  ...props
}: ServiceListingSectionProps) => (
  <section {...props}>
    <h2>{title}</h2>
    {children}
  </section>
);

type ServiceProgramDetailsProps = {
  service: Service;
  organization: Organization;
};

// Details if the service is part of a larger program, and the organization that provides it
export const ServiceProgramDetails = ({
  service,
  organization,
}: ServiceProgramDetailsProps) => (
  <span className={styles["service--program--details"]}>
    A service
    {service.program ? ` in the ${service.program.name} program` : null}
    {" offered by "}
    <a href={`/organizations/${organization.id}`}>{organization.name}</a>
  </span>
);

// TEMP
// const services = [
//   {
//     updated_at: "2023-09-20T22:24:26.807Z",
//     alternate_name: null,
//     application_process:
//       "For technical assistance, Attorney of the Day (AOD) consultation service offers expert legal technical assistance to attorneys, nonprofit staff, criminal defenders, and others assisting immigrant clients. We offer case-specific consultations on immigration law and practice.\n\nTo discuss rates and set up a contract, please contact our AOD Administrator at AODAdmin@ilrc.org or (415) 255-9499.",
//     certified: false,
//     eligibility: null,
//     email: "ilrc@ilrc.org",
//     fee: "Most educational content is free; some publications can be purchased for a fee",
//     id: 973,
//     interpretation_services: null,
//     long_description:
//       "As a national expert on these issues, the Immigrant Legal Resource Center (ILRC) does the following:\n\n- Provides ongoing trainings on the family-based immigration process\n- Answers case-specific questions from practitioners\n- Authors a comprehensive manual, Families \u0026 Immigration: A Practical Guide\n- Advocates locally and federally in support of immigrant families.\n\n",
//     name: "Family-Based",
//     required_documents: null,
//     short_description:
//       "As a national expert on these issues, the Immigrant Legal Resource Center (ILRC) does the following:\n- Provides ongoing trainings on the family-based immigration process",
//     url: "https://www.ilrc.org/family-based",
//     verified_at: null,
//     wait_time: null,
//     certified_at: null,
//     featured: false,
//     source_attribution: "ask_darcel",
//     status: "approved",
//     internal_note: null,
//     schedule: {
//       id: 1456,
//       schedule_days: [],
//       hours_known: true,
//     },
//     notes: [],
//     categories: [
//       {
//         name: "Citizenship \u0026 Immigration",
//         id: 141,
//         top_level: false,
//         featured: false,
//       },
//       {
//         name: "Legal",
//         id: 153,
//         top_level: false,
//         featured: true,
//       },
//       {
//         name: "Immigration Assistance",
//         id: 350,
//         top_level: false,
//         featured: false,
//       },
//       {
//         name: "Legal Assistance",
//         id: 1100024,
//         top_level: false,
//         featured: false,
//       },
//     ],
//     addresses: [],
//     eligibilities: [
//       {
//         name: "Families with children below 18 years old",
//         id: 1050,
//         feature_rank: null,
//       },
//       {
//         name: "Immigrants",
//         id: 1012,
//         feature_rank: 6,
//       },
//     ],
//     instructions: [],
//     documents: [],
//   },
//   {
//     updated_at: "2023-09-20T22:24:26.315Z",
//     alternate_name: null,
//     application_process: "Call mainline for more information.",
//     certified: false,
//     eligibility: null,
//     email: "ilrc@ilrc.org",
//     fee: "Most educational content is free; some publications can be purchased for a fee",
//     id: 977,
//     interpretation_services: null,
//     long_description:
//       "The ILRC actively engages in policy advocacy to transform prosecutorial practices (crime-related processes).\n\nThe ILRC works directly with elected prosecutors throughout the country to draft and enact policies that mitigate or eliminate the devastating lifelong impact of criminal convictions.\n\n",
//     name: "Prosecutors",
//     required_documents: null,
//     short_description: null,
//     url: "https://www.ilrc.org/prosecutors",
//     verified_at: null,
//     wait_time: null,
//     certified_at: null,
//     featured: false,
//     source_attribution: "ask_darcel",
//     status: "approved",
//     internal_note: null,
//     schedule: {
//       id: 1461,
//       schedule_days: [],
//       hours_known: true,
//     },
//     notes: [],
//     categories: [
//       {
//         name: "Citizenship \u0026 Immigration",
//         id: 141,
//         top_level: false,
//         featured: false,
//       },
//       {
//         name: "Legal",
//         id: 153,
//         top_level: false,
//         featured: true,
//       },
//       {
//         name: "Legal Representation",
//         id: 186,
//         top_level: false,
//         featured: false,
//       },
//       {
//         name: "Immigration Assistance",
//         id: 350,
//         top_level: false,
//         featured: false,
//       },
//     ],
//     addresses: [],
//     eligibilities: [
//       {
//         name: "Immigrants",
//         id: 1012,
//         feature_rank: 6,
//       },
//     ],
//     instructions: [],
//     documents: [],
//   },
// ];
