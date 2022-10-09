import { describe, it } from "node:test";
import invariant from "tiny-invariant";

import { createCookie } from "../../src/server";

describe("createCookie", () => {
  it("can serialize and parse without secret", async () => {
    let cookie = createCookie("test");
    let setCookie = await cookie.serialize({ foo: "bar" });
    let cookieValue = setCookie.split(";")[0];
    let parsed = await cookie.parse(cookieValue);
    invariant(parsed.foo == "bar", "parsed cookie should match");
  });

  it("can serialize and parse with secret", async () => {
    let cookie = createCookie("test", { secrets: ["secret"] });
    let setCookie = await cookie.serialize({ foo: "bar" });
    let cookieValue = setCookie.split(";")[0];
    let parsed = await cookie.parse(cookieValue);
    invariant(parsed.foo == "bar", "parsed cookie should match");
  });
});
