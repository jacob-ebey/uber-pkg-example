import {
  type PlatformInfo,
  type SignFunction,
  type UnsignFunction,
} from "@example/platform";
export { type SignFunction, type UnsignFunction } from "@example/platform";

import cookieSignature from "cookie-signature";

export const platform: PlatformInfo = {
  name: "node",
  version: process.version,
};

export const sign: SignFunction = (value, secret) => {
  return Promise.resolve(cookieSignature.sign(value, secret));
};

export const unsign: UnsignFunction = (signed, secret) => {
  return Promise.resolve(cookieSignature.unsign(signed, secret));
};
