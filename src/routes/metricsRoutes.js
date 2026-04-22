const express = require("express");
const { getOpenAiUsage } = require("../controllers/metricsController");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/openai-usage", allowRoles("super-admin"), getOpenAiUsage);

module.exports = router;
