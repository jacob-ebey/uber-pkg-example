// must be type alias due to inference issues on interfaces
// https://github.com/microsoft/TypeScript/issues/15300
export type SerializedError = {
  message: string;
  stack?: string;
};

export async function serializeError(
  error: unknown,
  mode: string
): Promise<SerializedError> {
  let message: string;
  let stack: string | undefined;
  switch (mode) {
    case "development":
      if (error instanceof Error || (error && "message" in error)) {
        let e = error as Error;
        message = String(e.message);
        stack = e.stack ? String(e.stack) : undefined;
        break;
      }

      message = String(error);
      break;
    default:
      message = "An error occurred";
      break;
  }
  return {
    message,
    stack,
  };
}
