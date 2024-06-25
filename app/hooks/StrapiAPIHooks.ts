import useSWR from "swr"
import fetcher from "utils/fetcher";
import config from "../config";
import { type Footer } from "models/Strapi";

interface SWR {
  error?: Error;
  isLoading: boolean;
}

interface FooterData extends SWR {
  data: Footer;
}

export function useFooterData(): FooterData {
  const { data, error, isLoading } = useSWR(
    '/api/footer',
    fetcher.bind({},
      `${config.STRAPI_API_URL}/api/footer?populate[links][populate]=*`,
      {
        'Authorization': `Bearer ${config.STRAPI_API_TOKEN}`
      }
    )
  );

  return {
    data: data?.data?.attributes,
    error,
    isLoading
  };
}
