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

jest.mock("hooks/StrapiAPI", () => ({
  useHomepageData: () => HOME_PAGE_MOCK,
  useHomePageFeaturedResourcesData: () => EVENTS_MOCK,
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
});
