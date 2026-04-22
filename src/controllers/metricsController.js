const { getOpenAiUsageMetrics } = require("../services/openAiUsageService");

async function getOpenAiUsage(req, res) {
  const days = Number(req.query.days || 30);
  const projectId = req.query.projectId || "";
  const metrics = await getOpenAiUsageMetrics({ days, projectId });

  return res.json(metrics);
}

module.exports = {
  getOpenAiUsage
};
