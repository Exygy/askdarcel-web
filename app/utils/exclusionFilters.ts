// /**
//  * Creates Algolia filter strings to exclude resources based on Our415 business rules.
//  * Resources are filtered out if they contain ONLY certain restricted eligibility categories.
//  *
//  * Note: Algolia does NOT support "NOT (expression)" syntax. We use De Morgan's law:
//  * NOT (A AND B) becomes (NOT A OR NOT B)
//  */

// export const createExclusionFilters = (): string => {
//   const filters = [];

//   // Rule 1: ONLY elderly, maturing adult, senior, and/or "I am a senior" in age category
//   // Using De Morgan's law: NOT (A AND B) = (NOT A OR NOT B)
//   const ageOnlyFilters = [
//     '(NOT eligibilities:"elderly" OR NOT eligibilities_count:1)',
//     '(NOT eligibilities:"maturing adult" OR NOT eligibilities_count:1)',
//     '(NOT eligibilities:"senior" OR NOT eligibilities_count:1)',
//     '(NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:1)',
//     // Combinations of these age categories only
//     '(NOT eligibilities:"elderly" OR NOT eligibilities:"senior" OR NOT eligibilities_count:2)',
//     '(NOT eligibilities:"elderly" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:2)',
//     '(NOT eligibilities:"senior" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:2)',
//     '(NOT eligibilities:"maturing adult" OR NOT eligibilities:"senior" OR NOT eligibilities_count:2)',
//     '(NOT eligibilities:"maturing adult" OR NOT eligibilities:"elderly" OR NOT eligibilities_count:2)',
//     '(NOT eligibilities:"maturing adult" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:2)',
//     // Three combinations
//     '(NOT eligibilities:"elderly" OR NOT eligibilities:"senior" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:3)',
//     '(NOT eligibilities:"elderly" OR NOT eligibilities:"maturing adult" OR NOT eligibilities:"senior" OR NOT eligibilities_count:3)',
//     '(NOT eligibilities:"elderly" OR NOT eligibilities:"maturing adult" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:3)',
//     '(NOT eligibilities:"maturing adult" OR NOT eligibilities:"senior" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:3)',
//     // All four
//     '(NOT eligibilities:"elderly" OR NOT eligibilities:"maturing adult" OR NOT eligibilities:"senior" OR NOT eligibilities:"I am a Senior" OR NOT eligibilities_count:4)',
//   ];

//   // Rule 2: ONLY retired in employment status category
//   filters.push('(NOT eligibilities:"retired" OR NOT eligibilities_count:1)');

//   // Rule 3: ONLY married with no children in family status category
//   filters.push(
//     '(NOT eligibilities:"married with no children" OR NOT eligibilities_count:1)'
//   );

//   // Rule 4: ONLY men in gender category AND no TAY (18-24) in age category
//   // Exclude resources that have men as the only eligibility (meaning no TAY eligibility)
//   filters.push('(NOT eligibilities:"men" OR NOT eligibilities_count:1)');

//   // Rule 5: ONLY Alzheimers and/or people who use drugs in health concerns category
//   const healthOnlyFilters = [
//     '(NOT eligibilities:"Alzheimers" OR NOT eligibilities_count:1)',
//     '(NOT eligibilities:"people who use drugs" OR NOT eligibilities_count:1)',
//     '(NOT eligibilities:"Alzheimers" OR NOT eligibilities:"people who use drugs" OR NOT eligibilities_count:2)',
//   ];

//   return [...filters, ...ageOnlyFilters, ...healthOnlyFilters].join(" AND ");
// };

/**
 * Creates Algolia filter strings to exclude resources based on Our415 business rules.
 * Resources are filtered out if they contain certain restricted eligibility categories,
 * regardless of what other eligibilities they may have.
 *
 * Note: Algolia does NOT support "NOT (expression)" syntax.
 */

export const createExclusionFilters = (): string => {
  const filters = [];

  // Rule 1: Exclude records with elderly, maturing adult, senior, or "I am a Senior" eligibilities
  // These should be excluded regardless of other eligibilities they may have
  filters.push('NOT eligibilities:"elderly"');
  filters.push('NOT eligibilities:"maturing adult"');
  filters.push('NOT eligibilities:"senior"');
  filters.push('NOT eligibilities:"I am a Senior"');

  // Rule 2: Exclude records with "retired" eligibility
  filters.push('NOT eligibilities:"retired"');

  // Rule 3: Exclude records with "married with no children" eligibility
  filters.push('NOT eligibilities:"married with no children"');

  // Rule 4: Exclude records with "men" eligibility
  filters.push('NOT eligibilities:"men"');

  // Rule 5: Exclude records with Alzheimers or "people who use drugs" eligibilities
  filters.push('NOT eligibilities:"Alzheimers"');
  filters.push('NOT eligibilities:"people who use drugs"');

  return filters.join(" AND ");
};
