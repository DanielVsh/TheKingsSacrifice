import {Outlet} from "react-router-dom";
import Sidebar from "../../components/Sidebar.tsx";

const AppLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className={`flex-1 ml-48`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
