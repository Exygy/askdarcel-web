import { expect } from "chai";
import { removeAsterisksAndHashes } from '../../../utils/strings';

describe("removeAsterisksAndHashes", () => {
  it("removes #", () => {
    const str = `
      # **Service Contact Information:**\n
      # **Another Heading:**\n
    `;
    expect(removeAsterisksAndHashes(str)).to.equal("Test Service");
  });
});
