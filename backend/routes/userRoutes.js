const express = require("express");

const {
    getProfile,
    updateProfile,
    changePassword,
} = require(
    "../controllers/userController"
);

const {
    isAuthenticated,
} = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

/*
 * User ki saari APIs protected hain.
 */
router.use(isAuthenticated);

router.get(
    "/profile",
    getProfile
);

router.patch(
    "/profile",
    updateProfile
);

router.patch(
    "/change-password",
    changePassword
);

module.exports = router;