import { useState } from "react";

import {
  BrainCircuit,
  History,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import "../styles/sidebar.css";

const studentMenuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Upload Material",
    path: "/upload",
    icon: Upload,
  },

  {
    name: "My Materials",
    path: "/materials",
    icon: Library,
  },

  {
    name: "History",
    path: "/history",
    icon: History,
  },

  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const adminMenuItems = [
  {
    name: "Admin Dashboard",
    path: "/admin",
    icon: ShieldCheck,
  },

  {
    name: "Manage Users",
    path: "/admin/users",
    icon: Users,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [isOpen, setIsOpen] =
    useState(false);

  const menuItems =
    user?.role === "Admin"
      ? [
        ...studentMenuItems,
        ...adminMenuItems,
      ]
      : studentMenuItems;

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();

    closeSidebar();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="sidebar-menu-button"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
          <span>Menu</span>
        </button>
      )}

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`sidebar ${isOpen
            ? "sidebar-open"
            : ""
          }`}
      >
        <div className="sidebar-header">
          <NavLink
            to={
              user?.role === "Admin"
                ? "/admin"
                : "/dashboard"
            }
            className="sidebar-logo"
            onClick={closeSidebar}
          >
            <BrainCircuit size={29} />

            <span>PrepMate AI</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                end={
                  item.path ===
                  "/admin"
                }
                className={({
                  isActive,
                }) =>
                  `sidebar-link ${isActive
                    ? "sidebar-link-active"
                    : ""
                  }`
                }
              >
                <Icon size={20} />

                <span>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-details">
              <strong>
                {user?.name ||
                  "Student"}
              </strong>

              <span>
                {user?.email || ""}
              </span>

              {user?.role ===
                "Admin" && (
                  <small>
                    Administrator
                  </small>
                )}
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;