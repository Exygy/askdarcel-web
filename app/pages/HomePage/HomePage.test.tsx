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
import { Homepage, StrapiDatum } from "models/Strapi";
import { EVENTS_DATA } from '../../../test/fixtures/EventsData';
import { useEventsData } from 'hooks/StrapiAPI';

const HOME_PAGE_MOCK: {
  data: {
    attributes: null | StrapiDatum<Homepage>["attributes"];
  };
} = {
  data: {
    attributes: null,
  },
};

const EVENTS_MOCK: {
  data: ReturnType<typeof useEventsData>['data']
} = {
  data: []
};

jest.mock("hooks/StrapiAPI", () => ({
  useHomepageData: () => HOME_PAGE_MOCK,
  useEventsData: () => EVENTS_MOCK,
}));

describe("<HomePage />", () => {
  it("renders", () => {
    HOME_PAGE_MOCK.data.attributes = HOME_PAGE_DATA;
    render(<HomePage />, { wrapper: BrowserRouter });
    expect(screen.getByTestId("homepage-title")).toHaveTextContent("Homepage");
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getAllByTestId("homepage-section")).toHaveLength(2);
    expect(
      screen.getByTestId("two-column-content-section")
    ).toBeInTheDocument();
  });

  it("only renders featured events", () => {
    HOME_PAGE_MOCK.data.attributes = HOME_PAGE_DATA;
    EVENTS_MOCK.data = EVENTS_DATA;
    render(<HomePage />, { wrapper: BrowserRouter });
    expect(screen.getAllByTestId("homepage-section")).toHaveLength(2);
    expect(screen.getAllByTestId("eventcard")).toHaveLength(1);
  });
});