import {
  unstable_createStaticHandler as createStaticHandler,
  type AgnosticRouteObject,
  type StaticHandlerContext,
} from "@remix-run/router";

type Console = typeof console;

export interface RequestHandlerOptions {
  handleDocumentRequest: (
    request: Request,
    context: StaticHandlerContext
  ) => Promise<Response> | Response;
  onError?: (reason: unknown) => Response | Promise<Response>;
  console?: Console;
}

export function createRequestHandler<Route extends AgnosticRouteObject>(
  routes: Route[],
  options: RequestHandlerOptions
) {
  let handleDocumentRequest = options.handleDocumentRequest;
  let onError =
    options.onError || createDefaultErrorHandler(options.console || console);

  let staticHandler = createStaticHandler(
    // TODO: convert routes to remix routes
    routes
  );

  return async function handleRequest(request: Request) {
    try {
      let context = await staticHandler.query(request);

      if (context instanceof Response) {
        return context;
      }

      return await handleDocumentRequest(request, context);
    } catch (reason) {
      return onError(reason);
    }
  };
}

export function createDefaultErrorHandler(console: Console) {
  return function defaultErrorHandler(reason: unknown) {
    let message: unknown = "";
    if (reason instanceof Error) {
      message = reason.message;
      if (reason.stack) {
        message += "\n" + reason.stack;
      }
    } else if (typeof reason === "object" && reason && "message" in reason) {
      message = String((reason as { message: unknown }).message);
    }
    message = message || reason;
    console.error(message);

    return new Response(
      `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Error</title>
  </head>
  <body>
    <h1>Error</h1>
    <pre>${message}</pre>
    <script>console.error(${JSON.stringify(message)});</script>
  </body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  };
}
