import {Outlet} from "react-router-dom";
import Sidebar from "../../components/Sidebar.tsx";

const AppLayout = () => {
  return (
    <div className="flex h-screen">
      <div className=''>
        <Sidebar />
      </div>
      <main className={`flex-1 overflow-y-auto`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
