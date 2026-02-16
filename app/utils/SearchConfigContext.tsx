import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Configure } from "react-instantsearch-core";
import { AroundRadius } from "@algolia/client-search";

/**
 * SearchConfigContext - Centralized search configuration manager.
 * Renders a single <Configure> component with merged config from all sources.
 */

interface SearchConfig {
  // Geographic filters
  insideBoundingBox?: number[][];
  aroundLatLng?: string;
  aroundRadius?: AroundRadius;
  aroundPrecision?: number;
  minimumAroundRadius?: number;

  // Pagination
  hitsPerPage?: number;

  // Category filters
  filters?: string;

  // Any other Algolia configure props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SearchConfigContextValue {
  /** Update search config (merges with existing) */
  updateConfig: (config: Partial<SearchConfig>) => void;
  /** Current merged configuration */
  currentConfig: SearchConfig;
}

const SearchConfigContext = createContext<SearchConfigContextValue | undefined>(
  undefined
);

interface SearchConfigProviderProps {
  children: ReactNode;
  /** Initial configuration to set on mount */
  initialConfig?: Partial<SearchConfig>;
}

export const SearchConfigProvider: React.FC<SearchConfigProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<SearchConfig>(initialConfig);

  const updateConfig = useCallback((newConfig: Partial<SearchConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const contextValue: SearchConfigContextValue = {
    updateConfig,
    currentConfig: config,
  };

  return (
    <SearchConfigContext.Provider value={contextValue}>
      {Object.keys(config).length > 0 && (
        <Configure maxValuesPerFacet={9999} {...config} />
      )}
      {children}
    </SearchConfigContext.Provider>
  );
};

export const useSearchConfig = (): SearchConfigContextValue => {
  const context = useContext(SearchConfigContext);
  if (!context) {
    throw new Error("useSearchConfig must be used within SearchConfigProvider");
  }
  return context;
};
