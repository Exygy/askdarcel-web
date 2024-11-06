import { faker } from "@faker-js/faker";

export function createRandomCategories(size: number) {
  const result: { [key: string]: number } = {};

  for (let i = 0; i < size; i++) {
    result[`${faker.company.name()}_${size}`] = faker.number.int(100);
  }

  return result;
}
