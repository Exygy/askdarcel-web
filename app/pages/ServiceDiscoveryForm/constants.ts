export type Step =
  | "housingStatus"
  | "subcategoriesRadio"
  | "eligibilities"
  | "subcategories"
  | "results";

export interface Subcats {
  name: string;
  id: number;
}

export interface ServiceCategory {
  algoliaCategoryName: string;
  sortBy24HourAvailability?: boolean;
  disableGeoLocation?: boolean;
  sortAlgoliaSubcategoryRefinements?: boolean;
  id: string;
  name: string;
  abbreviatedName?: string;
  slug: string;
  steps: Step[];
  subcategorySubheading: string;
  subcats: Subcats[];
}

const defaultSubheading =
  "What are you currently looking for? Select all that apply.";

export const CATEGORIES: Readonly<ServiceCategory[]> = [
  {
    algoliaCategoryName: "Arts, Culture & Identity",
    id: "356",
    name: "Arts, Culture & Identity",
    slug: "arts-culture-identity",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "LGBTQ+ Support",
        "id": 201,
      },
      {
        "name": "Arts and Creative Expression",
        "id": 255,
      },
      {
        "name": "Disability Support",
        "id": 244,
      },
      {
        "name": "Culinary Arts",
        "id": 276,
      },
      {
        "name": "Summer Programs",
        "id": 284,
      },
      {
        "name": "Culture & Identity",
        "id": 294,
      },
      {
        "name": "Digital Media Production",
        "id": 258,
      },
      {
        "name": "Justice Involvement",
        "id": 342,
      },
      {
        "name": "Team Sports",
        "id": 354,
      }
    ]
  },
  {
    algoliaCategoryName: "Children's Care",
    id: "357",
    name: "Children's Care",
    slug: "childrens-care",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "Childcare",
        "id": 102,
      },
      {
        "name": "Summer Programs",
        "id": 284,
      },
      {
        "name": "After & Before School Care",
        "id": 343,
      },
      {
        "name": "Playgroups",
        "id": 344,
      }
    ]
  },
  {
    algoliaCategoryName: "Education",
    id: "358",
    name: "Education",
    slug: "education",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "Financial Education",
        "id": 94,
      },
      {
        "name": "Foreign Languages",
        "id": 135,
      },
      {
        "name": "Special Education",
        "id": 138,
      },
      {
        "name": "Computer Class",
        "id": 144,
      },
      {
        "name": "LGBTQ+ Support",
        "id": 201,
      },
      {
        "name": "SEL (Social Emotional Learning)",
        "id": 248,
      },
      {
        "name": "Disability Support",
        "id": 244,
      },
      {
        "name": "Learning English",
        "id": 231,
      },
      {
        "name": "Summer Programs",
        "id": 284,
      },
      {
        "name": "College Prep",
        "id": 291,
      },
      {
        "name": "STEM",
        "id": 293,
      },
      {
        "name": "Reading & Literacy",
        "id": 286,
      },
      {
        "name": "Justice Involvement",
        "id": 342,
      },
      {
        "name": "Academic Support",
        "id": 345,
      },
      {
        "name": "Alternative Education & GED",
        "id": 346,
      },
      {
        "name": "Free City College",
        "id": 347,
      },
      {
        "name": "Public Schools",
        "id": 348,
      }
    ]
  },
  {
    algoliaCategoryName: "Family Support",
    id: "359",
    name: "Family Support",
    slug: "family-support",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "Support Groups",
        "id": 123,
      },
      {
        "name": "Family Shelters",
        "id": 174,
      },
      {
        "name": "Legal Services",
        "id": 188,
      },
      {
        "name": "Food",
        "id": 2,
      },
      {
        "name": "LGBTQ+ Support",
        "id": 201,
      },
      {
        "name": "Emergency Financial Assistance",
        "id": 1100007,
      },
      {
        "name": "Computer or Internet Access",
        "id": 225,
      },
      {
        "name": "Disability Support",
        "id": 244,
      },
      {
        "name": "Parent Education",
        "id": 295,
      },
      {
        "name": "Family Resource Centers",
        "id": 297,
      },
      {
        "name": "Justice Involvement",
        "id": 342,
      },
      {
        "name": "Child Welfare Services",
        "id": 349,
      },
      {
        "name": "Foster Care Services",
        "id": 198,
      },
      {
        "name": "Housing & Rental Assistance",
        "id": 1,
      },
      {
        "name": "Immigration Assistance",
        "id": 350,
      },
      {
        "name": "Teen Parents",
        "id": 351,
      }
    ]
  },
  {
    algoliaCategoryName: "Health & Wellness",
    id: "360",
    name: "Health & Wellness",
    slug: "health-wellness",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "Medical Care",
        "id": 58,
      },
      {
        "name": "Mental Health Care",
        "id": 78,
      },
      {
        "name": "Vision Care",
        "id": 88,
      },
      {
        "name": "Addiction & Recovery",
        "id": 41,
      },
      {
        "name": "Dental Care",
        "id": 42,
      },
      {
        "name": "Health Education",
        "id": 43,
      },
      {
        "name": "LGBTQ+ Support",
        "id": 201,
      },
      {
        "name": "Disability Support",
        "id": 244,
      },
      {
        "name": "Justice Involvement",
        "id": 342,
      },
      {
        "name": "Crisis Intervention",
        "id": 352,
      }
    ]
  },
  {
    algoliaCategoryName: "Sports & Recreation",
    id: "361",
    name: "Sports & Recreation",
    slug: "sports-recreation",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "LGBTQ+ Support",
        "id": 201,
      },
      {
        "name": "Disability Support",
        "id": 244,
      },
      {
        "name": "Summer Programs",
        "id": 284,
      },
      {
        "name": "Outdoors",
        "id": 319,
      },
      {
        "name": "Gardening",
        "id": 274,
      },
      {
        "name": "Justice Involvement",
        "id": 342,
      },
      {
        "name": "Physical Fitness",
        "id": 353,
      },
      {
        "name": "Team Sports",
        "id": 354,
      }
    ]
  },
  {
    algoliaCategoryName: "Youth Workforce & Life Skills",
    id: "362",
    name: "Youth Workforce & Life Skills",
    slug: "youth-workforce-life-skills",
    steps: ["subcategories", "results"],
    subcategorySubheading: defaultSubheading,
    subcats: [
      {
        "name": "Mentorship",
        "id": 119,
      },
      {
        "name": "Skills & Training",
        "id": 142,
      },
      {
        "name": "Vocational Training",
        "id": 214,
      },
      {
        "name": "LGBTQ+ Support",
        "id": 201,
      },
      {
        "name": "Job Assistance",
        "id": 1100010,
      },
      {
        "name": "Disability Support",
        "id": 244,
      },
      {
        "name": "Summer Programs",
        "id": 284,
      },
      {
        "name": "Youth Leadership",
        "id": 288,
      },
      {
        "name": "Career Exploration",
        "id": 330,
      },
      {
        "name": "Justice Involvement",
        "id": 342,
      },
      {
        "name": "Apprenticeship",
        "id": 355,
      },
      {
        "name": "Youth Jobs & Internships",
        "id": 275,
      }
    ]
  },
];
