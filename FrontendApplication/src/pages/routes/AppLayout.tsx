import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar.tsx";
import {Breadcrumbs} from "../../components/Breadcrumbs.tsx";
import {AppRoute} from "../../app/interfaces/Types.ts";

const AppLayout = ({ routes }: { routes: AppRoute[] }) => {
  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-black text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 ml-48">
        <Breadcrumbs routes={routes} />
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
