import invariant from "tiny-invariant";
import { platform, sign, unsign } from "./worker";

export function testPlatform() {
  invariant(platform.name == "worker", "platform.name should be worker");
}

export async function signUnsign() {
  let secret = "secret";
  let value = "value";
  let signed = await sign(value, secret);
  let unsigned = await unsign(signed, secret);
  invariant(unsigned == value, "signed value should be unsigned");
}
