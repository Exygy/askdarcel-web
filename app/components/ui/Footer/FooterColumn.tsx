import React from "react";
import { StrapiModels } from "models/Strapi";
import { FooterLink } from "./FooterLink";

export const FooterColumn = ({
  column,
}: {
  column: StrapiModels.DynamicLink;
}) => {
  return (
    <figure>
      <figcaption>{column.title}</figcaption>
      <ul>
        {column.link.map((link) => (
          <li key={link.text}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </figure>
  );
};
