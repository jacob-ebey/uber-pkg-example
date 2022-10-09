import {
  type EntryRoute,
  type EntryRouteModule,
  type RouteManifest,
  type RouteModules,
  type ServerRoute,
  type ServerRouteManifest,
} from "@example/core";

import { type RouteMatch } from "./route-matching";

export function createEntryMatches(
  matches: RouteMatch<ServerRoute>[],
  routes: RouteManifest<EntryRoute>
): RouteMatch<EntryRoute>[] {
  return matches.map((match) => ({
    params: match.params,
    pathname: match.pathname,
    route: routes[match.route.id],
  }));
}

export function createEntryRouteModules(
  manifest: ServerRouteManifest
): RouteModules<EntryRouteModule> {
  return Object.keys(manifest).reduce((memo, routeId) => {
    memo[routeId] = manifest[routeId].module;
    return memo;
  }, {} as RouteModules<EntryRouteModule>);
}
