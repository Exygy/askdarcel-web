/**
  NOTE @rosschapman: Developers may be tempted to auto-generate response types as described in the strapi docs using cli
  commands from the `@strapi/strapi` module, but I've noticed the output is funky for use in a client application in its
  raw form. For example, string fields from the recommended module are typed as `Attribute.String` but this type isn't compatible
  with `string` 🤦. Strapi offers this cumbersome approach to sync types, but also caveats this is not an official
  solution: https://strapi.io/blog/improve-your-frontend-experience-with-strapi-types-and-type-script. Even so, I still
  don't trust the generated types in view of the above example.
*/

import useSWR from "swr";
import fetcher from "utils/fetcher";
import config from "../config";

interface SWRHookResult<T> {
  data: StrapiApi.StrapiDataResponse<T>;
  error?: Error;
  isLoading: boolean;
}

function useStrapiHook<T>(path: string): SWRHookResult<T> {
  const dataFetcher = () =>
    fetcher<StrapiApi.StrapiResponse<T>>(
      `${config.STRAPI_API_URL}/api/${path}`,
      {
        Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
      }
    );

  const { data, error, isLoading } = useSWR<StrapiApi.StrapiResponse<T>>(
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
  return useStrapiHook<StrapiApi.FooterResponse>(
    "footer?populate[links][populate]=*"
  );
}

export function useHomepageData() {
  return useStrapiHook<StrapiApi.HomepageResponse>(
    "home-page?populate[hero][populate]=*&populate[category_section][populate]=*&populate[opportunity_section][populate]=*&populate[opportunities][populate][image][populate]=*&populate[opportunities][populate][address]=*&populate[opportunities][populate][links][populate]=*&populate[opportunities][populate][opportunity_categories]=*&populate[event_section][populate]=*&populate[events][populate][date]=*&populate[events][populate][address]=*&populate[events][populate][links]=*&populate[events][populate][image][populate]=*&populate[events][populate][event_categories]=*&populate[two_column_content_blocks][populate][link]=*&populate[two_column_content_blocks][populate][media][populate]=*"
  );
}

export function usePageContent(title: string) {
  return useStrapiHook<StrapiApi.ContentPageResponse>(
    `content-pages?filters[title][$eq]=${title}&populate[two_column_content_blocks][populate][link]=*&populate[two_column_content_blocks][populate][media][populate]=*`
  );
}

export namespace StrapiApi {
  interface Meta {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  }

  // Single data item response
  export interface StrapiDatumResponse<T> {
    id: number;
    attributes: T;
  }

  // Data response can be a single item, an array of items, or null
  export type StrapiDataResponse<T> =
    | StrapiDatumResponse<T>
    | Array<StrapiDatumResponse<T>>
    | null;

  // Unified response interface for object or array responses
  export interface StrapiResponse<T> {
    data: StrapiDataResponse<T>;
    meta?: Meta;
  }

  // Specific response interface for when data is a single object (optional, but useful)
  export interface StrapiObjectResponse<T> {
    data: StrapiDatumResponse<T> | null;
    meta?: Meta;
  }

  // Specific response interface for when data is an array (optional, but useful)
  export interface StrapiArrayResponse<T> {
    data: Array<StrapiDatumResponse<T>> | null;
    meta?: Meta;
  }

  interface BaseAttributesResponse {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  }

  interface CategoryResponse extends BaseAttributesResponse {
    label: string;
  }

  export interface LinkResponse {
    id: number;
    url: string;
    text: string;
  }

  export interface DynamicLinkResponse {
    id: number;
    // __component is a key used by Strapi
    // that may not have practical purposes for the frontend
    __component: string;
    title: string;
    link: LinkResponse[];
  }

  export interface DynamicMediaResponse {
    id: number;
    __component: string;
    image?: StrapiObjectResponse<ImageResponse>;
    url?: string;
  }

  export interface FooterResponse {
    address: string;
    email_address: string;
    phone_number: string;
    links: DynamicLinkResponse[];
  }

  export interface ImageFormatResponse {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    name: string;
    path?: string;
    size: number;
    width: number;
    height: number;
    sizeInBytes: number;
  }

  export interface FormatsResponse {
    large: ImageFormatResponse;
    medium: ImageFormatResponse;
    small: ImageFormatResponse;
    thumbnail: ImageFormatResponse;
  }

  export interface ImageResponse extends BaseAttributesResponse {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats: FormatsResponse;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: unknown;
  }

  // this corresponds to the "Content Block" component in Strapi
  export interface ContentBlockResponse {
    id: number;
    header: string;
    subheader: string;
    background_color: {
      id: number;
      color: "primary" | "secondary" | "tertiary";
    };
    link: LinkResponse;
  }

  // this corresponds to the "Address" component in Strapi
  interface AddressResponse {
    id: number;
    street: string;
    zipcode: string;
    geolocation: {
      address: string;
      geohash: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    } | null;
  }

  export interface TwoColumnContentBlockResponse
    extends BaseAttributesResponse {
    title: string;
    media_alignment: "left" | "right";
    content: string;
    name: string;
    link: LinkResponse;
    media: DynamicMediaResponse[];
  }

  export interface OpportunityResponse extends BaseAttributesResponse {
    title: string;
    description: string;
    startdate: string;
    enddate: string;
    venue: string;
    email: string;
    organizer: string;
    signup_info: string;
    eligibility_info: string;
    age_range: string;
    target_population: string;
    opportunity_categories: Array<StrapiDatumResponse<CategoryResponse>>;
    address: AddressResponse;
    links: LinkResponse[];
    image: {
      id: number;
      image: StrapiObjectResponse<ImageResponse>;
    };
  }

  interface DateResponse {
    id: number;
    startdate: string;
    enddate: string;
    starttime: string;
    endtime: string;
    recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  }

  export interface EventResponse extends BaseAttributesResponse {
    title: string;
    venue: string;
    admissions: string;
    description: string;
    date: DateResponse;
    address: AddressResponse;
    image: {
      id: number;
      image: StrapiObjectResponse<ImageResponse>;
    };
    links: LinkResponse[];
    event_categories: Array<StrapiDatumResponse<CategoryResponse>>;
  }

  export interface HomepageResponse extends BaseAttributesResponse {
    title: string;
    hero: {
      id: number;
      title: string;
      description: string;
      background_image: StrapiObjectResponse<ImageResponse>;
      buttons: LinkResponse[];
    };
    category_section: ContentBlockResponse;
    opportunity_section: ContentBlockResponse;
    opportunities: StrapiArrayResponse<OpportunityResponse>;
    event_section: ContentBlockResponse;
    events: StrapiArrayResponse<EventResponse>;
    two_column_content_blocks: StrapiArrayResponse<TwoColumnContentBlockResponse>;
  }

  export interface ContentPageResponse extends BaseAttributesResponse {
    title: string;
    masthead: string;
    two_column_content_blocks: StrapiArrayResponse<TwoColumnContentBlockResponse>;
  }
}
