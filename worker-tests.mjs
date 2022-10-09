import * as http from "http";

import * as esbuild from "esbuild";
import glob from "fast-glob";
import puppeteer from "puppeteer";

let testsGlob = process.argv[2] || "src/**/*.test.ts";

let testFiles = await glob(testsGlob, {
  cwd: process.cwd(),
  onlyFiles: true,
  extglob: true,
  globstar: true,
});

testFiles = testFiles.map((f) => f.replace(/\\/g, "/"));
console.log(testFiles);

let testsToRun = testFiles
  .map((file, index) => `import * as test${index} from "./${file}";`)
  .join("\n");

let contents = `
${testsToRun};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  let url = new URL(event.request.url);
  if (url.pathname === "/run-tests") {
    event.respondWith(runTests().then((result) => {
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }));
    return;
  }
});

async function runTests() {
  let tests = [${testFiles
    .map((f, index) => `{ file: ${JSON.stringify(f)}, mod: test${index} }`)
    .join(", ")}];
  
  let results = {};
  let failures = {};
  for (const test of tests) {
    results[test.file] = {};
    for (const key in test.mod) {
      try {
        await test.mod[key]();
        results[test.file][key] = "PASS";
      } catch (e) {
        results[test.file][key] = "FAIL";
        failures[test.file] = failures[test.file] || {};
        failures[test.file][key] = reasonToJson(e);
      }
    }
  }

  return { results, failures };
}

function reasonToJson(reason) {
  if (!reason) {
    return {
      message: "Unknown error",
    };
  }

  if (reason instanceof Error) {
    return {
      message: reason.message,
      stack: reason.stack,
    };
  }

  if ("message" in reason && typeof reason.message == "string") {
    return {
      message: reason.message,
    };
  }

  return {
    message: String(reason),
  };
}
`;

let testBundle = await esbuild.build({
  stdin: {
    resolveDir: process.cwd(),
    contents,
  },
  bundle: true,
  platform: "browser",
  format: "esm",
  conditions: ["worker"],
  write: false,
});

let baseURL;
let server = http
  .createServer((req, res) => {
    let url = new URL(req.url, baseURL);
    if (url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <script type="module">
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          type: "module",
        }).then(() => navigator.serviceWorker.getRegistrations().then((registrations) => {
          return Promise.all(
            registrations.map(
              (reg) =>
                new Promise((resolve) => {
                  if (reg.active) {
                    resolve(reg);
                  } else {
                    reg.onupdatefound = () => {
                      // simulate passage of time inside browser,
                      // so that service worker can install on the next tick.
                      setTimeout(resolve, 10);
                    };
                  }
                })
            )
          );
        })).then(() => fetch("/run-tests").then(async (res) => {
          if (!res.ok || res.headers.get("Content-Type") != "application/json") {
            let p = document.createElement("p");
            p.innerHTML = "Failed to run tests";
            document.body.appendChild(p);
            return;
          }

          let result = await res.json();
          let pre = document.createElement("pre");
          pre.id = "results";
          pre.innerHTML = JSON.stringify(result, null, 2);
          document.body.appendChild(pre);
        }))
    </script>
  </body>
</html>
`);
      return;
    }

    if (url.pathname === "/sw.js") {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.end(testBundle.outputFiles[0].contents);
      return;
    }

    res.writeHead(404);
    res.end();
  })
  .listen(process.env.PORT || undefined);

let port = server.address().port;
baseURL = `http://localhost:${port}/`;

console.log("initializing...");
let browser = await puppeteer.launch();
let page = await browser.newPage();
await page.goto(baseURL);
await page.waitForNetworkIdle();
await page.evaluate(() =>
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    return Promise.all(
      registrations.map(
        (reg) =>
          new Promise((resolve) => {
            if (reg.active) {
              resolve(reg);
            } else {
              reg.onupdatefound = () => {
                // simulate passage of time inside browser,
                // so that service worker can install on the next tick.
                setTimeout(resolve, 10);
              };
            }
          })
      )
    );
  })
);

console.log("running tests...");

try {
  await page.reload();
  let resultElement = await page.waitForSelector("#results");
  let resultText = await resultElement.evaluate((el) => el.textContent);

  if (!resultText.startsWith("{")) {
    throw new Error(resultText || "Unknown error");
  }

  let result = JSON.parse(resultText);

  console.log();
  let failed = false;
  for (let file in result.results) {
    console.log(file);
    for (let test in result.results[file]) {
      console.log("  ", test, ...logStatus(result.results[file][test]));
      if (result.results[file][test] === "FAIL") {
        failed = true;
        console.log("    ", result.failures[file][test]);
      }
    }
  }
  console.log();

  process.exit(failed ? 1 : 0);
} catch (reason) {
  console.error(reason);
  process.exit(1);
}

function logStatus(status) {
  if (status === "PASS") {
    return ["\x1b[32mPASS\x1b[0m"];
  } else if (status === "FAIL") {
    return ["\x1b[31mFAIL\x1b[0m"];
  }

  return [status];
}
