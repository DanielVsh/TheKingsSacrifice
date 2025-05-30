import React, {useState} from "react";
import SignupModal from "./SignUpModal.tsx";
import LoginModal from "./LoginModal.tsx";

interface RegistrationModalProps {

}

const AuthenticationModal: React.FC<RegistrationModalProps> = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <div className={`flex space-x-10 text-4xl font-bold`}>
        <div className={`cursor-pointer hover:drop-shadow-lg`} onClick={() => setIsSignupOpen(true)}>Register</div>
        <div className={`cursor-pointer hover:drop-shadow-lg`} onClick={() => setIsLoginOpen(true)}>Login</div>
      </div>
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}/>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}/>
    </>
  );
};

export default AuthenticationModal;