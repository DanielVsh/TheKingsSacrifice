import {Outlet, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import RegistrationModal from "./RegistrationModal.tsx";

export const AuthRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.playerReducer.player)?.uuid
  const navigate = useNavigate();

  return isAuthenticated
    ? <Outlet/>
    : <>
      <div className={`flex flex-col items-center justify-center h-screen`}>
        <p className={'text-3xl'}>You need to register to access this page.</p>
        <RegistrationModal/>
        <div className={`text-2xl font-bold cursor-pointer hover:drop-shadow-lg pt-3.5`}>
          <button onClick={() => navigate('/')}>Main page</button>
        </div>
      </div>
    </>;
};