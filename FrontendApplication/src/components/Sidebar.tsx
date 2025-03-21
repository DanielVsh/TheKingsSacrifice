import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-36 h-screen bg-urban-dark text-white fixed top-0 left-0">
      <h2 className="text-xl font-bold mb-5">My App</h2>
      <nav>
        <ul className="space-y-3">
          <li>
            <Link to="/play/online/" className="block px-3 py-2 hover:bg-black">
              Play
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="block px-3 py-2 hover:bg-black">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/profile" className="block px-3 py-2 hover:bg-black">
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;