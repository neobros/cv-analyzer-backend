const express = require("express");
const { getAiSettings, updateAiSettings } = require("../controllers/settingsController");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/ai", allowRoles("super-admin"), getAiSettings);
router.put("/ai", allowRoles("super-admin"), updateAiSettings);

module.exports = router;
