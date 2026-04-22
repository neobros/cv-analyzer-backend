const express = require("express");
const { listUsers, createUser, updateUser } = require("../controllers/userController");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", allowRoles("super-admin"), listUsers);
router.post("/", allowRoles("super-admin"), createUser);
router.patch("/:id", allowRoles("super-admin"), updateUser);

module.exports = router;
