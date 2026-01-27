import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {motion} from "framer-motion";
import {AiOutlineClose, AiOutlineGoogle, AiOutlineApple} from "react-icons/ai";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import {GiChessPawn, GiChessKnight, GiChessRook, GiChessQueen} from "react-icons/gi";
import {useCreateRegisteredPlayerMutation} from "../app/state/api/AuthApi.ts";
import {useDispatch} from "react-redux";
import {setTokens} from "../app/state/reducers/PlayerReducer.ts";
import {Dispatch} from "@reduxjs/toolkit";
import {NavigateFunction, useNavigate} from "react-router-dom";
import { MutationActionCreatorResult, MutationDefinition, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import {RegisteredPlayerRequest} from "../app/interfaces/IPlayer.ts";

const passwordSchema = z.string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must have an uppercase letter")
  .regex(/[a-z]/, "Must have a lowercase letter")
  .regex(/[0-9]/, "Must have a number")
  .regex(/[^A-Za-z0-9]/, "Must have a special character");

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  nickname: z.string().min(3, "At least 3 characters"),
  password: passwordSchema,
  confirmPassword: z.string(),
  skillLevel: z.enum(["new", "beginner", "intermediate", "advanced"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const handleCreateRegisteredPlayer = async (
  data: {
    email: string;
    nickname: string;
    password: string;
    confirmPassword: string;
    skillLevel: "new" | "beginner" | "intermediate" | "advanced";
  },
  dispatch: Dispatch,
  navigate: NavigateFunction,
  createRegisteredPlayer: { (arg: RegisteredPlayerRequest): MutationActionCreatorResult<MutationDefinition<RegisteredPlayerRequest, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, PlayerTokens, "playerApi">>; (arg0: { email: string; nickname: string; password: string; rating: number; }): { (): any; new(): any; unwrap: { (): any; new(): any; }; }; }
) => {
  let rating;
  if (data.skillLevel === "new") {
    rating = 200;
  } else if (data.skillLevel === "beginner") {
    rating = 500;
  } else if (data.skillLevel === "intermediate") {
    rating = 1000;
  } else if (data.skillLevel === "advanced") {
    rating = 1500;
  } else {
    throw new Error()
  }

  const tokens = await createRegisteredPlayer({
    email: data.email,
    nickname: data.nickname,
    password: data.password,
    rating: rating,
  }).unwrap();

  dispatch(setTokens(tokens))
  navigate("/dashboard", { replace: true });
}

const SignupModal = ({isOpen, onClose}: SignupModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [skillLevel, setSkillLevel] = useState<FormData["skillLevel"]>("new");
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [createRegisteredPlayer] = useCreateRegisteredPlayerMutation<RegisteredPlayerRequest>();

  const {register, handleSubmit, setValue, formState: {errors, isValid}} = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = (data: any) => {
    handleCreateRegisteredPlayer(data, dispatch, navigate, createRegisteredPlayer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <motion.div
        initial={{opacity: 0, scale: 0.8}}
        animate={{opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.8}}
        transition={{duration: 0.2, ease: "easeOut"}}
        className="bg-urban-dark text-white p-6 rounded-lg w-96 relative shadow-lg"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-xl">
          <AiOutlineClose/>
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Join Now</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <input {...register("email")} type="email" placeholder="Email"
                 className="w-full p-2 bg-urban-black border border-urban-light rounded"/>
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          {/* Nickname */}
          <input {...register("nickname")} type="text" placeholder="Nickname"
                 className="w-full p-2 bg-urban-black border border-urban-light rounded"/>
          {errors.nickname && <p className="text-red-500 text-sm">{errors.nickname.message}</p>}

          {/* Password */}
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Password"
                   className="w-full p-2 bg-urban-black border border-urban-light rounded pr-10"/>
            <button type="button" className="absolute right-3 top-2.5 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash/> : <FaEye/>}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          {/* Confirm Password */}
          <input {...register("confirmPassword")} type="password" placeholder="Confirm Password"
                 className="w-full p-2 bg-urban-black border border-urban-light rounded"/>
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}

          {/* Skill Level Selection */}
          <p className="text-gray-400 text-sm">What is your chess skill level?</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              {id: "new", label: "New", icon: <GiChessPawn/>},
              {id: "beginner", label: "Beginner", icon: <GiChessKnight/>},
              {id: "intermediate", label: "Intermediate", icon: <GiChessRook/>},
              {id: "advanced", label: "Advanced", icon: <GiChessQueen/>}
            ].map(({id, label, icon}) => (
              <button key={id} type="button" onClick={() => {
                setSkillLevel(id as FormData["skillLevel"]);
                setValue("skillLevel", id as FormData["skillLevel"]);
              }}
                      className={`flex flex-col items-center p-2 border rounded ${skillLevel === id ? "border-urban-accent bg-urban-black" : "border-urban-light bg-gray-700"}`}>
                {icon}
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>

          {/* Sign-Up Button */}
          <button type="submit"
                  className={`w-full p-2 rounded text-black font-bold ${isValid
                    ? "bg-urban-accent hover:bg-urban-accent"
                    : "bg-gray-500 cursor-not-allowed"}`}
                  disabled={!isValid
                  }>
            Sign Up
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="w-full border-b border-urban-light"></div>
          <span className="px-2 text-gray-400">OR</span>
          <div className="w-full border-b border-urban-light"></div>
        </div>

        {/* Social Login Buttons */}
        <button className="w-full flex items-center justify-center bg-urban-black p-2 rounded mb-2 hover:bg-gray-700">
          <AiOutlineGoogle className="mr-2 text-lg"/> Continue with Google
        </button>
        <button className="w-full flex items-center justify-center bg-urban-black p-2 rounded hover:bg-gray-700">
          <AiOutlineApple className="mr-2 text-lg"/> Continue with Apple
        </button>
      </motion.div>
    </div>
  );
};

export default SignupModal;
