export interface StrapiDatumResponse<T> {
  id: number;
  attributes: T;
}

export type StrapiDataResponse<T> = StrapiDatumResponse<T> | Array<StrapiDatumResponse<T>> | null;

export interface StrapiResponse<T> {
  data: StrapiDataResponse<T>;
  meta?: {
    [key: string]: string;
  };
}

export interface Link {
  id: number;
  url: string;
  text: string;
}

export interface DynamicLink {
  id: number;
  // __component is a key used by Strapi
  // that may not have practical purposes for the frontend
  __component: string;
  title: string;
  link: Link[];
}

interface DynamicMedia {
  id: number;
  __component: string;
  image?: StrapiResponse<Image>;
  url?: string;
}

export interface Footer {
  address: string;
  email_address: string;
  phone_number: string;
  links: DynamicLink[];
}

interface BaseAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface CategoryResponse extends BaseAttributes {
  label: string;
}

interface ImageFormat {
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

export interface Formats {
  large: ImageFormat;
  medium: ImageFormat;
  small: ImageFormat;
  thumbnail: ImageFormat;
}

interface Image extends BaseAttributes {
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats: Formats;
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
interface ContentBlock {
  id: number;
  header: string;
  subheader: string;
  background_color: {
    id: number;
    color: string;
  };
  link: Link;
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
    }
  } | null;
}

interface TwoColumnContentBlock extends BaseAttributes {
  title: string;
  media_alignment: "left" | "right";
  content: string;
  name: string;
  link: Link;
  media: DynamicMedia[];
}

export interface Opportunity extends BaseAttributes {
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
  links: Link[];
  image: {
    id: number;
    image: StrapiResponse<Image>;
  };
}

interface DateResponse {
  id: number;
  startdate: string;
  enddate: string;
  starttime: string;
  endtime: string;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly"
}

export interface Event extends BaseAttributes {
  title: string;
  venue: string;
  admissions: string;
  description: string;
  date: DateResponse;
  address: AddressResponse;
  image: {
    id: number;
    image: StrapiResponse<Image>;
  };
  links: Link[];
  event_categories: Array<StrapiDatumResponse<CategoryResponse>>;
}

export interface Homepage extends BaseAttributes {
  title: string;
  hero: {
    id: number;
    title: string;
    description: string;
    background_image: StrapiResponse<Image>;
    buttons: Link[];
  };
  category_section: ContentBlock;
  opportunity_section: ContentBlock;
  opportunities: StrapiResponse<Opportunity>;
  event_section: ContentBlock;
  events: StrapiResponse<Event>;
  two_column_content_blocks: Array<StrapiDatumResponse<TwoColumnContentBlock>>;
}
