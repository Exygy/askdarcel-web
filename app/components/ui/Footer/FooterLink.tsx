import React from "react";
import { Link } from "react-router-dom";
import { StrapiModels } from "../../../models/Strapi";

export const FooterLink = ({ link }: { link: StrapiModels.Link }) => {
  const isInternalLink = (url: string): boolean => {
    return url.startsWith("/") || url.startsWith(window.location.origin);
  };

  if (isInternalLink(link.url)) {
    return <Link to={link.url}>{link.text}</Link>;
  }

  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer">
      {link.url}
    </a>
  );
};
