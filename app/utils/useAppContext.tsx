import { AroundRadius } from "@algolia/client-search";
import React, {
  useMemo,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { COORDS_MID_SAN_FRANCISCO, UserLocation } from "utils";

interface Context {
  userLocation: UserLocation;
  aroundUserLocationRadius?: AroundRadius;
  aroundLatLng: string;
  boundingBox?: string;
}

interface ContextUpdater {
  setAroundRadius: Dispatch<SetStateAction<"all" | number>>;
  setAroundLatLng: Dispatch<SetStateAction<string>>;
  setBoundingBox: Dispatch<SetStateAction<string | undefined>>;
}

interface AppProviderProps {
  userLocation: UserLocation;
  aroundLatLng: string;
  children: React.ReactNode;
  setAroundLatLng: Dispatch<SetStateAction<string>>;
  aroundUserLocationRadius: AroundRadius;
  setAroundRadius: Dispatch<SetStateAction<"all" | number>>;
  boundingBox?: string;
  setBoundingBox: Dispatch<SetStateAction<string | undefined>>;
}

export const AppContext = createContext<Context>({
  userLocation: {
    coords: COORDS_MID_SAN_FRANCISCO,
    inSanFrancisco: false,
  },
  aroundUserLocationRadius: 1600,
  aroundLatLng: "",
  boundingBox: undefined,
});

export const AppContextUpdater = createContext<ContextUpdater>({
  setAroundRadius: () => 1600,
  setAroundLatLng: () => "",
  setBoundingBox: () => undefined,
});

export const useAppContext = () => useContext(AppContext);
export const useAppContextUpdater = () => useContext(AppContextUpdater);

export const AppProvider = ({
  children,
  userLocation,
  aroundLatLng,
  setAroundLatLng,
  aroundUserLocationRadius,
  setAroundRadius,
  boundingBox,
  setBoundingBox,
}: AppProviderProps) => {
  // We have to use useMemo here to manage the contextValue to ensure that the user's authState
  // propagates downward after authentication. I couldn't find a way to get this to work with
  // useState. Moreover, we can't use a simple object to define contextValue, as the object would
  // be recreated at each render and thus force all of its child components to re-render as well.
  const contextValue = useMemo(() => {
    return {
      userLocation,
      aroundUserLocationRadius,
      aroundLatLng,
      boundingBox,
    };
  }, [userLocation, aroundUserLocationRadius, aroundLatLng, boundingBox]);

  return (
    <AppContext.Provider value={contextValue}>
      <AppContextUpdater.Provider
        value={{ setAroundRadius, setAroundLatLng, setBoundingBox }}
      >
        {children}
      </AppContextUpdater.Provider>
    </AppContext.Provider>
  );
};

// NEEd to add setting function in ehre
