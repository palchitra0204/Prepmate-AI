import {
  FileText,
  LoaderCircle,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

import "../styles/admin.css";

const AdminMaterials = () => {
  const [materials, setMaterials] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/admin/materials"
        );

        setMaterials(
          response.data?.materials || []
        );
      } catch (requestError) {
        console.error(
          "Admin Materials Error:",
          requestError.response?.data ||
            requestError.message
        );

        setError(
          requestError.response?.data
            ?.message ||
            "Unable to load materials"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const filteredMaterials =
    useMemo(() => {
      const searchValue = search
        .trim()
        .toLowerCase();

      if (!searchValue) {
        return materials;
      }

      return materials.filter(
        (material) => {
          return (
            material.title
              ?.toLowerCase()
              .includes(searchValue) ||
            material.originalFileName
              ?.toLowerCase()
              .includes(searchValue) ||
            material.fileName
              ?.toLowerCase()
              .includes(searchValue) ||
            material.fileType
              ?.toLowerCase()
              .includes(searchValue)
          );
        }
      );
    }, [materials, search]);

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

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">
              MATERIAL MANAGEMENT
            </p>

            <h1>Uploaded materials</h1>

            <span>
              View all study documents uploaded
              by PrepMate AI users.
            </span>
          </div>

          <div className="admin-ai-status">
            <FileText size={21} />

            <div>
              <span>Total materials</span>

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
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search materials..."
              aria-label="Search materials"
            />
          </div>

          <span>
            {filteredMaterials.length} materials
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

            <p>Loading materials...</p>
          </div>
        ) : !error &&
          filteredMaterials.length ===
            0 ? (
          <div className="admin-data-card">
            <div className="admin-empty-state">
              <FileText size={30} />

              <p>No materials found</p>
            </div>
          </div>
        ) : (
          !error && (
            <section className="admin-data-card">
              <div className="admin-table-wrapper">
                <table className="admin-table admin-large-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>File type</th>
                      <th>File size</th>
                      <th>Uploaded date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMaterials.map(
                      (material) => (
                        <tr
                          key={material._id}
                        >
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-material-icon">
                                <FileText
                                  size={19}
                                />
                              </div>

                              <div>
                                <strong>
                                  {material.title ||
                                    "Untitled material"}
                                </strong>

                                <span>
                                  {material.originalFileName ||
                                    material.fileName ||
                                    "Study document"}
                                </span>
                              </div>
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
                              material.fileSize ||
                                material.size
                            )}
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

export default AdminMaterials;