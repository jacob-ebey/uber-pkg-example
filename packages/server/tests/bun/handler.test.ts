import { describe, it } from "bun:test";
import invariant from "tiny-invariant";

import {
  createDefaultErrorHandler,
  createRequestHandler,
} from "../../src/handler";

describe("createRequestHandler", () => {
  it("calls handleDocumentRequest", async () => {
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

    let request = new Request("http://.../");
    // TODO: Remove when fixed in bun
    // @ts-expect-error
    request.signal = new AbortController().signal;
    let response = await handler(request);
    invariant((await response.text()) == "hello", "response should match");
  });
});

describe("createDefaultErrorHandler", () => {
  it("logs an error", async () => {
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
  });

  it("logs object with message", async () => {
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
  });

  it("logs passes through", async () => {
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
  });
});