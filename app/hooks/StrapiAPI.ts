/**
 * NOTE @rosschapman: Developers may be tempted to auto-generate response types as described in the strapi docs using cli
 * commands from the `@strapi/strapi` module, but I've noticed the output is funky for use in a client application in its
 * raw form. For example, string fields from the recommended module are typed as `Attribute.String` but this type isn't compatible
 * with `string` 🤦. Strapi offers this cumbersome approach to sync types, but also caveats this is not an official
 * solution: https://strapi.io/blog/improve-your-frontend-experience-with-strapi-types-and-type-script. Even so, I still
 * don't trust the generated types in view of the above example.
 *
 * For more information about fetching relational data using the `populate` and
 * `field` selectors, see: https://docs.strapi.io/dev-docs/api/rest/populate-select
 */

import useSWR from "swr";
import fetcher from "utils/fetcher";
import config from "../config";
import { RootNode } from "@strapi/blocks-react-renderer/dist/BlocksRenderer";

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
  return useStrapiHook<FooterResponse>("footer?populate[links][populate]=*");
}

export function useHomepageData() {
  return useStrapiHook<HomepageResponse>(
    "home-page?populate[hero][populate]=*&populate[category_section][populate]=*&populate[two_column_content_blocks][populate][link]=*&populate[two_column_content_blocks][populate][media][populate]=*"
  );
}

export function usePageContent(title: string) {
  return useStrapiHook<ContentPageResponse>(
    `content-pages?filters[title][$eq]=${title}&populate[two_column_content_blocks][populate][link]=*&populate[two_column_content_blocks][populate][media][populate]=*&populate[two_column_content_blocks][populate][faq]=*`
  );
}

export function useNavigationData() {
  const path = "header?populate[logo]=*&populate[navigation][populate]=*";

  const dataFetcher = () =>
    fetcher<{ data: StrapiDatumResponse<HeaderResponse> }>(
      `${config.STRAPI_API_URL}/api/${path}`,
      {
        Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
      }
    );

  const { data, error, isLoading } = useSWR(`/api/${path}`, dataFetcher) as {
    data: { data: StrapiDatumResponse<HeaderResponse> };
    error: unknown;
    isLoading: boolean;
  };

  return {
    data: data?.data ? data?.data.attributes : null,
    error,
    isLoading,
  };
}

/**
 * Fetches only featured events with embedded data for associated content types
 */
export function useHomePageEventsData() {
  const path =
    "events?populate[address]=*&populate[calendar_event]=*&populate[link]=*&populate[image][populate]=*&filters[featured][$eq]=true";

  const dataFetcher = () =>
    fetcher<{ data: Array<StrapiDatumResponse<EventResponse>> }>(
      `${config.STRAPI_API_URL}/api/${path}`,
      {
        Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
      }
    );

  const { data, error, isLoading } = useSWR(`/api/${path}`, dataFetcher) as {
    data: { data: Array<StrapiDatumResponse<EventResponse>> };
    error: unknown;
    isLoading: boolean;
  };

  return {
    data: data?.data ? formatHomePageEventsData(data) : null,
    error,
    isLoading,
  };
}

export function useEventData(eventId: string) {
  const path = `events/${eventId}?populate[address]=*&populate[calendar_event]=*&populate[link]=*&populate[image][populate]=*&populate[event_categories][fields]=label&populate[event_eligibilities][fields]=label`;

  const dataFetcher = () =>
    fetcher<{ data: StrapiDatumResponse<EventResponse> }>(
      `${config.STRAPI_API_URL}/api/${path}`,
      {
        Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
      }
    );

  const { data, error, isLoading } = useSWR(`/api/${path}`, dataFetcher);

  return {
    data: {
      ...data?.data?.attributes,
      id: data?.data?.id,
      categories: data?.data.attributes.event_categories?.data.map(
        (category: StrapiDatumResponse<CategoryResponse>) => ({
          id: category.id,
          label: category.attributes.label,
        })
      ),
      eligibilities: data?.data.attributes.event_eligibilities?.data.map(
        (eligibility: StrapiDatumResponse<EligibilityResponse>) => ({
          id: eligibility.id,
          label: eligibility.attributes.label,
        })
      ),
    },
    error,
    isLoading,
  };
}

export function formatHomePageEventsData(data: {
  data: Array<StrapiDatumResponse<EventResponse>>;
}) {
  return data.data.map((eventData) => ({
    ...eventData.attributes,
    id: eventData.id,
  }));
}

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

interface BaseDatumAttributesResponse {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface FormatsResponse {
  large?: ImageFormatResponse;
  medium?: ImageFormatResponse;
  small?: ImageFormatResponse;
  thumbnail?: ImageFormatResponse;
}

export interface ImageResponse extends BaseDatumAttributesResponse {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: FormatsResponse;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
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
    color: string;
  };
  link: LinkResponse;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TwoColumnContentBlockResponse
  extends BaseDatumAttributesResponse {
  title: string;
  media_alignment: string;
  content: string;
  name: string;
  link: LinkResponse;
  media: DynamicMediaResponse[];
  faq?: FaqItem[];
}

export interface CalendarEventResponse {
  id: number;
  startdate: string;
  enddate: string | null;
  starttime: string | null;
  endtime: string | null;
}

export interface HomepageResponse extends BaseDatumAttributesResponse {
  hero: {
    id: number;
    title: string;
    description: string;
    background_image: StrapiObjectResponse<ImageResponse>;
    buttons: LinkResponse[];
  };
  category_section: ContentBlockResponse;
  two_column_content_blocks: StrapiArrayResponse<TwoColumnContentBlockResponse>;
}

export interface ContentPageResponse extends BaseDatumAttributesResponse {
  title: string;
  masthead: string;
  two_column_content_blocks: StrapiArrayResponse<TwoColumnContentBlockResponse>;
}

export interface HeaderResponse extends BaseDatumAttributesResponse {
  logo: {
    data: {
      attributes: LogoResponse;
    };
  };
  navigation: NavigationMenuResponse[];
}

export interface LogoResponse {
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  formats: FormatsResponse;
  // TODO uknown types
  // provider_metadata: null;
}

export interface NavigationMenuResponse {
  id: number;
  __component: "navigation.menu";
  // The plurality mismatch here is a quirk of strapi's serialization of repeatable nested components
  link: LinkResponse[];
  title: string;
}

export interface EventResponse extends BaseDatumAttributesResponse {
  id: number;
  title: string;
  description: RootNode[];
  calendar_event: CalendarEventResponse;
  address: AddressResponse | { data: null };
  image: {
    data: { id: number; attributes: ImageResponse };
  };
  link: LinkResponse | null;
  event_categories?: { data: Array<StrapiDatumResponse<CategoryResponse>> };
  event_eligibilities?: {
    data: Array<StrapiDatumResponse<EligibilityResponse>>;
  };
  age_group: string;
}

interface CategoryResponse extends BaseDatumAttributesResponse {
  label: string;
}

interface EligibilityResponse extends BaseDatumAttributesResponse {
  label: string;
}

export interface AddressResponse {
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
  };
}
