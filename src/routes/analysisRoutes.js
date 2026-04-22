const express = require("express");
const multer = require("multer");
const { listAnalyses, getAnalysis, createAnalysis, reviewAnalysis } = require("../controllers/analysisController");
const { protect, allowRoles } = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);
router.get("/", listAnalyses);
router.get("/:id", getAnalysis);
router.post("/", allowRoles("super-admin", "worker"), upload.single("cv"), createAnalysis);
router.patch("/:id/review", allowRoles("super-admin"), reviewAnalysis);

module.exports = router;
