import {useDispatch, useSelector} from "react-redux";
import {clearPlayer} from "../app/state/reducers/PlayerReducer.ts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {backendIp} from "../app/config/backend.ts";
import {RootState} from "../app/state/store.ts";

const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = useSelector((state: RootState) => state.playerReducer.accessToken);

  const logoutPlayer = async () => {
    try {
      await axios.post(`${backendIp}/rest/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleConfirm = async () => {
    await logoutPlayer();
    dispatch(clearPlayer());
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center  text-white">
        <div className="bg-urban-black p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl mb-4">Are you sure you want to log out?</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Yes, log me out
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
    </div>
  );
};

export default LogoutPage;
