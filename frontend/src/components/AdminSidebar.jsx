import {
  BrainCircuit,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


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
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);


  /* =====================================================
     CLOSE SIDEBAR
  ===================================================== */

  const closeSidebar = () => {
    /*
     * Focused sidebar element ka focus
     * remove karke accessibility warning
     * prevent hoti hai.
     */

    if (
      document.activeElement
      instanceof HTMLElement
    ) {
      const sidebar =
        document.getElementById(
          "admin-sidebar"
        );

      if (
        sidebar?.contains(
          document.activeElement
        )
      ) {
        document.activeElement
          .blur();
      }
    }

    setIsOpen(false);
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    closeSidebar();

    /*
     * AuthContext aur localStorage
     * dono clear honge.
     */

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  return (
    <>
      {/* MENU BUTTON */}

      <button
        type="button"
        className="admin-menu-button"
        onClick={() =>
          setIsOpen(true)
        }
        aria-label="Open admin menu"
        aria-expanded={isOpen}
        aria-controls="admin-sidebar"
      >
        <Menu size={24} />

        <span>Menu</span>
      </button>


      {/* MOBILE OVERLAY */}

      {isOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={
            closeSidebar
          }
          aria-label="Close admin menu"
        />
      )}


      {/* ADMIN SIDEBAR */}

      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${isOpen
            ? "admin-sidebar-open"
            : ""
          }`}
        aria-label="Admin sidebar"
      >
        <div
          className="admin-sidebar-glow"
          aria-hidden="true"
        />


        {/* SIDEBAR HEADER */}

        <header className="admin-sidebar-header">
          <NavLink
            to="/admin"
            className="admin-sidebar-brand"
            onClick={
              closeSidebar
            }
          >
            <div className="admin-sidebar-brand-icon">
              <BrainCircuit
                size={31}
              />
            </div>

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
            onClick={
              closeSidebar
            }
            aria-label="Close admin menu"
          >
            <X size={22} />
          </button>
        </header>


        {/* ADMIN ACCESS BADGE */}

        <div className="admin-sidebar-admin-badge">
          <ShieldCheck
            size={16}
          />

          <span>
            Administrator access
          </span>
        </div>


        {/* ADMIN NAVIGATION */}

        <nav
          className="admin-navigation"
          aria-label="Admin navigation"
        >
          <p>ADMIN MENU</p>

          {adminNavigation.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  end={
                    item.end
                  }
                  onClick={
                    closeSidebar
                  }
                  className={({
                    isActive,
                  }) =>
                    `admin-navigation-link ${isActive
                      ? "admin-navigation-link-active"
                      : ""
                    }`
                  }
                >
                  <Icon
                    size={20}
                  />

                  <span>
                    {
                      item.title
                    }
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>


        {/* ADMIN PROFILE */}

        <footer className="admin-sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() ||
                "A"}
            </div>

            <div className="admin-profile-information">
              <strong>
                {user?.name ||
                  "Administrator"}
              </strong>

              <span>
                {user?.email ||
                  "No email available"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={
              handleLogout
            }
          >
            <LogOut
              size={19}
            />

            <span>
              Logout
            </span>
          </button>
        </footer>
      </aside>
    </>
  );
};


export default AdminSidebar;