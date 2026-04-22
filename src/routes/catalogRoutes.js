const express = require("express");
const {
  listCountries,
  createCountry,
  updateCountry,
  listPartners,
  createPartner,
  listInstitutions,
  createInstitution
} = require("../controllers/catalogController");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/countries", listCountries);
router.post("/countries", allowRoles("super-admin"), createCountry);
router.patch("/countries/:id", allowRoles("super-admin"), updateCountry);
router.get("/partners", listPartners);
router.post("/partners", allowRoles("super-admin"), createPartner);
router.get("/institutions", listInstitutions);
router.post("/institutions", allowRoles("super-admin"), createInstitution);

module.exports = router;
