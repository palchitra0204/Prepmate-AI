import {
  LoaderCircle,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

import "../styles/admin.css";

const AdminUsers = () => {
  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/admin/users"
        );

        setUsers(
          response.data?.users || []
        );
      } catch (requestError) {
        console.error(
          "Admin Users Error:",
          requestError.response?.data ||
          requestError.message
        );

        setError(
          requestError.response?.data
            ?.message ||
          "Unable to load users"
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers =
    useMemo(() => {
      const searchValue = search
        .trim()
        .toLowerCase();

      if (!searchValue) {
        return users;
      }

      return users.filter((user) => {
        return (
          user.name
            ?.toLowerCase()
            .includes(searchValue) ||
          user.email
            ?.toLowerCase()
            .includes(searchValue) ||
          user.role
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }, [users, search]);

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">
              USER MANAGEMENT
            </p>

            <h1>Registered users</h1>

            <span>
              View students and administrators
              registered on PrepMate AI.
            </span>
          </div>

          <div className="admin-ai-status">
            <Users size={21} />

            <div>
              <span>Total users</span>

              <strong>
                {users.length}
              </strong>
            </div>
          </div>
        </header>

        <section className="admin-list-toolbar">
          <div className="admin-search-box">
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search users..."
              aria-label="Search users"
            />
          </div>

          <span>
            {filteredUsers.length} users
          </span>
        </section>

        {error && (
          <div className="admin-error">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            <LoaderCircle
              size={30}
              className="admin-spin"
            />

            <p>Loading users...</p>
          </div>
        ) : !error &&
          filteredUsers.length === 0 ? (
          <div className="admin-data-card">
            <div className="admin-empty-state">
              <Users size={30} />

              <p>No users found</p>
            </div>
          </div>
        ) : (
          !error && (
            <section className="admin-data-card">
              <div className="admin-table-wrapper">
                <table className="admin-table admin-large-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Joined date</th>
                      <th>Account ID</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map(
                      (user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-small-avatar">
                                {user.name
                                  ?.charAt(0)
                                  .toUpperCase() ||
                                  "U"}
                              </div>

                              <div>
                                <strong>
                                  {user.name ||
                                    "Unnamed user"}
                                </strong>

                                <span>
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`admin-role-badge ${user.role ===
                                  "Admin"
                                  ? "admin-role-admin"
                                  : ""
                                }`}
                            >
                              {user.role ===
                                "Admin" ? (
                                <ShieldCheck
                                  size={13}
                                />
                              ) : null}

                              {user.role ||
                                "Student"}
                            </span>
                          </td>

                          <td>
                            {user.createdAt
                              ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                              : "—"}
                          </td>

                          <td>
                            <code className="admin-id">
                              {user._id}
                            </code>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )
        )}
      </main>
    </div>
  );
};

export default AdminUsers;