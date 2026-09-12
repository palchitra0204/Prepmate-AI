import {
  BrainCircuit,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

const adminNavigation = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    title: "Materials",
    path: "/admin/materials",
    icon: FileText,
  },
  {
    title: "AI Generations",
    path: "/admin/generations",
    icon: History,
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] =
    useState(false);

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("user");

    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      <button
        type="button"
        className="admin-menu-button"
        onClick={() =>
          setIsOpen(true)
        }
        aria-label="Open admin menu"
      >
        <Menu size={24} />
        Menu
      </button>

      {isOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close admin menu"
        />
      )}

      <aside
        className={`admin-sidebar ${
          isOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >
        <header className="admin-sidebar-header">
          <NavLink
            to="/admin"
            className="admin-sidebar-brand"
            onClick={closeSidebar}
          >
            <BrainCircuit size={34} />

            <div>
              <strong>
                PrepMate AI
              </strong>

              <span>
                Admin Panel
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close admin menu"
          >
            <X size={23} />
          </button>
        </header>

        <nav className="admin-navigation">
          <p>ADMIN MENU</p>

          {adminNavigation.map(
            (item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeSidebar}
                  className={({
                    isActive,
                  }) =>
                    `admin-navigation-link ${
                      isActive
                        ? "admin-navigation-link-active"
                        : ""
                    }`
                  }
                >
                  <Icon size={20} />

                  <span>
                    {item.title}
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>

        <footer className="admin-sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "A"}
            </div>

            <div>
              <strong>
                {user?.name || "Admin"}
              </strong>

              <span>
                {user?.email ||
                  "Administrator"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            Logout
          </button>
        </footer>
      </aside>
    </>
  );
};

export default AdminSidebar;