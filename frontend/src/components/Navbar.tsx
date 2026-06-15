import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const Navbar = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-blue-600 font-semibold dark:text-blue-400"
      : "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400";

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-blue-200 border-b border-blue-200 px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-xl font-bold text-blue-600 dark:text-blue-400"
        >
          JobTracker
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={`text-sm ${isActive("/dashboard")}`}>
            Dashboard
          </Link>
          <Link to="/jobs" className={`text-sm ${isActive("/jobs")}`}>
            Jobs
          </Link>
        </div>

        {/* Desktop user info + theme toggle */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="text-lg leading-none"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Hi,{" "}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              <span className="hover:text-blue-900 dark:hover:text-blue-400">
                {/* clicking on name should take you to profile */}
                <Link to="/profile">{user?.username || user?.email}</Link>
              </span>
            </span>
          </span>
        </div>

        {/* Mobile: username + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleDarkMode}
            className="text-lg leading-none"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Hi,{" "}
            <Link
              to="/profile"
              className="font-medium text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              onClick={closeMenu}
            >
              {user?.username || user?.email}
            </Link>
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl text-gray-600 leading-none dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden max-w-6xl mx-auto pt-4 pb-2 flex flex-col gap-4 border-t border-stone-200 mt-4 dark:border-gray-700 ">
          <Link
            to="/dashboard"
            className={`text-sm ${isActive("/dashboard")}`}
            onClick={closeMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            className={`text-sm ${isActive("/jobs")}`}
            onClick={closeMenu}
          >
            Jobs
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
