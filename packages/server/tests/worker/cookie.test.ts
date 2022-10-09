import invariant from "tiny-invariant";

import { createCookie } from "../../src/server";

export async function canSerializeCookieWithoutSecret() {
  let cookie = createCookie("test");
  let setCookie = await cookie.serialize({ foo: "bar" });
  let cookieValue = setCookie.split(";")[0];
  let parsed = await cookie.parse(cookieValue);
  invariant(parsed.foo == "bar", "parsed cookie should match");
}

export async function canSerializeCookieWithSecret() {
  let cookie = createCookie("test", { secrets: ["secret"] });
  let setCookie = await cookie.serialize({ foo: "bar" });
  let cookieValue = setCookie.split(";")[0];
  let parsed = await cookie.parse(cookieValue);
  invariant(parsed.foo == "bar", "parsed cookie should match");
}
