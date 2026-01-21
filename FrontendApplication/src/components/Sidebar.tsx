import { NavLink } from "react-router-dom"

const navItem =
  "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200"

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-48  border-r border-slate-800 text-slate-200">

      {/* Logo / Home */}
      <NavLink
        to="/"
        replace
        className="block px-4 py-6 text-xl font-bold text-center tracking-wide hover:text-cyan-400 transition"
      >
        ♟ Chess
      </NavLink>

      {/* Navigation */}
      <nav className="px-3">
        <ul className="space-y-1 text-sm">

          <NavLink
            to="/play/online"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 shadow-inner"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            ♞ Play
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/play/bot"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            🤖 Practice
          </NavLink>

          <NavLink
            to="/puzzle"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            🧩 Puzzles
          </NavLink>

          <NavLink
            to="/analysis"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            📈 Analysis
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "hover:bg-slate-800/60"
              }`
            }
          >
            👤 Profile
          </NavLink>
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-4 w-full px-3">
        <NavLink
          to="/logout"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
        >
          ⏻ Logout
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
