import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    X,
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

    const [success, setSuccess] =
        useState("");

    // const [
    //     updatingUserId,
    //     setUpdatingUserId,
    // ] = useState("");

    const [
        deletingUserId,
        setDeletingUserId,
    ] = useState("");

    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);


    /* =====================================================
       CURRENT ADMIN
    ===================================================== */

    let currentUser = null;

    try {
        const storedUser =
            localStorage.getItem("user");

        currentUser = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        currentUser = null;
    }

    const currentUserId =
        currentUser?._id ||
        currentUser?.id ||
        "";


    /* =====================================================
       LOAD USERS
    ===================================================== */

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get(
                    "/admin/users"
                );

            setUsers(
                response.data?.users || []
            );
        } catch (requestError) {
            console.error(
                "Admin Users Error:",
                requestError.response
                    ?.data ||
                requestError.message
            );

            setError(
                requestError.response
                    ?.data?.message ||
                "Unable to load users"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadUsers();
    }, []);


    /* =====================================================
       SEARCH USERS
    ===================================================== */

    const filteredUsers =
        useMemo(() => {
            const value = search
                .trim()
                .toLowerCase();

            if (!value) {
                return users;
            }

            return users.filter(
                (user) => {
                    const searchableText = [
                        user.name,
                        user.email,
                        user.role,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText
                        .includes(value);
                }
            );
        }, [users, search]);


    /* =====================================================
       CHANGE USER ROLE
    ===================================================== */

    const handleRoleChange = async (
        user,
        newRole
    ) => {
        if (
            !user?._id ||
            user.role === newRole
        ) {
            return;
        }

        if (
            String(user._id) ===
            String(currentUserId)
        ) {
            setError(
                "You cannot change your own administrator role"
            );

            return;
        }

        try {
            setUpdatingUserId(
                user._id
            );

            setError("");
            setSuccess("");

            const response =
                await api.patch(
                    `/admin/users/${user._id}/role`,
                    {
                        role: newRole,
                    }
                );

            const updatedUser =
                response.data?.user;

            setUsers(
                (previousUsers) =>
                    previousUsers.map(
                        (existingUser) =>
                            existingUser._id ===
                                user._id
                                ? updatedUser || {
                                    ...existingUser,
                                    role:
                                        newRole,
                                }
                                : existingUser
                    )
            );

            setSuccess(
                response.data?.message ||
                `User role changed to ${newRole}`
            );
        } catch (requestError) {
            console.error(
                "Update User Role Error:",
                requestError.response
                    ?.data ||
                requestError.message
            );

            setError(
                requestError.response
                    ?.data?.message ||
                "Unable to update user role"
            );
        } finally {
            setUpdatingUserId("");
        }
    };


    /* =====================================================
       OPEN DELETE MODAL
    ===================================================== */

    const openDeleteModal = (
        user
    ) => {
        setError("");
        setSuccess("");

        if (
            String(user._id) ===
            String(currentUserId)
        ) {
            setError(
                "You cannot delete your own administrator account"
            );

            return;
        }

        setSelectedUser(user);
    };


    /* =====================================================
       CLOSE DELETE MODAL
    ===================================================== */

    const closeDeleteModal = () => {
        if (deletingUserId) {
            return;
        }

        setSelectedUser(null);
    };


    /* =====================================================
       DELETE USER
    ===================================================== */

    const handleDeleteUser =
        async () => {
            if (!selectedUser?._id) {
                return;
            }

            try {
                setDeletingUserId(
                    selectedUser._id
                );

                setError("");
                setSuccess("");

                const response =
                    await api.delete(
                        `/admin/users/${selectedUser._id}`
                    );

                setUsers(
                    (previousUsers) =>
                        previousUsers.filter(
                            (user) =>
                                user._id !==
                                selectedUser._id
                        )
                );

                setSuccess(
                    response.data?.message ||
                    "User deleted successfully"
                );

                setSelectedUser(null);
            } catch (requestError) {
                console.error(
                    "Delete User Error:",
                    requestError.response
                        ?.data ||
                    requestError.message
                );

                setError(
                    requestError.response
                        ?.data?.message ||
                    "Unable to delete user"
                );
            } finally {
                setDeletingUserId("");
            }
        };


    /* =====================================================
       CLEAR MESSAGE
    ===================================================== */

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };


    return (
        <div className="admin-page">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-page-header">
                    <div>
                        <p className="admin-eyebrow">
                            USER MANAGEMENT
                        </p>

                        <h1>
                            Registered users
                        </h1>

                        <span>
                            Manage students and
                            administrators registered
                            on PrepMate AI.
                        </span>
                    </div>

                    <div className="admin-ai-status">
                        <Users size={21} />

                        <div>
                            <span>
                                Total users
                            </span>

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
                            onChange={(
                                event
                            ) => {
                                setSearch(
                                    event.target
                                        .value
                                );

                                clearMessages();
                            }}
                            placeholder="Search users..."
                            aria-label="Search users"
                        />
                    </div>

                    <span>
                        {
                            filteredUsers.length
                        }{" "}
                        users
                    </span>
                </section>


                {success && (
                    <div
                        className="admin-success-message"
                        role="status"
                    >
                        <CheckCircle2
                            size={19}
                        />

                        <p>{success}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            aria-label="Close success message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}


                {error && (
                    <div
                        className="admin-error"
                        role="alert"
                    >
                        <AlertTriangle
                            size={19}
                        />

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Close error message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}


                {loading ? (
                    <div className="admin-loading">
                        <LoaderCircle
                            size={30}
                            className="admin-spin"
                        />

                        <p>
                            Loading users...
                        </p>
                    </div>
                ) : filteredUsers.length ===
                    0 ? (
                    <div className="admin-data-card">
                        <div className="admin-empty-state">
                            <Users size={30} />

                            <p>
                                No users found
                            </p>
                        </div>
                    </div>
                ) : (
                    <section className="admin-data-card">
                        <div className="admin-table-wrapper">
                            <table className="admin-table admin-large-table">
                                <thead>
                                    <tr>
                                        <th>User</th>

                                        <th>
                                            Current role
                                        </th>

                                        <th>
                                            Joined date
                                        </th>

                                        <th>
                                            Account ID
                                        </th>

                                        <th>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map(
                                        (user) => {
                                            const isCurrentUser =
                                                String(
                                                    user._id
                                                ) ===
                                                String(
                                                    currentUserId
                                                );

                                            // const isUpdating =
                                            //     updatingUserId ===
                                            //     user._id;

                                            const isDeleting =
                                                deletingUserId ===
                                                user._id;

                                            return (
                                                <tr
                                                    key={
                                                        user._id
                                                    }
                                                >
                                                    <td>
                                                        <div className="admin-user-cell">
                                                            <div className="admin-small-avatar">
                                                                {user.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase() ||
                                                                    "U"}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {user.name ||
                                                                        "Unnamed user"}

                                                                    {isCurrentUser && (
                                                                        <small className="admin-current-user-label">
                                                                            You
                                                                        </small>
                                                                    )}
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        user.email
                                                                    }
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
                                                                "Admin" && (
                                                                    <ShieldCheck
                                                                        size={
                                                                            13
                                                                        }
                                                                    />
                                                                )}

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
                                                            {
                                                                user._id
                                                            }
                                                        </code>
                                                    </td>

                                                    <td>
                                                        {user.role === "Admin" ? (
                                                            <span className="admin-protected-account">
                                                                <ShieldCheck size={15} />
                                                                Protected
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="admin-delete-user-button"
                                                                disabled={isDeleting}
                                                                onClick={() =>
                                                                    openDeleteModal(user)
                                                                }
                                                            >
                                                                {isDeleting ? (
                                                                    <LoaderCircle
                                                                        size={17}
                                                                        className="admin-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2 size={17} />
                                                                )}

                                                                Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>


            {selectedUser && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDeleteModal();
                        }
                    }}
                >
                    <section
                        className="admin-confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-user-title"
                    >
                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={
                                closeDeleteModal
                            }
                            disabled={
                                Boolean(
                                    deletingUserId
                                )
                            }
                            aria-label="Close confirmation"
                        >
                            <X size={20} />
                        </button>

                        <div className="admin-confirm-icon">
                            <AlertTriangle
                                size={28}
                            />
                        </div>

                        <h2 id="delete-user-title">
                            Delete user?
                        </h2>

                        <p>
                            Are you sure you want
                            to delete{" "}
                            <strong>
                                {selectedUser.name}
                            </strong>
                            ?
                        </p>

                        <span className="admin-delete-warning">
                            Their materials,
                            preparations and virtual
                            interview records will also
                            be permanently deleted.
                        </span>

                        <div className="admin-confirm-actions">
                            <button
                                type="button"
                                className="admin-cancel-button"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={
                                    Boolean(
                                        deletingUserId
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-confirm-delete-button"
                                onClick={
                                    handleDeleteUser
                                }
                                disabled={
                                    Boolean(
                                        deletingUserId
                                    )
                                }
                            >
                                {deletingUserId ? (
                                    <LoaderCircle
                                        size={18}
                                        className="admin-spin"
                                    />
                                ) : (
                                    <Trash2
                                        size={18}
                                    />
                                )}

                                {deletingUserId
                                    ? "Deleting..."
                                    : "Delete user"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};


export default AdminUsers;