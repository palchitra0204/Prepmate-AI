import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type":
            "application/json",
    },

    /*
     * Multi-Agent workflow ko
     * maximum 3 minutes milenge.
     */
    timeout: 180000,
});

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (
            error.code ===
            "ECONNABORTED"
        ) {
            error.message =
                "AI generation took too long. Please try again.";
        }

        if (
            error.response?.status === 401
        ) {
            const message =
                error.response?.data?.message
                    ?.toLowerCase() || "";

            const authenticationFailed =
                message.includes(
                    "invalid token"
                ) ||
                message.includes(
                    "token expired"
                ) ||
                message.includes(
                    "authentication required"
                );

            if (authenticationFailed) {
                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                if (
                    window.location.pathname !==
                    "/login"
                ) {
                    window.location.href =
                        "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;