import { describe, it } from "node:test";
import invariant from "tiny-invariant";

import { platform, sign, unsign } from "./node";

describe("platform", () => {
  it("should be node", () => {
    invariant(platform.name == "node", "platform.name should be node");
  });
});

describe("sign", () => {
  it("should sign", async () => {
    let secret = "secret";
    let value = "value";
    let signed = await sign(value, secret);
    let unsigned = await unsign(signed, secret);
    invariant(unsigned == value, "signed value should be unsigned");
  });
});
