import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  // Get user from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="w-80 bg-[#00332e] p-6 flex flex-col gap-6 min-h-screen overflow-y-auto sticky top-0" style={{height: '100vh'}}>
      <img src="https://i.ibb.co/W40V9Psr/FFS-NEW.png" alt="Logo" className="w-20 h-20 rounded-full bg-white bg-opacity-20 mb-4" />
      <Link to="/" className="font-bold text-lg mb-2 hover:text-green-300">Home</Link>
      <Link to="/credit-report" className="mb-2 hover:text-green-300">Client File</Link>
      {user && user.role === 'admin' && (
        <Link to="/admin" className="mb-2 hover:text-blue-300 bg-blue-600 bg-opacity-20 px-2 py-1 rounded">Admin Settings</Link>
      )}
      <div className="mt-8">
        <div className="text-gray-300 mb-2">Coming Soon</div>
        <ul className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <li key={i}>
              <Link to="/coming-soon" className="text-gray-400 hover:text-yellow-400 hover:underline">Feature {i + 1}</Link>
            </li>
          ))}
        </ul>
      </div>
      <span
        onClick={handleLogout}
        className="mt-auto text-red-500 cursor-pointer hover:underline text-lg font-semibold select-none"
        style={{ marginTop: 'auto' }}
      >
        Sign Out
      </span>
    </aside>
  );
}

export default Sidebar; 