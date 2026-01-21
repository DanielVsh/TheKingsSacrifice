import {NavLink} from "react-router-dom";

export const MainPage = () => {
  return (
    <>
      <div className="max-w-screen ">


        <NavLink to={"play/online"} replace={true} className="text-3xl font-bold underline">
          Play with friends
        </NavLink>

      </div>
    </>
  );
};