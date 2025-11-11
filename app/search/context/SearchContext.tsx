import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { InstantSearch } from "react-instantsearch-core";
import { history as historyRouter } from "instantsearch.js/es/lib/routers";
import { getAlgoliaProvider } from "../providers/algolia";
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
  const provider = useMemo(() => getAlgoliaProvider(), []);
  const searchClient = provider.getLiteClient();
  const indexName = provider.getIndexName();

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
        routing={{
          router: historyRouter({
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
