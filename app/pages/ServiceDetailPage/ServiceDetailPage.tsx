import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams, Link } from "react-router-dom";
import GoogleMap from "google-map-react";
import { Helmet } from "react-helmet-async";
import { Loader } from "components/ui/Loader";
import { Button } from "components/ui/inline/Button/Button";
import { createMapOptions, CustomMarker } from "components/ui/MapElements";
import PageNotFound, { NotFoundType } from "components/ui/PageNotFound";
import { removeAsterisksAndHashes } from "utils/strings";
import config from "../../config";
import {
  useServiceDetails,
  useOrganizationServices,
  transformService,
  transformSchedules,
} from "../../hooks/SFOpenData";
import styles from "./ServiceDetailPage.module.scss";

const INITIAL_SERVICES_SHOWN = 5;

export const ServiceDetailPage = () => {
  const { serviceListingId } = useParams();
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  const {
    data: serviceData,
    error,
    isLoading,
    isLoadingRelated,
  } = useServiceDetails(serviceListingId ?? null);

  // Fetch other services from the same organization
  const { data: orgServices } = useOrganizationServices(
    serviceData?.organization_id ?? null
  );

  // Transform SF Open Data format to internal model format
  const service = useMemo(() => {
    if (!serviceData) return null;
    return transformService(serviceData);
  }, [serviceData]);

  // Generate service details for the "Details" section
  const details = useMemo(() => {
    if (!service) return [];
    return [
      ["How to Apply", service.application_process || ""],
      ["Required Documents", service.required_documents || ""],
      ["Fees", service.fee || ""],
      ["Notes", service.notes.map((d) => d.note).join("\n")],
    ]
      .filter((row) => row[1])
      .map((row) => ({ title: row[0] as string, value: row[1] as string }));
  }, [service]);

  // Build schedule from service schedules
  const schedule = useMemo(() => {
    return transformSchedules(serviceData?.schedules);
  }, [serviceData?.schedules]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !service || !serviceData) {
    return (
      <div className={styles.servicePage}>
        <Helmet>
          <title>Our415</title>
        </Helmet>
        <PageNotFound type={NotFoundType.SERVICE_NOT_FOUND} />
      </div>
    );
  }

  if (service.status === "inactive") {
    return (
      <div className={styles.servicePage}>
        <Helmet>
          <title>Our415</title>
        </Helmet>
        <PageNotFound type={NotFoundType.SERVICE_INACTIVE} />
      </div>
    );
  }

  // Get all locations with valid coordinates
  const allLocations = (serviceData.locations ?? []).flatMap((loc) => {
    const lat = loc.latitude ? parseFloat(loc.latitude) : null;
    const lng = loc.longitude ? parseFloat(loc.longitude) : null;
    return lat && lng ? [{ loc, lat, lng }] : [];
  });

  const formattedLongDescription = service.long_description
    ? removeAsterisksAndHashes(service.long_description)
    : undefined;

  // Filter out current service from other services
  const otherServices = (orgServices || []).filter(
    (srv) => srv.id !== serviceData.id
  );
  const displayedServices = showAllServices
    ? otherServices
    : otherServices.slice(0, INITIAL_SERVICES_SHOWN);
  const hasMoreServices = otherServices.length > INITIAL_SERVICES_SHOWN;

  const directionsUrl =
    allLocations.length > 0
      ? `https://www.google.com/maps/dir/?api=1&destination=${allLocations[0].lat},${allLocations[0].lng}`
      : null;

  return (
    <div className={styles.servicePage}>
      <Helmet>
        <title>{service.name} | Our415</title>
        <meta name="description" content={service.long_description || ""} />
      </Helmet>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{service.name}</h1>
          <p className={styles.subtitle}>
            A service
            {service.program && ` in the ${service.program.name} program`}
            {" offered by "}
            <Link to={`/organizations/${serviceData.organization_id}`}>
              {serviceData.organization?.name || "this organization"}
            </Link>
          </p>
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
            <ReactMarkdown className="rendered-markdown" linkTarget="_blank">
              {formattedLongDescription || "No description available."}
            </ReactMarkdown>
          </div>

          {details.length > 0 && (
            <div className={styles.detailsSection}>
              <h2>Details</h2>
              <div className={styles.detailsList}>
                {details.map((detail) => (
                  <div key={detail.title} className={styles.detailItem}>
                    <span className={styles.label}>{detail.title}</span>
                    <span className={styles.value}>
                      <ReactMarkdown className="rendered-markdown">
                        {detail.value}
                      </ReactMarkdown>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.contactList}>
            {service.url && (
              <div className={styles.contactItem}>
                <span className={styles.label}>Website</span>
                <a href={service.url} target="_blank" rel="noopener noreferrer">
                  {service.url}
                </a>
              </div>
            )}
            {service.email && (
              <div className={styles.contactItem}>
                <span className={styles.label}>Email</span>
                <a href={`mailto:${service.email}`}>{service.email}</a>
              </div>
            )}
          </div>
        </div>

        {allLocations.length > 0 && (
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              <GoogleMap
                bootstrapURLKeys={{ key: config.GOOGLE_API_KEY }}
                defaultCenter={{
                  lat: allLocations[0].lat,
                  lng: allLocations[0].lng,
                }}
                defaultZoom={15}
                options={createMapOptions}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => {
                  if (allLocations.length > 1) {
                    const bounds = new maps.LatLngBounds();
                    allLocations.forEach(({ lat, lng }) =>
                      bounds.extend({ lat, lng })
                    );
                    map.fitBounds(bounds);
                  }
                }}
              >
                {allLocations.map(({ lat, lng }, index) => (
                  <CustomMarker
                    key={`${lat}-${lng}`}
                    lat={lat}
                    lng={lng}
                    text={String(index + 1)}
                  />
                ))}
              </GoogleMap>
            </div>
            <div className={styles.locationInfo}>
              {(showAllAddresses ? allLocations : allLocations.slice(0, 3)).map(
                ({ loc }, index) => (
                  <div key={index} className={styles.address}>
                    {loc.address_1}
                    {loc.city && `, ${loc.city}`}
                    {loc.state_province && `, ${loc.state_province}`}
                    {loc.postal_code && ` ${loc.postal_code}`}
                  </div>
                )
              )}
              {allLocations.length > 3 && (
                <button
                  className={styles.viewMoreAddresses}
                  onClick={() => setShowAllAddresses((v) => !v)}
                >
                  {showAllAddresses
                    ? "Show less"
                    : `+${allLocations.length - 3} more`}
                </button>
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

      {otherServices.length > 0 && (
        <div className={styles.otherServicesSection}>
          <h2>Other services at this organization</h2>
          {isLoadingRelated && (
            <div className={styles.loadingIndicator}>Loading services...</div>
          )}
          <div className={styles.servicesGrid}>
            {displayedServices.map((srv) => (
              <Link
                to={`/services/${srv.id}`}
                key={srv.id}
                className={styles.serviceCard}
              >
                <h3>{srv.name}</h3>
                <p>
                  {srv.description
                    ? removeAsterisksAndHashes(srv.description)
                    : "No description available."}
                </p>
              </Link>
            ))}
            {hasMoreServices && !showAllServices && (
              <button
                className={styles.showMoreCard}
                onClick={() => setShowAllServices(true)}
              >
                <span className={styles.showMoreCount}>
                  +{otherServices.length - INITIAL_SERVICES_SHOWN}
                </span>
                <span className={styles.showMoreLabel}>more</span>
              </button>
            )}
          </div>
        </div>
      )}

      {service.categories.filter((c) => c.top_level).length > 0 && (
        <div className={styles.tagsSection}>
          <h2>Categories</h2>
          <div className={styles.tagsList}>
            {service.categories
              .filter((c) => c.top_level)
              .map((cat) => (
                <span
                  key={`cat-${cat.id}`}
                  className={`${styles.tag} ${styles.tagCategory}`}
                >
                  {cat.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {service.categories.filter((c) => !c.top_level).length > 0 && (
        <div className={styles.tagsSection}>
          <h2>Subcategories</h2>
          <div className={styles.tagsList}>
            {service.categories
              .filter((c) => !c.top_level)
              .map((cat) => (
                <span
                  key={`subcat-${cat.id}`}
                  className={`${styles.tag} ${styles.tagCategory}`}
                >
                  {cat.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {service.eligibilities.length > 0 && (
        <div className={styles.tagsSection}>
          <h2>Eligibilities</h2>
          <div className={styles.tagsList}>
            {service.eligibilities.map((elig) => (
              <span
                key={`elig-${elig.id}`}
                className={`${styles.tag} ${styles.tagEligibility}`}
              >
                {elig.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
