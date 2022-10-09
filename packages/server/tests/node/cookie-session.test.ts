import { describe, it } from "node:test";
import invariant from "tiny-invariant";

import { createCookieSessionStorage } from "../../src/server";

describe("createCookieSessionStorage", () => {
  it("can serialize and parse without secret", async () => {
    let sessionStorage = createCookieSessionStorage({});
    let session = await sessionStorage.getSession();
    session.set("foo", "bar");
    let setCookie = await sessionStorage.commitSession(session);
    let cookieValue = setCookie.split(";")[0];
    let parsed = await sessionStorage.getSession(cookieValue);
    invariant(parsed.get("foo") == "bar", "parsed cookie should match");
  });

  it("can serialize and parse with secret", async () => {
    let sessionStorage = createCookieSessionStorage({
      cookie: {
        secrets: ["secret"],
      },
    });
    let session = await sessionStorage.getSession();
    session.set("foo", "bar");
    let setCookie = await sessionStorage.commitSession(session);
    let cookieValue = setCookie.split(";")[0];
    let parsed = await sessionStorage.getSession(cookieValue);
    invariant(parsed.get("foo") == "bar", "parsed cookie should match");
  });
});
