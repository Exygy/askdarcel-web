import { removeAsterisksAndHashes } from "./strings";

describe("removeAsterisksAndHashes", () => {
  it("removes # and *", () => {
    const str = `# **Service Contact Information:**\n# **Another Heading:**`;
    const actual = removeAsterisksAndHashes(str);
    const expected = ` Service Contact Information:\n Another Heading:`;

    expect(actual).toBe(expected);
  });
});
