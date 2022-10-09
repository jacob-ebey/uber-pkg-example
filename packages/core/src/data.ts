/**
 * An object of unknown type for route loaders and actions provided by the
 * server's `getLoadContext()` function.
 */
export interface AppLoadContext {
  [key: string]: unknown;
}

/**
 * Data for a route that was returned from a `loader()`.
 */
export type AppData = any;

export interface RouteData {
  [routeId: string]: AppData;
}
