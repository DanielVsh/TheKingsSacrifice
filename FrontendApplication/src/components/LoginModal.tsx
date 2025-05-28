import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthenticateRegisteredPlayerMutation } from "../app/state/api/AuthApi";
import { useDispatch } from "react-redux";
import { setTokens } from "../app/state/reducers/PlayerReducer.ts";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [authenticatePlayer] = useAuthenticateRegisteredPlayerMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const tokens = await authenticatePlayer(data).unwrap();
      dispatch(setTokens(tokens));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed", err);
      // optionally show an error toast
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-urban-dark text-white p-6 rounded-lg w-96 relative shadow-lg"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-xl">
          <AiOutlineClose />
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-urban-black border border-urban-light rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 bg-urban-black border border-urban-light rounded pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <button
            type="submit"
            className={`w-full p-2 rounded text-black font-bold ${isValid ? "bg-urban-accent hover:bg-urban-accent" : "bg-gray-500 cursor-not-allowed"}`}
            disabled={!isValid}
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginModal;
