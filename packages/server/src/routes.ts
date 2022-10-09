import { type AgnosticDataRouteObject } from "@remix-run/router";
import {
  type AppLoadContext,
  type ServerRoute,
  type ServerRouteManifest,
} from "@example/core";

import { callRouteAction, callRouteLoader } from "./data";

export function createRoutes(
  manifest: ServerRouteManifest,
  parentId?: string
): ServerRoute[] {
  return Object.entries(manifest)
    .filter(([, route]) => route.parentId === parentId)
    .map(([id, route]) => ({
      ...route,
      children: createRoutes(manifest, id),
    }));
}

// Convert the Remix ServerManifest into DataRouteObject's for use with
// createStaticHandler
export function createStaticHandlerDataRoutes(
  manifest: ServerRouteManifest,
  loadContext: AppLoadContext,
  parentId?: string
): AgnosticDataRouteObject[] {
  return Object.values(manifest)
    .filter((route) => route.parentId === parentId)
    .map((route) => ({
      caseSensitive: route.caseSensitive,
      children: createStaticHandlerDataRoutes(manifest, loadContext, route.id),
      // Always include root due to default boundaries
      hasErrorBoundary:
        route.id === "root" ||
        route.module.CatchBoundary != null ||
        route.module.ErrorBoundary != null,
      id: route.id,
      index: route.index,
      path: route.path,
      loader: route.module.loader
        ? (args) =>
            callRouteLoader({
              ...args,
              routeId: route.id,
              loader: route.module.loader,
              loadContext,
            })
        : undefined,
      action: route.module.action
        ? (args) =>
            callRouteAction({
              ...args,
              routeId: route.id,
              action: route.module.action,
              loadContext,
            })
        : undefined,
      handle: route.module.handle,
      // TODO: RRR - Implement!
      shouldRevalidate: () => true,
    })) as AgnosticDataRouteObject[];
}
