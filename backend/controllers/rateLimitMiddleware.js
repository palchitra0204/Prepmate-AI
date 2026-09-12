const rateLimit = require(
    "express-rate-limit"
);

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 50,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many authentication attempts. Please try again later",
    },
});

const generationRateLimiter = rateLimit({
    windowMs: 60 * 1000,

    limit: 30,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many generation requests. Please wait and try again",
    },
});

module.exports = {
    authRateLimiter,
    generationRateLimiter,
};