import React, { useState } from "react";
import SignupModal from "./SignUpModal.tsx";
import LoginModal from "./LoginModal.tsx";

const AuthenticationModal: React.FC = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 w-full">

        {/* Register — primary */}
        <button
          onClick={() => setIsSignupOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_28px_rgba(59,130,246,0.45)]"
        >
          <span className="text-base">♟</span>
          Create account
        </button>

        {/* Login — secondary */}
        <button
          onClick={() => setIsLoginOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5"
        >
          <span className="text-base">♔</span>
          Log in
        </button>

      </div>

      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
      <LoginModal  isOpen={isLoginOpen}  onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default AuthenticationModal;