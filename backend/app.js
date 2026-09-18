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

const virtualInterviewRoutes =
    require(
        "./routes/virtualInterviewRoutes"
    );

const adminRoutes = require(
    "./routes/adminRoutes"
);

const app = express();

app.disable("x-powered-by");

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

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

app.use(cookieParser());

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message:
            "PrepMate AI backend is running",
    });
});

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
    "/api/virtual-interviews",
    virtualInterviewRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message:
            `Route not found: ${req.originalUrl}`,
    });
});

app.use(
    (error, req, res, next) => {
        console.error(
            "Application Error:",
            error
        );

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

        if (
            error.message ===
            "Only PDF, DOC, DOCX, TXT and PPTX files are allowed"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (
            error.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid resource ID",
            });
        }

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

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A record already exists with this value",
            });
        }

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