/**
 * High-level WCAG 2.1 AA accessibility tests for all pages.
 *
 * Each test renders a page and runs axe to detect automated accessibility
 * violations. These tests intentionally avoid asserting on specific content —
 * the goal is broad axe coverage across every page so that structural,
 * landmark, ARIA, and heading issues surface in CI.
 *
 * Note: axe cannot detect color-contrast violations in jsdom (no computed
 * styles), so contrast should be verified with browser-based tooling.
 */
import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { InstantSearch } from "react-instantsearch-core";
import { AppProvider } from "utils/useAppContext";
import { COORDS_MID_SAN_FRANCISCO } from "utils";
import { createSearchClient } from "../../test/helpers/createSearchClient";

import { HomePage } from "pages/HomePage";
import { ContentPage } from "pages/ContentPage";
import { FaqPage } from "pages/FaqPage/FaqPage";
import { EventDetailPage } from "pages/EventDetailPage/EventDetailPage";
import { OrganizationDetailPage } from "pages/OrganizationDetailPage";
import { ServiceDetailPage } from "pages/ServiceDetailPage/ServiceDetailPage";
import { ResultsPage } from "pages/ResultsPage/ResultsPage";
import { PageNotFoundPage } from "pages/PageNotFoundPage/PageNotFoundPage";

// ─── Mock: Strapi API hooks ───────────────────────────────────────────────────

jest.mock("hooks/StrapiAPI", () => {
  // HOME_PAGE_DATA is imported at module scope but jest.mock is hoisted — use
  // require() inside the factory to access it after module initialization.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { HOME_PAGE_DATA } = require("../../test/fixtures/HomePageData");

  return {
    useHomepageData: () => ({ data: HOME_PAGE_DATA.data, isLoading: false }),
    useHomePageFeaturedResourcesData: () => ({ data: [], isLoading: false }),
    useFaqPageData: () => ({
      data: {
        attributes: {
          masthead: "Frequently Asked Questions",
          headercontent: "Common Questions",
          faq: [
            {
              question: "What is this service?",
              answer: "A resource directory for San Francisco residents.",
            },
            {
              question: "Who can use it?",
              answer: "Anyone looking for services in the SF Bay Area.",
            },
            {
              question: "Is it free?",
              answer: "Yes, this service is completely free to use.",
            },
          ],
          image: null,
        },
      },
      isLoading: false,
    }),
    useContentPageData: () => ({
      data: [
        {
          attributes: {
            masthead: "About Us",
            content_block: [
              {
                __component: "content.two-column-content-block",
                id: 1,
                title: "Our Mission",
                media_align: "right",
                content: [
                  {
                    type: "paragraph",
                    children: [
                      {
                        type: "text",
                        text: "We connect San Francisco residents with the services they need.",
                      },
                    ],
                  },
                ],
                media: { data: null },
              },
            ],
          },
        },
      ],
      isLoading: false,
    }),
    useEventData: () => ({ data: null, error: true, isLoading: false }),
  };
});

// ─── Mock: SF Gov API hooks ──────────────────────────────────────────────────

jest.mock("hooks/SFGovAPI", () => ({
  useAllSFGovEvents: () => ({ data: [], isLoading: false }),
}));

// ─── Mock: SF Open Data hooks ────────────────────────────────────────────────

jest.mock("hooks/SFOpenData", () => ({
  useOrganizationDetails: () => ({
    data: null,
    error: true,
    isLoading: false,
    isLoadingRelated: false,
  }),
  useServiceDetails: () => ({
    data: null,
    error: true,
    isLoading: false,
    isLoadingRelated: false,
  }),
  useOrganizationServices: () => ({ data: [] }),
  transformOrganization: jest.fn(),
  transformService: jest.fn(),
  transformSchedules: jest.fn(() => ({ intervals: [] })),
}));

// ─── Mock: Typesense hooks ───────────────────────────────────────────────────

jest.mock("hooks/TypesenseHooks", () => ({
  useTypesenseFacets: () => ({ categories: [], eligibilities: [] }),
  useTopLevelCategories: () => ({ categories: [] }),
}));

