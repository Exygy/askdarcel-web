export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
    meta?: {
      [key: string]: string;
    };
  } | null;
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

interface Image extends BaseAttributes {
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats: {
    large: ImageFormat;
    medium: ImageFormat;
    small: ImageFormat;
    thumbnail: ImageFormat;
  }
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

export interface Homepage extends BaseAttributes {
  title: string;
  Hero: {
    id: number;
    title: string;
    description: string;
    background_image: StrapiResponse<Image>;
    buttons: Link[];
  };
  category_section: ContentBlock;
  opportunity_section: ContentBlock;
  
}
