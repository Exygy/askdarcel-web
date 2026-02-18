import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { InstantSearch } from "react-instantsearch-core";
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

  // searchFunction provides batching: helper.setState() calls are deferred
  // until this function is called, preventing infinite search loops from
  // Configure re-applying props on every render.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchFunction = useCallback((helper: any) => {
    helper.search();
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
