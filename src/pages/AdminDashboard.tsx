import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // install lucide-react for icons

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed sm:static top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 transition-transform duration-200 z-50`}
      >
        <div className="p-4 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
          Admin Panel
          {/* Close button for mobile */}
          <button
            className="sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `block p-2 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/items"
                className={({ isActive }) =>
                  `block p-2 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                Item List
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/borrowed"
                className={({ isActive }) =>
                  `block p-2 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                Borrowed Items
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/returned"
                className={({ isActive }) =>
                  `block p-2 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                Returned Items
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  `block p-2 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                Reports
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-white shadow p-4">
          <div className="flex items-center gap-4">
            {/* Hamburger button for mobile */}
            <button
              className="sm:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <section className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
