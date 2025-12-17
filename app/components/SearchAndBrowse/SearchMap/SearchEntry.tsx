import React, { Component } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import websiteConfig from "utils/websiteConfig";
import { RelativeOpeningTime } from "components/DetailPage/RelativeOpeningTime";
import type { SearchHit } from "../../../search/types";
import "./SearchEntry.scss";

const {
  appImages: { mohcdSeal },
} = websiteConfig;

interface Props {
  hit: SearchHit;
  lat: number;
  lng: number;
}

export default class SearchEntry extends Component<Props> {
  render() {
    const { hit, lat, lng } = this.props;
    const { recurringSchedule, type } = hit;

    console.log("SearchEntry", hit);

    return (
      <Link to={{ pathname: hit.path }}>
        <div className={`results-table-entry ${type}-entry`}>
          <div className="entry-details">
            <div className="entry-header">
              <h4 className="entry-headline">{hit.name}</h4>
              {hit.is_mohcd_funded && (
                <div className="mohcd-funded">
                  <img src={mohcdSeal} alt="MOHCD seal" />
                  <p>Funded by MOHCD</p>
                </div>
              )}
            </div>
            {type === "service" && (
              <p className="entry-meta">
                <Link to={`/organizations/${hit.organization_id}`}>
                  {hit.organization_name}
                </Link>
              </p>
            )}
            <p className="entry-meta">
              {hit.addressDisplay}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(recurringSchedule as any) && (
                <span className="entry-schedule">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <RelativeOpeningTime
                    recurringSchedule={recurringSchedule as any}
                  />
                </span>
              )}
            </p>
            <div className="entry-body">
              <ReactMarkdown className="rendered-markdown search-entry-body">
                {hit.description || ""}
              </ReactMarkdown>
            </div>
          </div>
          <ul className="action-buttons">
            {hit._geoloc && (
              <li className="action-button">
                <a
                  href={`http://google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="material-icons">directions_outlined</i>
                  Go
                </a>
              </li>
            )}
          </ul>
        </div>
      </Link>
    );
  }
}
