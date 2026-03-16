import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GiChessPawn, GiChessKnight, GiChessRook, GiChessQueen } from "react-icons/gi";
import { AiOutlineGoogle, AiOutlineApple } from "react-icons/ai";
import { useCreateRegisteredPlayerMutation } from "../app/state/api/AuthApi.ts";
import { useDispatch } from "react-redux";
import { setTokens } from "../app/state/reducers/PlayerReducer.ts";
import { useNavigate } from "react-router-dom";
import { RegisteredPlayerRequest } from "../app/interfaces/IPlayer.ts";

// ── Schema ───────────────────────────────────────────────────
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  nickname: z.string().min(3, "At least 3 characters"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string(),
  skillLevel: z.enum(["new", "beginner", "intermediate", "advanced"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

// ── Helpers ──────────────────────────────────────────────────
const skillRating: Record<FormData["skillLevel"], number> = {
  new: 200, beginner: 500, intermediate: 1000, advanced: 1500,
};

const SKILL_LEVELS = [
  { id: "new",          label: "New",          icon: GiChessPawn  },
  { id: "beginner",     label: "Beginner",     icon: GiChessKnight },
  { id: "intermediate", label: "Intermediate", icon: GiChessRook  },
  { id: "advanced",     label: "Advanced",     icon: GiChessQueen },
] as const;

// ── Component ────────────────────────────────────────────────
interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [skillLevel, setSkillLevel] = useState<FormData["skillLevel"]>("new");
  const [serverError, setServerError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createRegisteredPlayer] = useCreateRegisteredPlayerMutation<RegisteredPlayerRequest>();

  const { register, handleSubmit, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { skillLevel: "new" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const tokens = await createRegisteredPlayer({
        email: data.email,
        nickname: data.nickname,
        password: data.password,
        rating: skillRating[data.skillLevel],
      }).unwrap();
      dispatch(setTokens(tokens));
      navigate("/", { replace: true });
    } catch {
      setServerError("Registration failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-64"
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
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-violet-500 to-blue-600 sticky top-0 z-10" />

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
                  ♟
                </div>
                <h2 className="font-serif text-2xl font-black text-white">Join the board</h2>
                <p className="text-slate-500 text-xs mt-1">Create your free account</p>
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
                  {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
                </div>

                {/* Nickname */}
                <div>
                  <input
                    {...register("nickname")}
                    type="text"
                    placeholder="Nickname"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-600/60 focus:bg-slate-800 transition-all"
                  />
                  {errors.nickname && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.nickname.message}</p>}
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
                  {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-600/60 focus:bg-slate-800 transition-all"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Skill level */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2.5">
                    Your skill level
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {SKILL_LEVELS.map(({ id, label, icon: Icon }) => {
                      const active = skillLevel === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSkillLevel(id);
                            setValue("skillLevel", id, { shouldValidate: true });
                          }}
                          className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-xs font-medium transition-all ${
                            active
                              ? "border-blue-600/60 bg-blue-600/10 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                              : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-[0.65rem] leading-tight text-center">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_28px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
                >
                  "Create account"
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[0.65rem] uppercase tracking-widest text-slate-600 font-mono">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Social */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-all">
                  <AiOutlineGoogle size={16} /> Continue with Google
                </button>
                <button className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-all">
                  <AiOutlineApple size={16} /> Continue with Apple
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignupModal;