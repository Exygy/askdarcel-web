export interface Single {
  data: {
    id: number;
    attributes: {
      [key: string]: string;
    };
    meta: {
      [key: string]: string;
    }
  };
}

export interface Link {
  id: number;
  url: string;
  text: string;
}

export interface DynamicLink {
  id: number;
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
