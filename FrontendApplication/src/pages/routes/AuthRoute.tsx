import {Outlet, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../app/state/store.ts";
import AuthenticationModal from "../../modals/AuthenticationModal.tsx";
import {decodeJwt} from "../../services/TokenService.ts";

const isTokenExpired = (exp: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return exp < currentTime;
}

const checkAuthentication = (accessToken: string | null): boolean => {
  if (accessToken) {
    try {
      const playerFromToken = decodeJwt(accessToken);

      if (playerFromToken?.exp && isTokenExpired(playerFromToken?.exp)) {
        console.log('Token has expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }
  return false;
};

export const AuthRoute = () => {
  const accessToken = useSelector((state: RootState) => state.playerReducer).accessToken;
  const navigate = useNavigate();

  return accessToken && checkAuthentication(accessToken)
    ? <Outlet/>
    : <>
      <div className={`flex flex-col items-center justify-center h-screen`}>
        <p className={'text-3xl'}>You need to log in or register to access this page.</p>
        <AuthenticationModal/>
        <div className={`text-2xl font-bold cursor-pointer hover:drop-shadow-lg pt-3.5`}>
          <button onClick={() => navigate('/')}>Main page</button>
        </div>
      </div>
    </>;
};