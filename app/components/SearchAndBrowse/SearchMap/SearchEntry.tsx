import React from "react";
import { useNavigate } from "react-router-dom";
import websiteConfig from "utils/websiteConfig";
import { RelativeOpeningTime } from "components/DetailPage/RelativeOpeningTime";
import { MapPinIcon, ClockIcon, XMarkIcon } from "@heroicons/react/16/solid";
import type { SearchHit, Location, Address } from "../../../search/types";
import "./SearchEntry.scss";

const {
  appImages: { mohcdSeal },
} = websiteConfig;

interface Props {
  hit: SearchHit;
  lat: number;
  lng: number;
  location: Location;
  onClose?: () => void;
}

const SearchEntry = ({ hit, lat, lng, location, onClose }: Props) => {
  const navigate = useNavigate();
  const { recurringSchedule, type } = hit;

  const currentAddress: Address | undefined = location.address;

  const otherAddresses: Address[] = (hit.addresses || []).filter((_addr, i) => {
    const loc = hit.locations?.[i];
    if (!loc) return false;
    return loc.lat !== location.lat || loc.long !== location.long;
  });

  const hasMultipleLocations = otherAddresses.length > 0;

  const addressText = currentAddress?.address_1 || "No address found";

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose?.();
    // Use setTimeout to ensure tooltip closes before navigation
    setTimeout(() => navigate(path), 0);
  };

  // Build the path to the detail page
  const detailPath =
    hit.path ||
    (type === "service"
      ? `/services/${hit.service_id}`
      : `/organizations/${hit.id}`);

  return (
    <div className="search-entry">
      <button
        className="search-entry-close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose?.();
        }}
        aria-label="Close"
        type="button"
      >
        <XMarkIcon width={16} height={16} />
      </button>

      <h4 className="search-entry-name">
        <a href={detailPath} onClick={handleNavigate(detailPath)}>
          {hit.name}
        </a>
      </h4>

      {type === "service" && hit.organization_name && (
        <p className="search-entry-org">
          <a
            href={`/organizations/${hit.organization_id}`}
            onClick={handleNavigate(`/organizations/${hit.organization_id}`)}
          >
            {hit.organization_name}
          </a>
        </p>
      )}

      {hit.is_mohcd_funded && (
        <div className="search-entry-mohcd">
          <img src={mohcdSeal} alt="MOHCD seal" />
          <span>Funded by MOHCD</span>
        </div>
      )}

      <div className="search-entry-meta">
        <span className="search-entry-meta-item">
          <MapPinIcon width={14} height={14} className="search-entry-icon" />
          {addressText}
        </span>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(recurringSchedule as any) && (
          <span className="search-entry-meta-item">
            <ClockIcon width={14} height={14} className="search-entry-icon" />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <RelativeOpeningTime recurringSchedule={recurringSchedule as any} />
          </span>
        )}
      </div>

      {hasMultipleLocations && (
        <div className="search-entry-other-locations">
          <h5 className="search-entry-other-locations-heading">
            Other locations
          </h5>
          <ul className="search-entry-other-locations-list">
            {otherAddresses.map((addr, i) => (
              <li key={i}>
                <MapPinIcon
                  width={14}
                  height={14}
                  className="search-entry-icon"
                />
                {addr.address_1 || "No address found"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchEntry;
