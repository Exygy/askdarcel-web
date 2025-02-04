import React from "react";
import { render, screen } from "@testing-library/react";
import { MapOfLocations } from "./MapOfLocations";
// import GoogleMap from "google-map-react";

// Mock the google-map-react component
jest.mock("google-map-react", () => {
  return function DummyMap({ children }: { children: React.ReactNode }) {
    return <div data-testid="google-map">{children}</div>;
  };
});

const mockLocations = [
  {
    id: 1,
    address: {
      latitude: "34.0522",
      longitude: "-118.2437",
      id: 1,
      attention: null,
      name: null,
      address_1: "123 Main St",
      address_2: null,
      address_3: null,
      address_4: null,
      city: "Los Angeles",
      state_province: "CA",
      postal_code: "90038",
    },
    name: "Location 1",
    recurringSchedule: {
      intervals: [],
      hoursKnown: true,
      isOpen24_7: () => false,
      findNearestInterval: () => undefined,
      isOpen: () => false,
    },
  },
];

describe("MapOfLocations", () => {
  it("renders map with correct markers", () => {
    render(<MapOfLocations locations={mockLocations} />);

    expect(screen.getByTestId("user-location-marker")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
