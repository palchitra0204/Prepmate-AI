const express = require("express");
const cors = require("cors");
const cookieParser = require(
    "cookie-parser"
);
const multer = require("multer");
const helmet = require("helmet");

const authRoutes = require(
    "./routes/authRoutes"
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

const adminRoutes = require(
    "./routes/adminRoutes"
);

const app = express();

/*
 * Express technology information
 * response header se remove karta hai.
 */
app.disable("x-powered-by");

/*
 * Security headers
 */
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

/*
 * Frontend ko backend APIs access
 * karne ki permission deta hai.
 */
app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",

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
    })
);

/*
 * JSON request body parser
 */
app.use(
    express.json({
        limit: "10mb",
    })
);

/*
 * Form-urlencoded body parser
 */
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

/*
 * Cookie parser ko routes se
 * pehle add karna hai.
 */
app.use(cookieParser());

/*
 * Backend status route
 */
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message:
            "PrepMate AI backend is running",
    });
});

/*
 * Health-check API
 */
app.get(
    "/api/health",
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Server is healthy",

            environment:
                process.env.NODE_ENV ||
                "development",

            timestamp:
                new Date().toISOString(),
        });
    }
);

/*
 * Application API routes
 *
 * Har route ko sirf ek baar
 * register karna hai.
 */
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/materials",
    materialRoutes
);

app.use(
    "/api/preparations",
    preparationRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

/*
 * Unknown API routes ke liye 404
 *
 * Is middleware ko saare valid
 * routes ke baad hona chahiye.
 */
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

/*
 * Global error handler
 *
 * Ye hamesha app.js ke end mein
 * hona chahiye.
 */
app.use(
    (error, req, res, next) => {
        console.error(
            "Application Error:",
            error
        );

        /*
         * Multer upload errors
         */
        if (
            error instanceof
            multer.MulterError
        ) {
            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "File is too large. Maximum size is 10 MB",
                });
            }

            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        /*
         * Unsupported upload format
         */
        if (
            error.message ===
            "Only PDF, DOC, DOCX and TXT files are allowed"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        /*
         * Invalid MongoDB ObjectId
         */
        if (
            error.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid resource ID",
            });
        }

        /*
         * Mongoose validation errors
         */
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

            return res.status(400).json({
                success: false,
                message,
            });
        }

        /*
         * MongoDB duplicate value
         */
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A record already exists with this value",
            });
        }

        /*
         * Default server error
         */
        return res
            .status(
                error.statusCode || 500
            )
            .json({
                success: false,

                message:
                    process.env.NODE_ENV ===
                        "production"
                        ? "Internal Server Error"
                        : error.message ||
                        "Internal Server Error",
            });
    }
);

module.exports = app;