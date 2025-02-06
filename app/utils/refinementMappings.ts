// On search results page, not category listings page

// Hardcoded categories in search page sidebar (Can add multiple categories as array)
/* i.e. "Arts, Culture & Identity": [
  "Arts and Creative Expression",
  "Culinary Arts",
  "Culture & Identity",
  "Dance",
  "Digital Media Production",
  "Disability Support",
  "Justice Involvement",
  "LGBTQ+ Support",
  "Summer Programs"
]
*/

// TODO: Check why these are still being used
export const categoriesMapping = {
  "Basic Needs & Shelter": ["Basic Needs & Shelter"],
  Employment: ["Employment"],
  "Eviction Prevention": ["Eviction Prevention"],
  "Health & Medical": ["Health & Medical"],
  Housing: ["Housing"],
  Legal: ["Legal"],
};

// From DCYF spreadsheet (contains duplicates):
export const our415SubcategoriesWithDuplicates = [
  "Arts & Creative Expression",
  "Culinary Arts",
  "Culture & Identity",
  "Dance",
  "Digital Media Production",
  "Disability Support",
  "Justice Involvement",
  "LGBTQ+ Support",
  "Summer Programs",
  "After & Before School",
  "Childcare",
  "Playgroups",
  "Summer Programs",
  "Academic Support",
  "Alternative Education & GED",
  "College Prep",
  "Computer Class",
  "Disability Support",
  "Financial Education",
  "Foreign Languages",
  "Free City College",
  "Justice Involvement",
  "Learning English",
  "LGBTQ+ Support",
  "Public Schools",
  "Reading & Literacy",
  "SEL (Social Emotional Learning)",
  "Special Education",
  "STEM",
  "Summer Programs",
  "Child Welfare Services",
  "Computer or Internet Access",
  "Disability Support",
  "Legal Services",
  "Family Resource Centers",
  "Family Shelters",
  "Financial Assistance",
  "Food",
  "Adoption & Foster Care",
  "Housing & Rental Assistance",
  "Immigration Assistance",
  "Justice Involvement",
  "LGBTQ+ Support",
  "Parent Education",
  "Support Groups",
  "Teen Parents",
  "Addiction & Recovery",
  "Crisis Intervention",
  "Dental Care",
  "Disability Support",
  "Health Education",
  "Justice Involvement",
  "LGBTQ+ Support",
  "Medical Care",
  "Mental Health",
  "Vision Care",
  "Disability Support",
  "Gardening",
  "Justice Involvement",
  "LGBTQ+ Support",
  "Outdoors",
  "Summer Programs",
  "Physical Fitness",
  "Team Sports",
  "Apprenticeship",
  "Career Exploration",
  "Disability Support",
  "Job Assistance",
  "Justice Involvement",
  "LGBTQ+ Support",
  "Mentorship",
  "Skills & Training",
  "Summer Programs",
  "Vocational Training",
  "Youth Jobs & Internships",
  "Youth Leadership",
];

export const our415SubcategoryNames = new Set(
  our415SubcategoriesWithDuplicates
);

// const eligibilitiesToDisplay = [
//   "African American",
//   "Asian",
//   "Latinx",
//   "Pacific Islander",
//   "Middle Eastern and North African",
//   "Native American",
//   "Filipino/a",
//   "Preschool",
//   "Elementary School",
//   "Middle School Students",
//   "High School Students",
//   "College Students",
//   "City College of SF",
//   "Low-Income",
//   "Underinsured",
//   "Uninsured",
//   "Benefit Recipients",
//   "Foster Youth",
//   "I am Experiencing Homelessness",
//   "Undocumented",
//   "CIP (Children of Incarcerated Parents)",
//   "Trauma Survivors",
//   "Teen Parents",
//   "Non-Binary",
//   "Transgender and Gender Non-Conforming",
//   "Boys",
//   "Men",
//   "Girls",
//   "Women",
//   "LGBTQ+",
//   "Youth",
//   "Teens",
//   "Toddler",
//   "Families with children below 18 years old",
//   "Pre-Teen",
//   "Infants",
//   "All Ages",
//   "TAY",
//   "Children",
//   "Special Needs/Disabilities",
//   "Mental and Behavioral Health Challenges",
//   "Deaf or Hard of Hearing",
//   "Visual Impairment",
//   "Limited Mobility",
//   "Spanish",
//   "Chinese",
//   "Filipino",
//   "ESL/ELL (English Language Learner)",
// ];