// ─── Mock: Search provider ───────────────────────────────────────────────────

const mockSearchProvider = {
  getLiteClient: () => createSearchClient(),
  getIndexName: () => "test_index",
  getInstantSearchAdapter: () => ({}),
  search: jest.fn(),
  searchForFacetValues: jest.fn(),
  getCapabilities: () => ({
    facetableFields: ["categories", "eligibilities"],
    sortableFields: [],
    supportsGeoSearch: true,
    supportsHighlighting: true,
  }),
};

jest.mock("search/providers", () => ({
  getSearchProvider: () => mockSearchProvider,
}));

jest.mock("search/context/SearchContext", () => ({
  ...jest.requireActual("search/context/SearchContext"),
  useSearchContext: () => ({ provider: mockSearchProvider }),
}));

// ─── Mock: SearchMap (avoids Google Maps rendering issues in jsdom) ───────────

jest.mock("components/SearchAndBrowse/SearchMap/SearchMap", () => ({
  SearchMap: ({
    handleSearchMapAction,
  }: {
    handleSearchMapAction: (action: number) => void;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mockReact = require("react");
    const hasInitialized = mockReact.useRef(false);
    mockReact.useEffect(() => {
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        handleSearchMapAction(1); // SearchMapActions.MapInitialized = 1
      }
    }, [handleSearchMapAction]);
    return mockReact.createElement(
      "div",
      { "data-testid": "search-map-mock" },
      "Search Map"
    );
  },
}));

// ─── Shared wrappers ─────────────────────────────────────────────────────────

/** Wraps pages that need routing + Helmet but not search context. */
const Providers = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </HelmetProvider>
);

/** Wraps ResultsPage, which needs InstantSearch + AppProvider. */
const SearchProviders = ({ children }: { children: React.ReactNode }) => {
  const [aroundLatLng, setAroundLatLng] = React.useState("");
  const [aroundRadius, setAroundRadius] = React.useState(1600);
  const [boundingBox, setBoundingBox] = React.useState<string | undefined>();

  return (
    <HelmetProvider>
      <MemoryRouter initialEntries={["/search"]}>
        <AppProvider
          userLocation={{
            coords: COORDS_MID_SAN_FRANCISCO,
            inSanFrancisco: false,
          }}
          aroundLatLng={aroundLatLng}
          setAroundLatLng={setAroundLatLng}
          aroundUserLocationRadius={aroundRadius}
          setAroundRadius={setAroundRadius}
          boundingBox={boundingBox}
          setBoundingBox={setBoundingBox}
        >
          <InstantSearch
            searchClient={createSearchClient()}
            indexName="test_index"
          >
            {children}
          </InstantSearch>
        </AppProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Accessibility: page-level axe scans", () => {
  beforeAll(() => {
    jest.setTimeout(15000);
  });

  it("PageNotFoundPage has no violations", async () => {
    const { container } = render(<PageNotFoundPage />, { wrapper: Providers });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("FaqPage has no violations", async () => {
    const { container } = render(<FaqPage />, { wrapper: Providers });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ContentPage has no violations", async () => {
    const { container } = render(<ContentPage pageName="About" />, {
      wrapper: Providers,
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("HomePage has no violations", async () => {
    const { container } = render(<HomePage />, { wrapper: Providers });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("EventDetailPage (error state) has no violations", async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/events/test-event"]}>
          <Routes>
            <Route
              path="/events/:eventListingId"
              element={<EventDetailPage />}
            />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("OrganizationDetailPage (error state) has no violations", async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/organizations/test-org"]}>
          <Routes>
            <Route
              path="/organizations/:organizationListingId"
              element={<OrganizationDetailPage />}
            />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ServiceDetailPage (error state) has no violations", async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/services/test-service"]}>
          <Routes>
            <Route
              path="/services/:serviceListingId"
              element={<ServiceDetailPage />}
            />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ResultsPage (search mode) has no violations", async () => {
    const { container } = render(
      <SearchProviders>
        <Routes>
          <Route path="/search" element={<ResultsPage />} />
        </Routes>
      </SearchProviders>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
