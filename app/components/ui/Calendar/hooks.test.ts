import { renderHook } from "@testing-library/react";
import { useEventTransformation } from "./hooks";
import { SFGovEvent } from "hooks/SFGovAPI";
import { DistanceFilter } from "./types";

const makeEvent = (overrides: Partial<SFGovEvent> = {}): SFGovEvent => ({
  id: "test-1",
  org_name: "Test Org",
  event_name: "Test Event",
  event_description: "Test description",
  event_start_date: "2026-03-20",
  event_end_date: "",
  start_time: "10:00:00",
  end_time: "11:00:00",
  more_info: "",
  fee: false,
  site_location_name: "Test Location",
  events_category: "Education",
  age_group_eligibility_tags: "",
  site_address: "123 Main St",
  site_phone: "",
  site_email: "",
  latitude: "37.7749",
  longitude: "-122.4194",
  point: { type: "Point", coordinates: [-122.4194, 37.7749] },
  analysis_neighborhood: "Mission",
  supervisor_district: "8",
  data_as_of: "2026-03-20",
  data_loaded_at: "2026-03-20",
  ...overrides,
});

// SF City Hall as the filter origin
const SF_CENTER = { lat: 37.7792, lng: -122.4191 };

// ~400m north of SF_CENTER — within 805m (0.5 mile) radius
const NEARBY_COORDS = { latitude: "37.7828", longitude: "-122.4191" };

// ~1.7km north of SF_CENTER — outside 805m radius, inside 3219m (2 mile) radius
const FAR_COORDS = { latitude: "37.7949", longitude: "-122.4191" };

const makeDistanceFilter = (radiusMeters: number): DistanceFilter => ({
  coords: SF_CENTER,
  radiusMeters,
  locationText: "SF City Hall",
});

// The hook filters events to this date
const TEST_DATE = new Date("2026-03-20");

describe("useEventTransformation — distance filtering", () => {
  it("shows all events when no distance filter is applied", () => {
    const withLocation = makeEvent({ id: "with-loc", ...NEARBY_COORDS });
    const withoutLocation = makeEvent({
      id: "no-loc",
      latitude: "",
      longitude: "",
    });

    const { result } = renderHook(() =>
      useEventTransformation(
        [withLocation, withoutLocation],
        null,
        null,
        TEST_DATE
      )
    );

    const ids = result.current.map((e) => e.id);
    expect(ids).toContain("with-loc");
    expect(ids).toContain("no-loc");
  });

  it("includes events with valid coordinates within the radius", () => {
    const event = makeEvent({ id: "nearby", ...NEARBY_COORDS });

    const { result } = renderHook(() =>
      useEventTransformation([event], null, makeDistanceFilter(805), TEST_DATE)
    );

    expect(result.current.map((e) => e.id)).toContain("nearby");
  });

  it("excludes events with valid coordinates outside the radius", () => {
    const event = makeEvent({ id: "far", ...FAR_COORDS });

    const { result } = renderHook(() =>
      useEventTransformation([event], null, makeDistanceFilter(805), TEST_DATE)
    );

    expect(result.current.map((e) => e.id)).not.toContain("far");
  });

  it("includes a far event when the radius is large enough to cover it", () => {
    const event = makeEvent({ id: "far", ...FAR_COORDS });

    const { result } = renderHook(() =>
      useEventTransformation([event], null, makeDistanceFilter(3219), TEST_DATE)
    );

    expect(result.current.map((e) => e.id)).toContain("far");
  });

  it("excludes events with empty latitude/longitude when a distance filter is active", () => {
    const event = makeEvent({ id: "no-loc", latitude: "", longitude: "" });

    const { result } = renderHook(() =>
      useEventTransformation([event], null, makeDistanceFilter(805), TEST_DATE)
    );

    expect(result.current).toHaveLength(0);
  });

  it("excludes events with non-numeric latitude/longitude when a distance filter is active", () => {
    const event = makeEvent({
      id: "bad-coords",
      latitude: "unknown",
      longitude: "unknown",
    });

    const { result } = renderHook(() =>
      useEventTransformation([event], null, makeDistanceFilter(805), TEST_DATE)
    );

    expect(result.current).toHaveLength(0);
  });

  it("shows events with no location when Any Distance is selected (distanceFilter is null)", () => {
    // EventFilterBar passes null when the radius dropdown is set to "Any distance"
    const event = makeEvent({ id: "no-loc", latitude: "", longitude: "" });

    const { result } = renderHook(() =>
      useEventTransformation([event], null, null, TEST_DATE)
    );

    expect(result.current.map((e) => e.id)).toContain("no-loc");
  });
});

describe("useEventTransformation — category filtering", () => {
  it("shows all events when no category is selected", () => {
    const eduEvent = makeEvent({ id: "edu", events_category: "Education" });
    const sportsEvent = makeEvent({ id: "sports", events_category: "Sports" });

    const { result } = renderHook(() =>
      useEventTransformation([eduEvent, sportsEvent], null, null, TEST_DATE)
    );

    const ids = result.current.map((e) => e.id);
    expect(ids).toContain("edu");
    expect(ids).toContain("sports");
  });

  it("filters to only show the selected category", () => {
    const eduEvent = makeEvent({ id: "edu", events_category: "Education" });
    const sportsEvent = makeEvent({ id: "sports", events_category: "Sports" });

    const { result } = renderHook(() =>
      useEventTransformation(
        [eduEvent, sportsEvent],
        "Education",
        null,
        TEST_DATE
      )
    );

    const ids = result.current.map((e) => e.id);
    expect(ids).toContain("edu");
    expect(ids).not.toContain("sports");
  });
});

describe("useEventTransformation — combined category and distance filtering", () => {
  it("applies both category and distance filters together", () => {
    const nearEdu = makeEvent({
      id: "near-edu",
      events_category: "Education",
      ...NEARBY_COORDS,
    });
    const nearSports = makeEvent({
      id: "near-sports",
      events_category: "Sports",
      ...NEARBY_COORDS,
    });
    const farEdu = makeEvent({
      id: "far-edu",
      events_category: "Education",
      ...FAR_COORDS,
    });
    const noLocEdu = makeEvent({
      id: "no-loc-edu",
      events_category: "Education",
      latitude: "",
      longitude: "",
    });

    const { result } = renderHook(() =>
      useEventTransformation(
        [nearEdu, nearSports, farEdu, noLocEdu],
        "Education",
        makeDistanceFilter(805),
        TEST_DATE
      )
    );

    const ids = result.current.map((e) => e.id);
    expect(ids).toContain("near-edu");
    expect(ids).not.toContain("near-sports"); // wrong category
    expect(ids).not.toContain("far-edu"); // outside radius
    expect(ids).not.toContain("no-loc-edu"); // no coordinates
  });
});
