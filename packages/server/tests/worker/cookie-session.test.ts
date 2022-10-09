import invariant from "tiny-invariant";

import { createCookieSessionStorage } from "../../src/server";

export async function canSerializeAndParseWithoutSecret() {
  let sessionStorage = createCookieSessionStorage({});
  let session = await sessionStorage.getSession();
  session.set("foo", "bar");
  let setCookie = await sessionStorage.commitSession(session);
  let cookieValue = setCookie.split(";")[0];
  let parsed = await sessionStorage.getSession(cookieValue);
  invariant(parsed.get("foo") == "bar", "parsed cookie should match");
}

export async function canSerializeAndParseWithSecret() {
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
}
