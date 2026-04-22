const Analysis = require("../models/Analysis");
const { analyzeStudentProfileWithProvider } = require("../services/analysisEngine");
const { extractCvText } = require("../services/cvTextExtractor");

function normalizeIdList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch (error) {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

async function listAnalyses(req, res) {
  const analyses = await Analysis.find()
    .populate("preferredCountries targetPartners createdBy reviewedBy", "name email")
    .populate({
      path: "recommendedInstitutions.institution",
      populate: ["country", "partner"]
    })
    .sort({ createdAt: -1 });

  return res.json(analyses);
}

async function getAnalysis(req, res) {
  const analysis = await Analysis.findById(req.params.id)
    .populate("preferredCountries targetPartners createdBy reviewedBy", "name email")
    .populate({
      path: "recommendedInstitutions.institution",
      populate: ["country", "partner"]
    });

  if (!analysis) {
    return res.status(404).json({ message: "Analysis not found" });
  }

  return res.json(analysis);
}

async function createAnalysis(req, res) {
  const startedAt = Date.now();
  const extractStartedAt = Date.now();
  const extractedCvText = await extractCvText(req.file);
  const extractDuration = Date.now() - extractStartedAt;

  const payload = {
    ...req.body,
    age: Number(req.body.age || 0),
    academicScore: Number(req.body.academicScore || 0),
    englishScore: Number(req.body.englishScore || 0),
    budget: Number(req.body.budget || 0),
    preferredCountries: normalizeIdList(req.body.preferredCountries),
    targetPartners: normalizeIdList(req.body.targetPartners),
    cvText: String(req.body.cvText || "").trim(),
    extractedCvText,
    createdBy: req.user._id,
    cvFileName: req.file ? req.file.originalname : undefined
  };

  const aiStartedAt = Date.now();
  const aiResult = await analyzeStudentProfileWithProvider(payload);
  const aiDuration = Date.now() - aiStartedAt;

  const dbStartedAt = Date.now();
  const analysis = await Analysis.create({
    ...payload,
    ...aiResult,
    analysisStatus: "analyzed"
  });

  const populated = await Analysis.findById(analysis._id).populate({
    path: "recommendedInstitutions.institution",
    populate: ["country", "partner"]
  });
  const dbDuration = Date.now() - dbStartedAt;

  console.info(
    `[analysis] created analysis ${analysis._id} in ${Date.now() - startedAt}ms (extract=${extractDuration}ms, ai=${aiDuration}ms, db=${dbDuration}ms)`
  );

  return res.status(201).json(populated);
}

async function reviewAnalysis(req, res) {
  const analysis = await Analysis.findById(req.params.id);

  if (!analysis) {
    return res.status(404).json({ message: "Analysis not found" });
  }

  analysis.analysisStatus = "reviewed";
  analysis.reviewedBy = req.user._id;
  analysis.summary = req.body.summary || analysis.summary;
  await analysis.save();

  return res.json(analysis);
}

module.exports = {
  listAnalyses,
  getAnalysis,
  createAnalysis,
  reviewAnalysis
};
