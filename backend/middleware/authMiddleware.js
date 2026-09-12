const jwt = require("jsonwebtoken");

const User = require("../models/User");

const isAuthenticated = async (
    req,
    res,
    next
) => {
    try {
        const authorizationHeader =
            req.headers.authorization;

        let token = null;

        if (
            authorizationHeader &&
            authorizationHeader.startsWith(
                "Bearer "
            )
        ) {
            token =
                authorizationHeader.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required. Please login first",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message:
                    "JWT secret is not configured",
            });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decodedToken.id
        ).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "User associated with this token no longer exists",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error(
            "Authentication Error:",
            error.message
        );

        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Token expired. Please login again",
            });
        }

        if (
            error.name ===
            "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid token. Please login again",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Authentication failed",
        });
    }
};

const authorizeRoles = (
    ...allowedRoles
) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }

        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    `Role ${req.user.role} is not allowed to access this resource`,
            });
        }

        next();
    };
};

module.exports = {
    isAuthenticated,
    authorizeRoles,
};