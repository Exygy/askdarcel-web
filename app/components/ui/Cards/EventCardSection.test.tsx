import React from "react";
import { render, screen } from "@testing-library/react";
import { EVENTS_DATA } from '../../../../test/fixtures/EventsData';
import { EventCardSection } from 'components/ui/Cards/EventCardSection';

describe("<EventCardSection />", () => {
  const eventData = EVENTS_DATA;

  it("renders", () => {
    render(<EventCardSection events={eventData} />);

    expect(screen.getAllByTestId("eventcard")).toHaveLength(2);
  });
});
