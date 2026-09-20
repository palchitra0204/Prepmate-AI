import axios from "axios";


const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    /*
     * Multi-Agent workflow ko
     * maximum 3 minutes milenge.
     */
    timeout: 180000,
});


/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(
            error
        );
    }
);


/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

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
            error.response?.status ===
            401
        ) {
            const message =
                String(
                    error.response?.data
                        ?.message || ""
                ).toLowerCase();

            const authenticationFailed =
                message.includes(
                    "invalid token"
                ) ||
                message.includes(
                    "token expired"
                ) ||
                message.includes(
                    "authentication required"
                ) ||
                message.includes(
                    "not authorized"
                );

            if (
                authenticationFailed
            ) {
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
                    window.location.replace(
                        "/login"
                    );
                }
            }
        }

        return Promise.reject(
            error
        );
    }
);


export default api;