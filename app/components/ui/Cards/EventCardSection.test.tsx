import React from "react";
import { render, screen } from "@testing-library/react";
import { EVENTS_DATA_FORMATTED } from "../../../../test/fixtures/EventsData";
import { EventCardSection } from "components/ui/Cards/EventCardSection";

describe("<EventCardSection />", () => {
  const eventData = EVENTS_DATA_FORMATTED;

  it("displays the correct number of event cards", () => {
    render(<EventCardSection events={eventData} />);

    expect(screen.getAllByTestId("eventcard")).toHaveLength(2);
  });
});
