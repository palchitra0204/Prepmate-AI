const express = require("express");

const {
    getAdminDashboard,
    getAllUsers,
    getAllMaterials,
    getAllPreparations,
} = require(
    "../controllers/adminController"
);

const {
    isAuthenticated,
    authorizeRoles,
} = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

/*
 * Pehle login authentication.
 */
router.use(isAuthenticated);

/*
 * Uske baad Admin role check.
 */
router.use(
    authorizeRoles("Admin")
);

router.get(
    "/dashboard",
    getAdminDashboard
);

router.get(
    "/users",
    getAllUsers
);

router.get(
    "/materials",
    getAllMaterials
);

router.get(
    "/preparations",
    getAllPreparations
);

module.exports = router;