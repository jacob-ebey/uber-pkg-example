import { type ServerRouteModule } from "./route-modules";

export interface RouteManifest<Route> {
  [routeId: string]: Route;
}

interface Route {
  index?: boolean;
  caseSensitive?: boolean;
  id: string;
  parentId?: string;
  path?: string;
}

export interface EntryRoute extends Route {
  hasAction: boolean;
  hasLoader: boolean;
  hasCatchBoundary: boolean;
  hasErrorBoundary: boolean;
  imports?: string[];
  module: string;
}

export interface ServerRoute extends Route {
  children: ServerRoute[];
  module: ServerRouteModule;
}

export type ServerRouteManifest = RouteManifest<Omit<ServerRoute, "children">>;
