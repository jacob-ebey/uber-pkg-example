import invariant from "tiny-invariant";
import { platform, sign, unsign } from "./browser";

export function testPlatform() {
  invariant(platform == "browser", "platform.name should be browser");
}

export async function signUnsign() {
  let secret = "secret";
  let value = "value";
  let signed = await sign(value, secret);
  let unsigned = await unsign(signed, secret);
  invariant(unsigned == value, "signed value should be unsigned");
}
