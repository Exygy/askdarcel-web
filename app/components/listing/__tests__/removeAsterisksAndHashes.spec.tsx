import { expect } from "chai";
import { removeAsterisksAndHashes } from '../../../utils/strings';

describe("removeAsterisksAndHashes", () => {
  it("removes #", () => {
    const str = `
      # **Service Contact Information:**
      # **Another Heading:**
    `;

    const actual = removeAsterisksAndHashes(str);
    const expected = `
       **Service Contact Information:**
       **Another Heading:**
    `
    expect(actual).to.equal(expected);
  });
});
