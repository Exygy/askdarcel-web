import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams, Link } from "react-router-dom";
import GoogleMap from "google-map-react";
import { Helmet } from "react-helmet-async";
import PageNotFound, { NotFoundType } from "components/ui/PageNotFound";
import { Loader } from "components/ui/Loader";
import { Button } from "components/ui/inline/Button/Button";
import { createMapOptions, CustomMarker } from "components/ui/MapElements";
import config from "../config";
import {
  useOrganizationDetails,
  transformOrganization,
  transformSchedules,
} from "../hooks/SFOpenData";
import styles from "./OrganizationDetailPage.module.scss";

const INITIAL_SERVICES_SHOWN = 5;

export const OrganizationDetailPage = () => {
  const { organizationListingId } = useParams();
  const [showAllServices, setShowAllServices] = useState(false);

  const {
    data: orgData,
    error,
    isLoading,
    isLoadingRelated,
  } = useOrganizationDetails(organizationListingId ?? null);

  // Transform SF Open Data format to internal model format
  const org = useMemo(() => {
    if (!orgData) return null;
    return transformOrganization(orgData, {
      locations: orgData.locations,
      categories: orgData.categories,
      services: orgData.services,
    });
  }, [orgData]);

  // Get the primary location for the map
  const primaryLocation = orgData?.locations?.[0];
  const lat = primaryLocation?.latitude
    ? parseFloat(primaryLocation.latitude)
    : null;
  const lng = primaryLocation?.longitude
    ? parseFloat(primaryLocation.longitude)
    : null;

  // Build schedule from locations (SF Open Data doesn't have org-level schedules directly)
  const schedule = useMemo(() => {
    return transformSchedules(undefined); // We'd need to fetch schedules separately if needed
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !org || !orgData) {
    return (
      <div className={styles.organizationPage}>
        <Helmet>
          <title>Our415</title>
        </Helmet>
        <PageNotFound type={NotFoundType.ORGANIZATION_NOT_FOUND} />
      </div>
    );
  }

  if (org.status === "inactive") {
    return (
      <div className={styles.organizationPage}>
        <Helmet>
          <title>Our415</title>
        </Helmet>
        <PageNotFound type={NotFoundType.ORGANIZATION_INACTIVE} />
      </div>
    );
  }

  const services = orgData.services || [];
  const displayedServices = showAllServices
    ? services
    : services.slice(0, INITIAL_SERVICES_SHOWN);
  const hasMoreServices = services.length > INITIAL_SERVICES_SHOWN;

  const directionsUrl =
    lat && lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : null;

  return (
    <div className={styles.organizationPage}>
      <Helmet>
        <title>{org.name} | Our415</title>
        <meta name="description" content={org.long_description || ""} />
      </Helmet>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{org.name}</h1>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            iconName="print"
            iconVariant="before"
            onClick={() => window.print()}
            mobileFullWidth={false}
          >
            Print
          </Button>
          {directionsUrl && (
            <Button
              variant="secondary"
              iconName="directions"
              iconVariant="before"
              href={directionsUrl}
              mobileFullWidth={false}
            >
              Directions
            </Button>
          )}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.aboutSection}>
          <h2>About</h2>
          <div className={styles.description}>
            <ReactMarkdown className="rendered-markdown">
              {org.long_description ||
                org.short_description ||
                "No description available."}
            </ReactMarkdown>
          </div>

          <div className={styles.contactList}>
            {org.website && (
              <div className={styles.contactItem}>
                <span className={styles.label}>Website</span>
                <a href={org.website} target="_blank" rel="noopener noreferrer">
                  {org.website}
                </a>
              </div>
            )}
            {org.phones.length > 0 && (
              <div className={styles.contactItem}>
                <span className={styles.label}>Phone</span>
                <a href={`tel:${org.phones[0].number}`}>
                  {org.phones[0].number}
                </a>
              </div>
            )}
            {org.email && (
              <div className={styles.contactItem}>
                <span className={styles.label}>Email</span>
                <a href={`mailto:${org.email}`}>{org.email}</a>
              </div>
            )}
          </div>
        </div>

        {lat && lng && (
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              <GoogleMap
                bootstrapURLKeys={{ key: config.GOOGLE_API_KEY }}
                defaultCenter={{ lat, lng }}
                defaultZoom={15}
                options={createMapOptions}
              >
                <CustomMarker lat={lat} lng={lng} text="1" />
              </GoogleMap>
            </div>
            <div className={styles.locationInfo}>
              {primaryLocation && (
                <div className={styles.address}>
                  {primaryLocation.address_1}
                  {primaryLocation.city && `, ${primaryLocation.city}`}
                  {primaryLocation.state_province &&
                    `, ${primaryLocation.state_province}`}
                  {primaryLocation.postal_code &&
                    ` ${primaryLocation.postal_code}`}
                </div>
              )}
              {schedule.intervals.length > 0 && (
                <div className={styles.scheduleList}>
                  {schedule.intervals.map((interval) => (
                    <div key={interval.key()} className={styles.scheduleItem}>
                      <span className={styles.day}>
                        {interval.opensAt.dayString()}
                      </span>
                      <span className={styles.time}>
                        {interval.opensAt.timeString()} -{" "}
                        {interval.closesAt.timeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.servicesSection}>
        <h2>Services</h2>
        {isLoadingRelated && (
          <div className={styles.loadingIndicator}>Loading services...</div>
        )}
        {!isLoadingRelated && services.length === 0 && (
          <p className={styles.noServices}>
            No services listed for this organization.
          </p>
        )}
        {services.length > 0 && (
          <div className={styles.servicesGrid}>
            {displayedServices.map((srv) => (
              <Link
                to={`/services/${srv.id}`}
                key={srv.id}
                className={styles.serviceCard}
              >
                <h3>{srv.name}</h3>
                <p>{srv.description || "No description available."}</p>
              </Link>
            ))}
            {hasMoreServices && !showAllServices && (
              <button
                className={styles.showMoreCard}
                onClick={() => setShowAllServices(true)}
              >
                <span className={styles.showMoreCount}>
                  +{services.length - INITIAL_SERVICES_SHOWN}
                </span>
                <span className={styles.showMoreLabel}>more</span>
              </button>
            )}
          </div>
        )}
      </div>

      {org.notes.length > 0 && (
        <div className={styles.notesSection}>
          <h2>Notes</h2>
          {org.notes.map((note) => (
            <p key={note.id}>{note.note}</p>
          ))}
        </div>
      )}
    </div>
  );
};
