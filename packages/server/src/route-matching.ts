import {
  matchRoutes,
  type AgnosticRouteObject,
  type Params,
} from "@remix-run/router";

import { type ServerRoute } from "@example/core";

export interface RouteMatch<Route> {
  params: Params;
  pathname: string;
  route: Route;
}

export function matchServerRoutes(
  routes: ServerRoute[],
  pathname: string
): RouteMatch<ServerRoute>[] | null {
  let matches = matchRoutes(routes as AgnosticRouteObject[], pathname);
  if (!matches) return null;

  return matches.map((match) => ({
    params: match.params,
    pathname: match.pathname,
    route: match.route as ServerRoute,
  }));
}
