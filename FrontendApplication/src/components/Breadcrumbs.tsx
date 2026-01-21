import { Link, useLocation, matchPath } from "react-router-dom";
import {AppRoute} from "../app/interfaces/Types.ts";

const flattenRoutes = (routes: AppRoute[], parentPath = ""): AppRoute[] => {
  return routes.flatMap(route => {
    const fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, "/");
    const current: AppRoute = { ...route, path: fullPath };
    if (route.children) {
      return [current, ...flattenRoutes(route.children, fullPath)];
    }
    return [current];
  });
};

interface BreadcrumbsProps {
  routes: AppRoute[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ routes }) => {
  const location = useLocation();
  const allRoutes = flattenRoutes(routes);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((_, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const match = allRoutes.find(r => matchPath({ path: r.path, end: true }, path));
    if (!match?.breadcrumb) return null; // skip 404, auth-only routes without breadcrumb
    return { path, label: match.breadcrumb };
  }).filter(Boolean) as { path: string; label: string }[];

  const finalBreadcrumbs = [{ path: "/", label: "Home" }, ...breadcrumbs];

  return (
    <nav className="text-xs md:text-sm text-slate-400 mb-2 whitespace-nowrap overflow-x-auto flex items-center gap-1">
      {finalBreadcrumbs.map((crumb, index) => {
        const isLast = index === finalBreadcrumbs.length - 1;
        return (
          <span key={crumb.path} className="inline-flex items-center gap-1">
            {index !== 0 && <span className="text-slate-500">/</span>}
            {isLast ? (
              <span className="text-slate-200 font-medium">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-cyan-400 transition">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
