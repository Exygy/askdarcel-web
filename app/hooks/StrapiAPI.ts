import useSWR from "swr";
import fetcher from "utils/fetcher";
import { Homepage, StrapiDataResponse, type Footer, type StrapiResponse } from "models/Strapi";
import config from "../config";

interface SWRHookResult<T> {
  data: StrapiDataResponse<T>;
  error?: Error;
  isLoading: boolean;
}

function useStrapiHook<T>(path: string): SWRHookResult<T> {
  const dataFetcher = () =>
    fetcher<StrapiResponse<T>>(`${config.STRAPI_API_URL}/api/${path}`, {
      Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
    });

  const { data, error, isLoading } = useSWR<StrapiResponse<T>>(
    `/api/${path}`,
    dataFetcher
  );

  return {
    data: data?.data ? data.data : null,
    error,
    isLoading,
  };
}

export function useFooterData() {
  return useStrapiHook<Footer>("footer?populate[links][populate]=*");
}


// TODO: Hero => hero, Date => date, Address => address
export function useHomepageData() {
  return useStrapiHook<Homepage>("home-page?populate[Hero][populate]=*&populate[category_section][populate]=*&populate[opportunity_section][populate]=*&populate[opportunities][populate][image][populate]=*&populate[opportunities][populate][address]=*&populate[opportunities][populate][links][populate]=*&populate[opportunities][populate][opportunity_categories]=*&populate[event_section][populate]=*&populate[events][populate][Date]=*&populate[events][populate][Address]=*&populate[events][populate][links]=*&populate[events][populate][image][populate]=*&populate[events][populate][event_categories]=*");
}
