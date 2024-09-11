import React, { useMemo, createContext, useContext } from "react";
import { GeoCoordinates } from "utils";

interface Context {
  userLocation: GeoCoordinates | null;
  aroundUserLocationRadius?: "all" | number;
}

interface AppProviderProps extends Context {
  children: React.ReactNode;
}

export const AppContext = createContext<Context>({
  userLocation: null,
  aroundUserLocationRadius: "all",
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({
  children,
  userLocation,
  aroundUserLocationRadius,
}: AppProviderProps) => {
  // We have to use useMemo here to manage the contextValue to ensure that the user's authState
  // propagates downward after authentication. I couldn't find a way to get this to work with
  // useState. Moreover, we can't use a simple object to define contextValue, as the object would
  // be recreated at each render and thus force all of its child components to re-render as well.
  const contextValue = useMemo(() => {
    return {
      userLocation,
      aroundUserLocationRadius,
    };
  }, [userLocation, aroundUserLocationRadius]);

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// NEEd to add setting function in ehre
