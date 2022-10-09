import { describe, expect, it } from "bun:test";

import { platform, sign, unsign } from "./bun";

describe("platform", () => {
  it("should be bun", () => {
    expect(platform).toBe("bun");
  });
});

// describe("sign", () => {
//   it("should sign", async () => {
//     let secret = "secret";
//     let value = "value";
//     let signed = await sign(value, secret);
//     let unsigned = await unsign(signed, secret);
//     expect(unsigned).toBe(value);
//   });
// });