// const allEligibilities = [
//   "API (Asian/Pacific Islander", // Has results if Pacific Islander does not
//   "African American",
//   "All Ages",
//   "Asian",
//   "Benefit Recipients", // No results
//   "Boys",
//   "CIP (Children of Incarcerated Parents)",
//   "Children", // From DCYF, no results
//   "Children (0-13 years old)", // Has results if Children does not
//   "Chinese",
//   "City College of SF", // From DCYF, no results
//   "College Students", // Has results, while College does not
//   "College", // From DCYF, no results
//   "Deaf or Hard of Hearing", // From DCYF, no results
//   "Elementary School", // From DCYF, no results
//   "Elementary School Student", // Has results if Elementary School does not
//   "ESL/ELL (English Language Learner)",
//   "Families with children below 18 years old",
//   "Filipino", // From DCYF, no results
//   "Filipino/a",
//   "Foster Youth",
//   "Girls",
//   "High School Students", // From DCYF, no results
//   "High School", // Has results if High School Students does not
//   "I am Experiencing Homelessness", // From DCYF, no results
//   "Experiencing Homelessness", // Has results if I am Experiencing Homelessness does not
//   "Infants", // From DCYF, no results
//   "Infants (0-2 years old)", // Has results if Infants does not
//   "Latinx", // From DCYF, no results
//   "Hispanic/Latinx", // Has results if Latinx does not
//   "LGBTQ+",
//   "Limited Mobility", // From DCYF, no results
//   "Low-Income",
//   "Mental and Behavioral Health Challenges", // From DCYF, no results
//   "Men",
//   "Middle Eastern and North African",
//   "Middle School Students", // From DCYF, no results
//   "Middle School", // Has results if Middle School Students does not
//   "Native American",
//   "Non-Binary",
//   "Pacific Islander",
//   "Preschool", // From DCYF, no results
//   "Preschool Student", // Has results if Preschool does not
//   "Pre-Teen", // From DCYF, no results
//   "Preteen", // Has results if Pre-Teen does not
//   "Spanish", // From DCYF, no results
//   "Special Needs/Disabilities",
//   "TAY", // From DCYF, no results
//   "Transitional Aged Youth (TAY)", // Has results if TAY does not
//   "Teen Parent", // Has results if Teen Parents does not
//   "Teen Parents", // From DCYF, no results
//   "Teens", // From DCYF, no results
//   "Teens (13-18 years old)", // Has results if Teens does not
//   "Toddler", // From DCYF, no results
//   "Toddler Age", // Has results if Toddler does not
//   "Transgender and Gender Non-Conforming",
//   "Trauma Survivors",
//   "Underinsured",
//   "Undocumented",
//   "Uninsured",
//   "Visual Impairment",
//   "Women",
//   "Youth", // From DCYF, no results
//   "Youth (below 21 years old)", // Has results if Youth does not
// ];

export const our415EligibilitiesMapping = {
  "African American": ["African American"],
  Asian: ["Asian"],
  Latinx: ["Hispanic/Latinx", "Latinx"],
  "Pacific Islander": ["API (Asian/Pacific Islander", "Pacific Islander"],
  "Middle Eastern and North African": ["Middle Eastern and North African"],
  "Native American": ["Native American"],
  "Filipino/a": ["Filipino", "Filipino/a"],
  Preschool: ["Preschool Student", "Preschool"],
  "Elementary School": ["Elementary School Student", "Elementary School"],
  "Middle School Students": ["Middle School", "Middle School Students"],
  "High School Students": ["High School", "High School Students"],
  "College Students": ["College", "College Students"],
  "City College of SF": ["City College of SF"],
  "Low-Income": ["Low-Income"],
  Underinsured: ["Underinsured"],
  Uninsured: ["Uninsured"],
  "Benefit Recipients": ["Benefit Recipients"],
  "Foster Youth": ["Foster Youth"],
  "I am Experiencing Homelessness": [
    "Experiencing Homelessness",
    "I am Experiencing Homelessness",
  ],
  Undocumented: ["Undocumented"],
  "CIP (Children of Incarcerated Parents)": [
    "CIP (Children of Incarcerated Parents)",
  ],
  "Trauma Survivors": ["Trauma Survivors"],
  "Teen Parents": ["Teen Parent", "Teen Parents"],
  "Non-Binary": ["Non-Binary"],
  "Transgender and Gender Non-Conforming": [
    "Transgender and Gender Non-Conforming",
  ],
  Boys: ["Boys"],
  Men: ["Men"],
  Girls: ["Girls"],
  Women: ["Women"],
  "LGBTQ+": ["LGBTQ+"],
  Youth: ["Youth (below 21 years old)", "Youth"],
  Teens: ["Teens (13-18 years old)", "Teens"],
  Toddler: ["Toddler Age", "Toddler"],
  "Families with children below 18 years old": [
    "Families with children below 18 years old",
  ],
  "Pre-Teen": ["Preteen", "Pre-Teen"],
  Infants: ["Infants (0-2 years old)", "Infants"],
  "All Ages": ["All Ages"],
  TAY: ["Transitional Aged Youth (TAY)", "TAY"],
  Children: ["Children (0-13 years old)", "Children"],
  "Special Needs/Disabilities": ["Special Needs/Disabilities"],
  "Mental and Behavioral Health Challenges": [
    "Mental and Behavioral Health Challenges",
  ],
  "Deaf or Hard of Hearing": ["Deaf or Hard of Hearing"],
  "Visual Impairment": ["Visual Impairment"],
  "Limited Mobility": ["Limited Mobility"],
  Spanish: ["Spanish"],
  Chinese: ["Chinese"],
  "ESL/ELL (English Language Learner)": ["ESL/ELL (English Language Learner)"],
};
