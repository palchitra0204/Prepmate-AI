import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    LoaderCircle,
    Search,
    Trash2,
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


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

const formatFileSize = (size) => {
    if (!size) {
        return "—";
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(
            size / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        size /
        (1024 * 1024)
    ).toFixed(1)} MB`;
};


/* =========================================================
   ADMIN MATERIALS
========================================================= */

const AdminMaterials = () => {
    const [
        materials,
        setMaterials,
    ] = useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [
        selectedMaterial,
        setSelectedMaterial,
    ] = useState(null);

    const [
        deletingMaterialId,
        setDeletingMaterialId,
    ] = useState("");


    /* =====================================================
       LOAD MATERIALS
    ===================================================== */

    const loadMaterials = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get(
                    "/admin/materials"
                );

            setMaterials(
                response.data?.materials ||
                []
            );
        } catch (requestError) {
            console.error(
                "Admin Materials Error:",
                requestError.response
                    ?.data ||
                requestError.message
            );

            setError(
                requestError.response
                    ?.data?.message ||
                "Unable to load materials"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadMaterials();
    }, []);


    /* =====================================================
       CLOSE MODAL WITH ESCAPE
    ===================================================== */

    useEffect(() => {
        if (!selectedMaterial) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (
                event.key === "Escape" &&
                !deletingMaterialId
            ) {
                setSelectedMaterial(null);
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [
        selectedMaterial,
        deletingMaterialId,
    ]);


    /* =====================================================
       SEARCH MATERIALS
    ===================================================== */

    const filteredMaterials =
        useMemo(() => {
            const value = search
                .trim()
                .toLowerCase();

            if (!value) {
                return materials;
            }

            return materials.filter(
                (material) => {
                    const searchableText = [
                        material.title,
                        material.originalFileName,
                        material.fileType,
                        material.status,
                        material.user?.name,
                        material.user?.email,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText
                        .includes(value);
                }
            );
        }, [materials, search]);


    /* =====================================================
       OPEN DELETE MODAL
    ===================================================== */

    const openDeleteModal = (
        material
    ) => {
        setError("");
        setSuccess("");
        setSelectedMaterial(material);
    };


    /* =====================================================
       CLOSE DELETE MODAL
    ===================================================== */

    const closeDeleteModal = () => {
        if (deletingMaterialId) {
            return;
        }

        setSelectedMaterial(null);
    };


    /* =====================================================
       DELETE MATERIAL
    ===================================================== */

    const handleDeleteMaterial =
        async () => {
            if (!selectedMaterial?._id) {
                return;
            }

            try {
                setDeletingMaterialId(
                    selectedMaterial._id
                );

                setError("");
                setSuccess("");

                const response =
                    await api.delete(
                        `/admin/materials/${selectedMaterial._id}`
                    );

                setMaterials(
                    (previousMaterials) =>
                        previousMaterials.filter(
                            (material) =>
                                material._id !==
                                selectedMaterial._id
                        )
                );

                setSuccess(
                    response.data?.message ||
                    "Material deleted successfully"
                );

                setSelectedMaterial(null);
            } catch (requestError) {
                console.error(
                    "Delete Admin Material Error:",
                    requestError.response
                        ?.data ||
                    requestError.message
                );

                setError(
                    requestError.response
                        ?.data?.message ||
                    "Unable to delete material"
                );
            } finally {
                setDeletingMaterialId("");
            }
        };


    return (
        <div className="admin-page">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-page-header">
                    <div>
                        <p className="admin-eyebrow">
                            MATERIAL MANAGEMENT
                        </p>

                        <h1>
                            Uploaded materials
                        </h1>

                        <span>
                            View and manage all study
                            documents uploaded by
                            PrepMate AI users.
                        </span>
                    </div>

                    <div className="admin-ai-status">
                        <FileText size={21} />

                        <div>
                            <span>
                                Total materials
                            </span>

                            <strong>
                                {materials.length}
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
                            onChange={(event) => {
                                setSearch(
                                    event.target.value
                                );

                                setError("");
                                setSuccess("");
                            }}
                            placeholder="Search materials or owners..."
                            aria-label="Search materials"
                        />
                    </div>

                    <span>
                        {
                            filteredMaterials.length
                        }{" "}
                        materials
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
                            Loading materials...
                        </p>
                    </div>
                ) : filteredMaterials.length ===
                    0 ? (
                    <div className="admin-data-card">
                        <div className="admin-empty-state">
                            <FileText
                                size={30}
                            />

                            <p>
                                No materials found
                            </p>
                        </div>
                    </div>
                ) : (
                    <section className="admin-data-card">
                        <div className="admin-table-wrapper">
                            <table className="admin-table admin-large-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Material
                                        </th>

                                        <th>
                                            Owner
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Size
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Uploaded
                                        </th>

                                        <th>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredMaterials.map(
                                        (material) => {
                                            const isDeleting =
                                                deletingMaterialId ===
                                                material._id;

                                            return (
                                                <tr
                                                    key={
                                                        material._id
                                                    }
                                                >
                                                    <td>
                                                        <div className="admin-user-cell">
                                                            <div className="admin-material-icon">
                                                                <FileText
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {material.title ||
                                                                        "Untitled material"}
                                                                </strong>

                                                                <span>
                                                                    {material.originalFileName ||
                                                                        "Study document"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="admin-table-person">
                                                            <strong>
                                                                {material
                                                                    .user
                                                                    ?.name ||
                                                                    "Unknown user"}
                                                            </strong>

                                                            <span>
                                                                {material
                                                                    .user
                                                                    ?.email ||
                                                                    "—"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="admin-file-type">
                                                            {material.fileType ||
                                                                "FILE"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatFileSize(
                                                            material.fileSize
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`admin-status-badge admin-status-${String(
                                                                material.status ||
                                                                "unknown"
                                                            ).toLowerCase()}`}
                                                        >
                                                            {material.status ||
                                                                "Unknown"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {material.createdAt
                                                            ? new Date(
                                                                material.createdAt
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
                                                        <button
                                                            type="button"
                                                            className="admin-delete-user-button"
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    material
                                                                )
                                                            }
                                                            aria-label={`Delete ${material.title}`}
                                                        >
                                                            {isDeleting ? (
                                                                <LoaderCircle
                                                                    size={
                                                                        17
                                                                    }
                                                                    className="admin-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            )}

                                                            {isDeleting
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
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


            {selectedMaterial && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
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
                        aria-labelledby="delete-material-title"
                    >
                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={
                                closeDeleteModal
                            }
                            disabled={
                                Boolean(
                                    deletingMaterialId
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

                        <h2 id="delete-material-title">
                            Delete material?
                        </h2>

                        <p>
                            Are you sure you want
                            to delete{" "}
                            <strong>
                                {
                                    selectedMaterial.title
                                }
                            </strong>
                            ?
                        </p>

                        <span className="admin-delete-warning">
                            The uploaded file, MCQs,
                            question-answer sets,
                            interview questions and
                            virtual interview records
                            associated with this
                            material will also be
                            permanently deleted.
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
                                        deletingMaterialId
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-confirm-delete-button"
                                onClick={
                                    handleDeleteMaterial
                                }
                                disabled={
                                    Boolean(
                                        deletingMaterialId
                                    )
                                }
                            >
                                {deletingMaterialId ? (
                                    <LoaderCircle
                                        size={18}
                                        className="admin-spin"
                                    />
                                ) : (
                                    <Trash2
                                        size={18}
                                    />
                                )}

                                {deletingMaterialId
                                    ? "Deleting..."
                                    : "Delete material"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};


export default AdminMaterials;