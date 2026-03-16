import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthenticateRegisteredPlayerMutation } from "../app/state/api/AuthApi.ts";
import { useDispatch } from "react-redux";
import { setTokens } from "../app/state/reducers/PlayerReducer.ts";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [authenticatePlayer, { isLoading }] = useAuthenticateRegisteredPlayerMutation();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginData) => {
    setServerError(null);
    try {
      const tokens = await authenticatePlayer(data).unwrap();
      dispatch(setTokens(tokens));
      navigate("/", { replace: true });
    } catch {
      setServerError("Invalid email or password. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-violet-500 to-blue-600" />

            <div className="p-8">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all text-sm"
              >
                ✕
              </button>

              {/* Header */}
              <div className="text-center mb-7">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-700/40 flex items-center justify-center text-2xl mx-auto mb-4">
                  ♔
                </div>
                <h2 className="font-serif text-2xl font-black text-white">Welcome back</h2>
                <p className="text-slate-500 text-xs mt-1">Log in to continue your games</p>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Email */}
                <div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-600/60 focus:bg-slate-800 transition-all"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-600/60 focus:bg-slate-800 transition-all pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_28px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Logging in…
                    </>
                  ) : (
                    "Log in"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;