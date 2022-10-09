let labels: string[] = [];
let tests: Record<string, Function> = {};

function reasonToJson(reason: any) {
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

export async function runTests() {
  let results: Record<string, boolean> = {};
  let failures: Record<string, unknown> = {};

  for (let label of labels) {
    try {
      await tests[label]();
      results[label] = true;
    } catch (reason) {
      results[label] = false;
      failures[label] = reasonToJson(reason);
    }
  }

  return { results, failures };
}

export function describe(label: string, test: () => void) {
  labels.push(label);
  test();
  labels.pop();
  return label;
}

export function it(label: string, test: () => Promise<void> | void) {
  let testName = labels.join(" ") + " " + label;
  if (testName in tests) {
    throw new Error(`Test ${testName} already exists`);
  }
  tests[testName] = test;
}
