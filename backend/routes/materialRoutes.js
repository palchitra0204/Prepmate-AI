const express = require("express");

const {
    uploadMaterial,
    getMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
} = require(
    "../controllers/materialController"
);

const {
    isAuthenticated,
} = require(
    "../middleware/authMiddleware"
);

const materialUpload = require(
    "../middleware/uploadMiddleware"
);

const router = express.Router();

/*
 * Material ki saari APIs protected hain.
 */
router.use(isAuthenticated);

/*
 * Material upload
 */
router.post(
    "/upload",
    materialUpload.single("file"),
    uploadMaterial
);

/*
 * Logged-in user ke materials
 */
router.get(
    "/",
    getMaterials
);

/*
 * Single material
 */
router.get(
    "/:id",
    getMaterialById
);

/*
 * Material update
 */
router.put(
    "/:id",
    updateMaterial
);

/*
 * Material delete
 */
router.delete(
    "/:id",
    deleteMaterial
);

module.exports = router;