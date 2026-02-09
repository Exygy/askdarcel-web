import { useState, useCallback, useRef, useEffect } from "react";

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface UsePlacesAutocompleteOptions {
  debounceMs?: number;
  minLength?: number;
}

interface UsePlacesAutocompleteReturn {
  predictions: PlacePrediction[];
  isLoading: boolean;
  error: string | null;
  getPlaceDetails: (
    placeId: string
  ) => Promise<{ lat: number; lng: number } | null>;
  clearPredictions: () => void;
  searchPlaces: (input: string) => void;
}

export function usePlacesAutocomplete(
  options: UsePlacesAutocompleteOptions = {}
): UsePlacesAutocompleteReturn {
  const { debounceMs = 300, minLength = 2 } = options;

  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize services when Google Maps API is available
  useEffect(() => {
    const initServices = () => {
      if (
        typeof google !== "undefined" &&
        google.maps &&
        google.maps.places
      ) {
        if (!autocompleteServiceRef.current) {
          autocompleteServiceRef.current =
            new google.maps.places.AutocompleteService();
        }
        if (!placesServiceRef.current) {
          // PlacesService requires a DOM element or map, but we only need getDetails
          // which doesn't actually use the element for our purposes
          const dummyDiv = document.createElement("div");
          placesServiceRef.current = new google.maps.places.PlacesService(
            dummyDiv
          );
        }
        return true;
      }
      return false;
    };

    // Try immediately
    if (initServices()) return;

    // If not ready, poll until it is
    const intervalId = setInterval(() => {
      if (initServices()) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  const searchPlaces = useCallback(
    (input: string) => {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Clear predictions if input is too short
      if (!input || input.length < minLength) {
        setPredictions([]);
        setError(null);
        return;
      }

      setIsLoading(true);

      debounceTimerRef.current = setTimeout(() => {
        if (!autocompleteServiceRef.current) {
          setError("Google Places API not loaded");
          setIsLoading(false);
          return;
        }

        autocompleteServiceRef.current.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: "us" },
          },
          (results, status) => {
            setIsLoading(false);

            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              const formattedPredictions: PlacePrediction[] = results.map(
                (prediction) => ({
                  placeId: prediction.place_id,
                  description: prediction.description,
                  mainText: prediction.structured_formatting.main_text,
                  secondaryText:
                    prediction.structured_formatting.secondary_text || "",
                })
              );
              setPredictions(formattedPredictions);
              setError(null);
            } else if (
              status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              setPredictions([]);
              setError(null);
            } else {
              setPredictions([]);
              setError("Failed to fetch place predictions");
            }
          }
        );
      }, debounceMs);
    },
    [debounceMs, minLength]
  );

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
      if (!placesServiceRef.current) {
        setError("Google Places API not loaded");
        return null;
      }

      return new Promise((resolve) => {
        placesServiceRef.current!.getDetails(
          {
            placeId,
            fields: ["geometry"],
          },
          (place, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              place?.geometry?.location
            ) {
              resolve({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            } else {
              setError("Failed to get place details");
              resolve(null);
            }
          }
        );
      });
    },
    []
  );

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    getPlaceDetails,
    clearPredictions,
    searchPlaces,
  };
}
