import {NavLink} from "react-router-dom";

export const MainPage = () => {
  return (
    <>
      <NavLink to={"play/online"} replace={true} className="text-3xl font-bold underline">
        Play with friends
      </NavLink>
    </>
  );
};