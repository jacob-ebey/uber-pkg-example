import { doLog, createCookie, platform } from "uber-pkg";

doLog({ platform });

let cookie = createCookie("test", {
  secrets: ["secret"],
});

let input = "hello world";
doLog({ input });

let serialized = await cookie.serialize(input);
doLog({ serialized });

let parsed = await cookie.parse(serialized);
doLog({ parsed });
