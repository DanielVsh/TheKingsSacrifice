import { ReactNode } from "react";

export interface AppRoute {
  path: string;
  element: ReactNode;
  breadcrumb?: string;   // Only routes with breadcrumb show up
  auth?: boolean;
  children?: AppRoute[];
}