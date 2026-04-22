const AiSetting = require("../models/AiSetting");

async function getAiSettings(req, res) {
  let settings = await AiSetting.findOne().populate("updatedBy", "name email");

  if (!settings) {
    settings = await AiSetting.create({});
  }

  return res.json(settings);
}

async function updateAiSettings(req, res) {
  let settings = await AiSetting.findOne();

  if (!settings) {
    settings = new AiSetting();
  }

  Object.assign(settings, req.body, { updatedBy: req.user._id });
  await settings.save();

  return res.json(settings);
}

module.exports = {
  getAiSettings,
  updateAiSettings
};
