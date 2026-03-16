import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar.tsx";
import {Breadcrumbs} from "../../components/Breadcrumbs.tsx";
import {AppRoute} from "../../app/interfaces/Types.ts";
import {useState} from "react";

const AppLayout = ({ routes }: { routes: AppRoute[] }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen text-slate-200 relative" style={{ background: "linear-gradient(to bottom, #0f172a, #0f172a, #000)" }}>

      {/* Chessboard pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "repeating-conic-gradient(#1e40af 0% 25%, transparent 0% 50%)",
          backgroundSize: "64px 64px",
          opacity: 0.1,
        }}
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #000 90%)"
        }}
      />

      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <main
        className={`relative z-10 flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-56"
        }`}
      >
        <Breadcrumbs routes={routes} />
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
