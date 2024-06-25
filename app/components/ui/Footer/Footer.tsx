import React, { useEffect, useState } from "react";
import whiteLabel from "utils/whitelabel";
import { callableUSPhoneNumber } from "utils/numbers";
import { htmlWithBreaks } from "utils/sanity";
import Our415Logo from "assets/img/our415-white.png";
import SFSeal from "assets/img/sf-seal-white.png";
import DCYFLogo from "assets/img/dcyf-white.png";
import { FooterColumn } from "./FooterColumn";
import { useFooterData } from "../../../hooks/StrapiAPIHooks";

import "./Footer.scss";
import { DynamicLink } from "models/Strapi";

export const Footer = () => {
  const { data, error, isLoading } = useFooterData();

  if (error || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__content">
        <div className="site-footer__top">
          <div className="site-footer__contact">
            <div className="site-footer__logo">
              <img
                src={Our415Logo}
                alt="SF Department of Children Youth and their Families"
              />
            </div>
            <address>
              <div
                className="site-footer__address"
                dangerouslySetInnerHTML={{
                  __html: htmlWithBreaks(data.address),
                }}
              />
              <div className="site-footer__contact">
                <a
                  href={`tel:${callableUSPhoneNumber(data.phone_number)}`}
                >
                  {data.phone_number}
                </a>
                <br />
                <a href={`mailto:${data.email_address}`}>{data.email_address}</a>
              </div>
            </address>
          </div>
          
          <div className="site-footer__links">
            {data.links && data.links.map((item: DynamicLink) => <FooterColumn column={item} />)}
          </div>
          <div className="site-footer__logos">
            <div className="site-footer__sfseal">
              <img src={SFSeal} alt="City of San Francisco Seal" />
            </div>
            <div className="site-footer__dcyf">
              <img
                src={DCYFLogo}
                alt="SF Department of Children Youth and their Families"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
