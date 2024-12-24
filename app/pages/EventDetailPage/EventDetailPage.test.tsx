import React from "react";
import { render, screen } from "@testing-library/react";
import { EventDetailPage } from "pages/EventDetailPage/EventDetailPage";
import { EVENTS_DATA } from "../../../test/fixtures/EventsData";
import { useEventData } from "hooks/StrapiAPI";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

let MOCK_EVENT: {
  data: ReturnType<typeof useEventData>["data"] | null;
  error: ReturnType<typeof useEventData>["error"];
  isLoading: ReturnType<typeof useEventData>["isLoading"];
} = {
  data: null,
  error: null,
  isLoading: false,
};

jest.mock("hooks/StrapiAPI", () => ({
  formatHomePageEventsData: () => null,
  useEventData: () => MOCK_EVENT,
}));

global.scrollTo = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

it("displays every page section and table row", async () => {
  MOCK_EVENT = {
    data: {
      ...EVENTS_DATA[0].data.attributes,
      id: 10,
      categories: ["fakeCategory"],
      eligibilities: ["fakeEligibility"],
    } as unknown as ReturnType<typeof useEventData>["data"],
    error: null,
    isLoading: false,
  };

  render(
    <HelmetProvider>
      <EventDetailPage />
    </HelmetProvider>
  );

  expect(
    screen.getAllByTestId("eventdetailpage-detailinfosection").length
  ).toEqual(4);
  [
    "About",
    "Details",
    "Registration",
    "Tags",
    "Date & Time",
    "Event Link",
    "Categories",
    "Eligibilities",
    "Age Group",
  ].forEach((event) => {
    expect(screen.getByText(event)).toBeInTheDocument();
  });
});
