import React, {useEffect} from "react";
import { NavLink } from "react-router-dom";
import {setPlayer} from "../app/state/reducers/PlayerReducer.ts";
import {useGetPlayerDataQuery} from "../app/state/api/PlayerApi.ts";
import {useDispatch} from "react-redux";

const FEATURES = [
  {
    icon: "♟",
    title: "Play Online",
    description:
      "Challenge players from around the world in real-time. Choose your time control — bullet, blitz, or rapid — and jump into a match instantly.",
    to: "/play/online",
    cta: "Find a game",
    accent: "blue",
  },
  {
    icon: "🤖",
    title: "Practice vs Bot",
    description:
      "Sharpen your skills against our AI at any difficulty. Perfect for warming up, testing new openings, or learning the endgame.",
    to: "/play/bot",
    cta: "Play bot",
    accent: "violet",
  },
  {
    icon: "♞",
    title: "Daily Puzzles",
    description:
      "Solve tactical puzzles every day. From beginner forks to grandmaster-level combinations — train your pattern recognition.",
    to: "/puzzle",
    cta: "Solve puzzles",
    accent: "amber",
  },
  {
    icon: "♜",
    title: "Game Analysis",
    description:
      "Review your games move by move. Spot mistakes, find missed opportunities, and understand what could have been played better.",
    to: "/analysis",
    cta: "Analyse a game",
    accent: "emerald",
  },
];

const accentMap: Record<string, {
  border: string; glow: string; text: string; bg: string; btn: string;
}> = {
  blue:    { border: "border-blue-700/40",    glow: "shadow-[0_0_32px_rgba(59,130,246,0.08)]",    text: "text-blue-400",    bg: "bg-blue-600/10",    btn: "bg-blue-600 hover:bg-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.3)]" },
  violet:  { border: "border-violet-700/40",  glow: "shadow-[0_0_32px_rgba(139,92,246,0.08)]",    text: "text-violet-400",  bg: "bg-violet-600/10",  btn: "bg-violet-600 hover:bg-violet-500 shadow-[0_4px_20px_rgba(139,92,246,0.3)]" },
  amber:   { border: "border-amber-700/40",   glow: "shadow-[0_0_32px_rgba(245,158,11,0.08)]",    text: "text-amber-400",   bg: "bg-amber-600/10",   btn: "bg-amber-600 hover:bg-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.3)]" },
  emerald: { border: "border-emerald-700/40", glow: "shadow-[0_0_32px_rgba(16,185,129,0.08)]",    text: "text-emerald-400", bg: "bg-emerald-600/10", btn: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)]" },
};

export const MainPage: React.FC = () => {
  const dispatch = useDispatch();

  const { data: playerData, error: playerError, isLoading: playerLoading } = useGetPlayerDataQuery();

  useEffect(() => {
    if (playerData && !playerError && !playerLoading) dispatch(setPlayer(playerData));
  }, [playerData, dispatch]);

  return (
    <div className="min-h-screen text-slate-200 px-4 md:px-8 py-10 space-y-24">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center pt-8 pb-4">



        {/* Floating pieces */}
        <div className="flex gap-5 text-3xl mb-8 opacity-20 select-none" aria-hidden>
          {["♜","♞","♝","♛","♚","♝","♞","♜"].map((p, i) => (
            <span
              key={i}
              className="animate-bounce"
              style={{ animationDelay: `${i * 0.13}s`, animationDuration: "3s" }}
            >
              {p}
            </span>
          ))}
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-black tracking-tight text-white leading-none mb-5">
          Chess,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            reimagined.
          </span>
        </h1>

        <p className="max-w-xl text-slate-400 text-lg leading-relaxed">
          Play, learn, and master the game — all in one place. Whether you're a
          beginner finding your first opening or a veteran chasing your peak rating,
          this is your board.
        </p>

        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          <NavLink
            to="/play/online"
            className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.5)]"
          >
            ♟ Start Playing
          </NavLink>
          <NavLink
            to="/puzzle"
            className="px-7 py-3 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5"
          >
            ♞ Try a Puzzle
          </NavLink>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────── */}
      <section>
        <p className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-slate-600 font-mono mb-10">
          Everything you need
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const a = accentMap[f.accent];
            return (
              <div
                key={f.title}
                className={`group relative flex flex-col rounded-2xl border ${a.border} ${a.glow} bg-slate-900/70 p-6 hover:-translate-y-1.5 transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.description}</p>
                <NavLink
                  to={f.to}
                  className={`mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 ${a.btn}`}
                >
                  {f.cta} →
                </NavLink>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto">
        <p className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-slate-600 font-mono mb-10">
          How it works
        </p>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-blue-600/50 via-violet-600/30 to-transparent hidden sm:block" />

          <div className="space-y-8">
            {[
              { step: "01", title: "Create your account",  desc: "Sign up in seconds. No credit card, no hassle — just pick a username and you're in.", icon: "♔" },
              { step: "02", title: "Choose your mode",     desc: "Play live online, challenge a bot, solve a puzzle, or analyse a past game. The choice is always yours.", icon: "♟" },
              { step: "03", title: "Play & improve",       desc: "Every game teaches you something. Use our analysis tool after each match to understand your mistakes and grow.", icon: "♜" },
              { step: "04", title: "Invite friends",       desc: "Share a link or a QR code and play a private game with anyone.", icon: "♞" },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-6 sm:gap-8 items-start group">
                <div className="relative shrink-0 w-10 h-10 rounded-full bg-slate-900 border border-blue-700/50 flex items-center justify-center z-10 group-hover:border-blue-500/80 transition-colors">
                  <span className="text-base">{s.icon}</span>
                </div>
                <div>
                  <span className="text-[0.6rem] font-mono text-blue-500/70 tracking-widest uppercase">{s.step}</span>
                  <h4 className="font-serif text-lg font-bold text-white mt-0.5 mb-1.5">{s.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="relative rounded-2xl overflow-hidden border border-blue-800/30 bg-slate-900/80 p-10 md:p-16 text-center">
        {/* Corner board decorations */}
        <div
          className="absolute right-0 bottom-0 w-72 h-72 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "repeating-conic-gradient(#60a5fa 0% 25%, transparent 0% 50%)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute left-0 top-0 w-72 h-72 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "repeating-conic-gradient(#a78bfa 0% 25%, transparent 0% 50%)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10">
          <p className="text-5xl mb-5 select-none animate-bounce" style={{ animationDuration: "3s" }}>♛</p>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Your next move awaits.
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Join the board, find your opponent, and play the game the way it was meant to be played.
          </p>
          <NavLink
            to="/play/online"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold tracking-wide transition-all hover:-translate-y-0.5 shadow-[0_4px_32px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.55)]"
          >
            ♟ Play Now — it's free
          </NavLink>
        </div>
      </section>

    </div>
  );
};