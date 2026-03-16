import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/state/store.ts";
import AuthenticationModal from "../../modals/AuthenticationModal.tsx";
import { decodeJwt } from "../../services/TokenService.ts";

const isTokenExpired = (exp: number): boolean => {
  return exp < Math.floor(Date.now() / 1000);
};

const checkAuthentication = (accessToken: string | null): boolean => {
  if (!accessToken) return false;
  try {
    const playerFromToken = decodeJwt(accessToken);
    if (playerFromToken?.exp && isTokenExpired(playerFromToken.exp)) return false;
    return true;
  } catch {
    return false;
  }
};

export const AuthRoute = () => {
  const accessToken = useSelector((state: RootState) => state.playerReducer).accessToken;
  const navigate = useNavigate();
  const isAuthenticated = accessToken && checkAuthentication(accessToken);

  if (isAuthenticated) return <Outlet />;

  return (
    <div className="flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">

        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-3xl bg-blue-600/5 blur-3xl scale-110 pointer-events-none" />

        {/* Card */}
        <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur-sm p-10 flex flex-col items-center text-center shadow-[0_32px_64px_rgba(0,0,0,0.5)]">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-700/40 flex items-center justify-center text-4xl mb-6 shadow-[0_0_24px_rgba(59,130,246,0.15)]">
            ♚
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl font-black text-white mb-2">
            Members only
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
            You need an account to access this page. Log in or create one — it only takes a moment.
          </p>

          {/* Auth buttons */}
          <AuthenticationModal />

          {/* Divider */}
          <div className="flex items-center gap-3 w-full my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[0.65rem] uppercase tracking-widest text-slate-600 font-mono">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Back to home */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            Back to main page
          </button>

        </div>
      </div>
    </div>
  );
};