/**
 * Template for a simple component test
 *
 * Usage: Duplicate this file and rename it using your component name. Happy
 * coding from there!
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HomePage } from "pages/HomePage/HomePage";
import { HOME_PAGE_DATA } from "../../../test/fixtures/HomePageData";
// import { Homepage, StrapiDatum } from "models/Strapi";
import { useHomePageFeaturedResourcesData } from "hooks/StrapiAPI";
import { Spotlight } from "models/Strapi";

const HOME_PAGE_MOCK = {
  data: {
    attributes: {},
  },
  isLoading: false,
};

const EVENTS_MOCK: {
  data: ReturnType<typeof useHomePageFeaturedResourcesData>["data"];
  isLoading: boolean;
} = {
  data: [],
  isLoading: false,
};

const SF_GOV_EVENTS_MOCK = {
  data: [],
  isLoading: false,
};

const SPOTLIGHTS_MOCK: { data: Spotlight[]; isLoading: boolean } = {
  data: [],
  isLoading: false,
};

const spotlight = (slug: string, title: string) =>
  ({
    slug,
    title,
    short_description: `${title} description`,
    image: { data: { id: 1, attributes: { url: "/image.png" } } },
  } as unknown as Spotlight);

jest.mock("hooks/StrapiAPI", () => ({
  useHomepageData: () => HOME_PAGE_MOCK,
  useHomePageFeaturedResourcesData: () => EVENTS_MOCK,
  useSpotlightsData: () => SPOTLIGHTS_MOCK,
}));

jest.mock("hooks/SFGovAPI", () => ({
  useAllSFGovEvents: () => SF_GOV_EVENTS_MOCK,
}));

describe("<HomePage />", () => {
  it("renders", () => {
    HOME_PAGE_MOCK.data.attributes = HOME_PAGE_DATA.data.attributes;
    HOME_PAGE_MOCK.isLoading = false;
    EVENTS_MOCK.isLoading = false;
    SF_GOV_EVENTS_MOCK.isLoading = false;

    render(<HomePage />, { wrapper: BrowserRouter });

    expect(screen.getByTestId("homepage-title")).toHaveTextContent("Homepage");
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getAllByTestId("homepage-section")).toHaveLength(3);
    expect(screen.getAllByTestId("two-column-content-section")).toHaveLength(2);
  });

  it("shows the first four spotlights in place of the hero", () => {
    HOME_PAGE_MOCK.data.attributes = HOME_PAGE_DATA.data.attributes;
    SPOTLIGHTS_MOCK.data = [1, 2, 3, 4, 5].map((n) =>
      spotlight(`spotlight-${n}`, `Spotlight ${n}`)
    );

    render(<HomePage />, { wrapper: BrowserRouter });

    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Spotlight 1" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      "/spotlights/spotlight-1"
    );
    expect(
      screen.getAllByRole("button", { name: /^Spotlight \d$/ })
    ).toHaveLength(4);
    expect(
      screen.getByRole("link", { name: "See all spotlights" })
    ).toHaveAttribute("href", "/spotlights");

    SPOTLIGHTS_MOCK.data = [];
  });
});
