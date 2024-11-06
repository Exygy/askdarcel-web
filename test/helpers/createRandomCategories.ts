import { faker } from "@faker-js/faker";

/**
 * Generates an object of categories for use in search refinement components
 *
 * @param size Customize the number of categories
 * @returns
 */
export function createRandomCategories(size: number) {
  const result: { [key: string]: number } = {};

  for (let i = 0; i < size; i++) {
    // Append incrementor because the current version of faker does not support
    // uniqueness
    result[`${faker.company.name()}_${i}`] = faker.number.int(100);
  }

  return result;
}
