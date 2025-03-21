import React, {useState} from "react";
import SignupModal from "./SignUpModal.tsx";

interface RegistrationModalProps {

}

const RegistrationModal: React.FC<RegistrationModalProps> = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <div className={`flex space-x-10 text-4xl font-bold`}>
        <div className={`cursor-pointer hover:drop-shadow-lg`} onClick={() => setIsSignupOpen(true)}>Register</div>
      </div>
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}/>
    </>
  );
};

export default RegistrationModal;