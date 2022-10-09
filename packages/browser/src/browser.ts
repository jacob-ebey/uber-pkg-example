import { type SignFunction, type UnsignFunction } from "@example/platform";
export { type SignFunction, type UnsignFunction } from "@example/platform";

export const platform = "browser";

export const sign: SignFunction = async (value, secret) => {
  let key = await createKey(secret, ["sign"]);
  let encoder = new TextEncoder();
  let data = encoder.encode(value);
  let signature = await crypto.subtle.sign("HMAC", key, data);
  let hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(
    /=+$/,
    ""
  );

  return value + "." + hash;
};

export const unsign: UnsignFunction = async (signed, secret) => {
  let index = signed.lastIndexOf(".");
  let value = signed.slice(0, index);
  let hash = signed.slice(index + 1);

  let key = await createKey(secret, ["verify"]);
  let encoder = new TextEncoder();
  let data = encoder.encode(value);
  let signature = byteStringToUint8Array(atob(hash));
  let valid = await crypto.subtle.verify("HMAC", key, signature, data);

  return valid ? value : false;
};

async function createKey(
  secret: string,
  usages: CryptoKey["usages"]
): Promise<CryptoKey> {
  let encoder = new TextEncoder();
  let key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );

  return key;
}

function byteStringToUint8Array(byteString: string): Uint8Array {
  let array = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }

  return array;
}
