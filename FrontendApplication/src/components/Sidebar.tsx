import { NavLink } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/play/online", label: "Play",      icon: "♟" },
  { to: "/dashboard",   label: "Dashboard", icon: "⊞" },
  { to: "/play/bot",    label: "Practice",  icon: "𞢳" },
  { to: "/puzzle",      label: "Puzzles",   icon: "♞" },
  { to: "/analysis",    label: "Analysis",  icon: "♜" },
  { to: "/profile",     label: "Profile",   icon: "♔" },
];

type SidebarProps = {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
};

const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const setCollapsed = onCollapse;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo + toggle */}
      <div className={`flex items-center border-b border-slate-800/60 transition-all duration-300 ${
        collapsed ? "justify-center px-0 py-5" : "justify-between px-4 py-5"
      }`}>
        {!collapsed && (
          <NavLink
            to="/"
            replace
            className="flex items-center gap-2 text-lg font-serif font-black text-white hover:text-blue-400 transition-colors"
          >
            <span className="text-2xl drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">♟</span>
            <span className="tracking-wide">Chess</span>
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all ${
            collapsed ? "w-9 h-9 text-xl" : "w-7 h-7 text-sm"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-slate-600 font-mono px-3 mb-2">
            Menu
          </p>
        )}

        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl transition-all duration-150 group border
                  ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                  ${isActive
                    ? "bg-blue-600/15 text-blue-400 border-blue-700/30 shadow-[inset_0_1px_0_rgba(96,165,250,0.1)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-base shrink-0 transition-transform duration-150 ${
                      !isActive ? "group-hover:scale-110" : ""
                    } ${collapsed ? "w-5 text-center" : "w-5 text-center"}`}>
                      {icon}
                    </span>

                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium tracking-wide truncate">{label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: user + logout */}
      <div className="px-2 py-4 border-t border-slate-800/60 space-y-1">

        {/* Logout */}
        <NavLink
          to="/logout"
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm font-medium ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <span className="text-base w-5 text-center shrink-0">⏻</span>
          {!collapsed && "Logout"}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;