import invariant from "tiny-invariant";

import {
  createDefaultErrorHandler,
  createRequestHandler,
} from "../../src/handler";

export async function createRequestHandlerCallsHandleDocumentRequest() {
  let handler = createRequestHandler(
    [
      {
        id: "root",
        children: [
          {
            id: "routes/index",
            index: true,
          },
        ],
      },
    ],
    {
      handleDocumentRequest() {
        return new Response("hello");
      },
    }
  );

  let response = await handler(new Request("http://.../"));
  invariant((await response.text()) == "hello", "response should match");
}

export async function createDefaultErrorHandlerLogsAnError() {
  let errors: unknown[][] = [];
  let handler = createDefaultErrorHandler({
    error: (...args: unknown[]) => {
      errors.push(args);
    },
  } as typeof console);

  let error = new Error("hello");
  let response = await handler(error);
  invariant(response.status == 500, "response should match");
  invariant(errors.length == 1, "error should be logged");
  invariant(
    (errors[0][0] as string).includes(error.message),
    "error should include message"
  );
  invariant(
    error.stack && (errors[0][0] as string).includes(error.stack),
    "error should include stack"
  );
}

export async function createDefaultErrorHandlerLogsObjectWithMessage() {
  let errors: unknown[][] = [];
  let handler = createDefaultErrorHandler({
    error: (...args: unknown[]) => {
      errors.push(args);
    },
  } as typeof console);

  let error = { message: "hello" };
  let response = await handler(error);
  invariant(response.status == 500, "response should match");
  invariant(errors.length == 1, "error should be logged");
  invariant(
    (errors[0][0] as string).includes(error.message),
    "error should include message"
  );
}

export async function createDefaultErrorHandlerLogsPassesThrough() {
  let errors: unknown[][] = [];
  let handler = createDefaultErrorHandler({
    error: (...args: unknown[]) => {
      errors.push(args);
    },
  } as typeof console);

  let error = "hello";
  let response = await handler(error);
  invariant(response.status == 500, "response should match");
  invariant(errors.length == 1, "error should be logged");
  invariant(
    (errors[0][0] as string).includes(error),
    "error should include message"
  );
}
