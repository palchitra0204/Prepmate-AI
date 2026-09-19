const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const helmet = require("helmet");

const {
    rateLimit,
} = require("express-rate-limit");

const authRoutes = require(
    "./routes/authRoutes"
);

const chatRoutes = require(
    "./routes/chatRoutes"
);

const userRoutes = require(
    "./routes/userRoutes"
);

const materialRoutes = require(
    "./routes/materialRoutes"
);

const preparationRoutes = require(
    "./routes/preparationRoutes"
);

const virtualInterviewRoutes = require(
    "./routes/virtualInterviewRoutes"
);

const adminRoutes = require(
    "./routes/adminRoutes"
);

const app = express();


/* =========================================================
   BASIC SECURITY
========================================================= */

app.disable("x-powered-by");

if (
    process.env.NODE_ENV ===
    "production"
) {
    /*
     * Required when the backend is deployed
     * behind Render, Railway, Nginx or another proxy.
     */
    app.set("trust proxy", 1);
}

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);


/* =========================================================
   CORS CONFIGURATION
========================================================= */

const configuredOrigins =
    process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

const allowedOrigins =
    configuredOrigins
        .split(",")
        .map(
            (origin) =>
                origin.trim()
        )
        .filter(Boolean);

const corsOptions = {
    origin: (
        requestOrigin,
        callback
    ) => {
        /*
         * Requests without Origin include:
         * Postman, backend services and mobile apps.
         */
        if (!requestOrigin) {
            return callback(
                null,
                true
            );
        }

        if (
            allowedOrigins.includes(
                requestOrigin
            )
        ) {
            return callback(
                null,
                true
            );
        }

        const corsError =
            new Error(
                "CORS_NOT_ALLOWED"
            );

        corsError.statusCode = 403;

        return callback(
            corsError
        );
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],

    optionsSuccessStatus: 204,
};

app.use(
    cors(corsOptions)
);


/* =========================================================
   REQUEST BODY
========================================================= */

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

app.use(
    cookieParser()
);


/* =========================================================
   HEALTH ROUTES
========================================================= */

app.get(
    "/",
    (req, res) => {
        return res
            .status(200)
            .json({
                success: true,

                message:
                    "PrepMate AI backend is running",
            });
    }
);

app.get(
    "/api/health",
    (req, res) => {
        return res
            .status(200)
            .json({
                success: true,

                message:
                    "Server is healthy",

                environment:
                    process.env.NODE_ENV ||
                    "development",

                timestamp:
                    new Date()
                        .toISOString(),
            });
    }
);


/* =========================================================
   RATE LIMITERS
========================================================= */

/*
 * General API protection.
 *
 * Every IP can make 300 API requests
 * within 15 minutes.
 */
const apiLimiter = rateLimit({
    windowMs:
        15 * 60 * 1000,

    limit: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,

        message:
            "Too many requests. Please try again after a few minutes.",
    },
});

/*
 * Stricter protection for routes that call
 * Gemini, Groq or other AI providers.
 */
const aiLimiter = rateLimit({
    windowMs:
        15 * 60 * 1000,

    limit: 60,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,

        message:
            "Too many AI requests. Please wait a few minutes and try again.",
    },
});

/*
 * Health route remains accessible.
 * All remaining /api routes are limited.
 */
app.use(
    "/api",
    apiLimiter
);


/* =========================================================
   API ROUTES
========================================================= */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/chats",
    aiLimiter,
    chatRoutes
);

app.use(
    "/api/materials",
    materialRoutes
);

app.use(
    "/api/preparations",
    aiLimiter,
    preparationRoutes
);

app.use(
    "/api/virtual-interviews",
    aiLimiter,
    virtualInterviewRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


/* =========================================================
   ROUTE NOT FOUND
========================================================= */

app.use(
    (req, res) => {
        return res
            .status(404)
            .json({
                success: false,

                message:
                    `Route not found: ${req.originalUrl}`,
            });
    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {
        if (res.headersSent) {
            return next(error);
        }

        if (
            process.env.NODE_ENV ===
            "production"
        ) {
            console.error(
                "Application Error:",
                error.message
            );
        } else {
            console.error(
                "Application Error:",
                error
            );
        }


        /* CORS error */

        if (
            error.message ===
            "CORS_NOT_ALLOWED"
        ) {
            return res
                .status(403)
                .json({
                    success: false,

                    message:
                        "This website is not allowed to access the API",
                });
        }


        /* Multer upload errors */

        if (
            error instanceof
            multer.MulterError
        ) {
            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "File is too large. Maximum size is 10 MB",
                    });
            }

            if (
                error.code ===
                "LIMIT_UNEXPECTED_FILE"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Unexpected file field",
                    });
            }

            return res
                .status(400)
                .json({
                    success: false,

                    message:
                        error.message,
                });
        }


        /* Unsupported file format */

        if (
            error.message ===
            "Only PDF, DOCX, TXT and PPTX files are allowed" ||
            error.message ===
            "Only PDF, DOC, DOCX, TXT and PPTX files are allowed"
        ) {
            return res
                .status(400)
                .json({
                    success: false,

                    message:
                        "Only PDF, DOCX, TXT and PPTX files are allowed",
                });
        }


        /* Express body size error */

        if (
            error.type ===
            "entity.too.large" ||
            error.status === 413
        ) {
            return res
                .status(413)
                .json({
                    success: false,

                    message:
                        "Request data is too large",
                });
        }


        /* Invalid JSON request */

        if (
            error instanceof
            SyntaxError &&
            error.status === 400 &&
            "body" in error
        ) {
            return res
                .status(400)
                .json({
                    success: false,

                    message:
                        "Invalid JSON data",
                });
        }


        /* Invalid MongoDB ID */

        if (
            error.name ===
            "CastError"
        ) {
            return res
                .status(400)
                .json({
                    success: false,

                    message:
                        "Invalid resource ID",
                });
        }


        /* Mongoose validation */

        if (
            error.name ===
            "ValidationError"
        ) {
            const message =
                Object.values(
                    error.errors
                )
                    .map(
                        (item) =>
                            item.message
                    )
                    .join(", ");

            return res
                .status(400)
                .json({
                    success: false,

                    message,
                });
        }


        /* Duplicate MongoDB value */

        if (
            error.code === 11000
        ) {
            const duplicateField =
                Object.keys(
                    error.keyPattern ||
                    error.keyValue ||
                    {}
                )[0];

            return res
                .status(409)
                .json({
                    success: false,

                    message:
                        duplicateField
                            ? `${duplicateField} already exists`
                            : "A record already exists with this value",
                });
        }


        /* Unknown errors */

        const statusCode =
            error.statusCode ||
            error.status ||
            500;

        const isServerError =
            statusCode >= 500;

        const message =
            process.env.NODE_ENV ===
                "production" &&
                isServerError
                ? "Internal Server Error"
                : error.message ||
                "Internal Server Error";

        return res
            .status(statusCode)
            .json({
                success: false,

                message,
            });
    }
);


module.exports = app;