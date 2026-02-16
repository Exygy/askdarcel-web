import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { InstantSearch } from "react-instantsearch-core";
import { history as historyRouter } from "instantsearch.js/es/lib/routers";
import { getSearchProvider } from "../providers";
import type { ISearchProvider } from "../types";

interface SearchContextValue {
  provider: ISearchProvider;
}

const SearchContext = createContext<SearchContextValue | null>(null);

interface SearchProviderProps {
  children: ReactNode;
}

/**
 * Search Provider Component
 * Wraps InstantSearch and provides abstracted search functionality
 *
 * This component isolates Algolia/InstantSearch from the rest of the app.
 * When migrating to Typesense, only this file needs to change.
 */
export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const provider = useMemo(() => getSearchProvider(), []);
  const searchClient = useMemo(() => provider.getLiteClient(), [provider]);
  const indexName = useMemo(() => provider.getIndexName(), [provider]);

  // Search function that prevents searches without Configure component
  // Configure sets maxValuesPerFacet, so we use that as an indicator
  // Unconfigured searches are simply skipped - Configure will trigger a proper search when ready
  const searchFunction = useCallback((helper: any) => {
    const hasConfig = helper.state.maxValuesPerFacet !== undefined;

    if (hasConfig) {
      helper.search();
    }
    // If no config, don't search - wait for Configure to render and trigger a proper search
  }, []);

  const contextValue = useMemo<SearchContextValue>(
    () => ({
      provider,
    }),
    [provider]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        searchFunction={searchFunction}
        routing={{
          router: historyRouter({
            // Prevent InstantSearch from clearing URL state when components unmount
            // This preserves the query when navigating between pages
            cleanUrlOnDispose: false,
            windowTitle(routeState) {
              const query = routeState[indexName]?.query;
              const queryTitle = query
                ? `Our415 - Search results for "${query}" in San Francisco`
                : "Our415 - Services in San Francisco";
              return queryTitle;
            },
          }),
        }}
      >
        {children}
      </InstantSearch>
    </SearchContext.Provider>
  );
};

/**
 * Hook to access the search provider
 * Components should use custom hooks instead of this directly
 */
export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return context;
}
