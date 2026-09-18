const express = require("express");

const {
    getAdminDashboard,
    getAllUsers,
    deleteUser,
    getAllMaterials,
    deleteAdminMaterial,
    getAllPreparations,
    getAllGenerations,
    deleteAdminGeneration,
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


/* =========================================================
   ADMIN AUTHENTICATION AND AUTHORIZATION
========================================================= */

router.use(isAuthenticated);

router.use(
    authorizeRoles("Admin")
);


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

router.get(
    "/dashboard",
    getAdminDashboard
);


/* =========================================================
   USER MANAGEMENT
========================================================= */

router.get(
    "/users",
    getAllUsers
);

router.delete(
    "/users/:id",
    deleteUser
);


/* =========================================================
   MATERIAL MANAGEMENT
========================================================= */

router.get(
    "/materials",
    getAllMaterials
);

router.delete(
    "/materials/:id",
    deleteAdminMaterial
);


/* =========================================================
   AI GENERATION MANAGEMENT
========================================================= */

router.get(
    "/generations",
    getAllGenerations
);

router.delete(
    "/generations/:generationType/:id",
    deleteAdminGeneration
);


/* =========================================================
   PREPARATION COMPATIBILITY ROUTE
========================================================= */

/*
 * Purane frontend clients ke liye
 * compatibility route.
 */

router.get(
    "/preparations",
    getAllPreparations
);


module.exports = router;