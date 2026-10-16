import React from "react";
import { render, screen } from "@testing-library/react";
import { useAllSFGovEvents } from "hooks/SFGovAPI";
import { EventCalendar } from "./EventCalendar";

jest.mock("hooks/SFGovAPI", () => ({
  useAllSFGovEvents: jest.fn(),
}));

const mockUseAllSFGovEvents = useAllSFGovEvents as jest.Mock;

describe("<EventCalendar />", () => {
  it("shows an error message when events fail to load", () => {
    mockUseAllSFGovEvents.mockReturnValue({
      data: null,
      error: new Error("Events request failed with status 503"),
      isLoading: false,
    });

    render(<EventCalendar />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load events right now."
    );
    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("does not show the error while events are first loading", () => {
    mockUseAllSFGovEvents.mockReturnValue({
      data: null,
      error: undefined,
      isLoading: true,
    });

    render(<EventCalendar />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
