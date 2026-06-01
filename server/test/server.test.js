const { describe, it } = require("node:test");
const assert = require("node:assert");

describe("Server", () => {
  it("should pass basic sanity check", () => {
    assert.strictEqual(1 + 1, 2);
  });
});
