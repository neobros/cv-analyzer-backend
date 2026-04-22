const Country = require("../models/Country");
const Partner = require("../models/Partner");
const Institution = require("../models/Institution");

async function listCountries(req, res) {
  return res.json(await Country.find().sort({ name: 1 }));
}

async function createCountry(req, res) {
  return res.status(201).json(await Country.create(req.body));
}

async function updateCountry(req, res) {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!country) {
    return res.status(404).json({ message: "Country not found" });
  }

  return res.json(country);
}

async function listPartners(req, res) {
  return res.json(await Partner.find().populate("countries", "name"));
}

async function createPartner(req, res) {
  return res.status(201).json(await Partner.create(req.body));
}

async function listInstitutions(req, res) {
  return res.json(await Institution.find().populate("country partner", "name"));
}

async function createInstitution(req, res) {
  return res.status(201).json(await Institution.create(req.body));
}

module.exports = {
  listCountries,
  createCountry,
  updateCountry,
  listPartners,
  createPartner,
  listInstitutions,
  createInstitution
};
