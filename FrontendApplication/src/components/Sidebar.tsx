import { Link } from "react-router-dom";
import React from "react";

const Sidebar = () => {
  return (
    <div className="w-36 h-screen bg-neutral-900 text-white fixed top-0 left-0">
      <h2 className="text-2xl font-bold mb-6">My App</h2>
      <nav>
        <ul className="space-y-4 text-sm">
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
          <li>
            <Link to="/logout" className="block px-3 py-2 hover:bg-black">
              Logout
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;