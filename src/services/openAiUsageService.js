const DAY_IN_SECONDS = 24 * 60 * 60;

function getAdminApiKey() {
  return process.env.OPENAI_ADMIN_API_KEY || process.env.OPENAI_API_KEY || "";
}

function toUnixSeconds(value) {
  return Math.floor(value.getTime() / 1000);
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildHeaders() {
  const apiKey = getAdminApiKey();

  if (!apiKey) {
    throw new Error("OPENAI_ADMIN_API_KEY is missing");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

async function fetchOpenAiResource(path, params) {
  const url = new URL(`https://api.openai.com${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI usage request failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

function flattenBucketResults(payload) {
  return safeArray(payload && payload.data).flatMap((bucket) => safeArray(bucket.results).map((result) => ({
    ...result,
    start_time: bucket.start_time,
    end_time: bucket.end_time
  })));
}

function sumCostResults(results) {
  return results.reduce((sum, item) => sum + safeNumber(item.amount && item.amount.value), 0);
}

function sumUsageResults(results, field) {
  return results.reduce((sum, item) => sum + safeNumber(item[field]), 0);
}

async function getOpenAiUsageMetrics({ days = 30, projectId = "" } = {}) {
  const normalizedDays = Math.max(1, Math.min(90, safeNumber(days) || 30));
  const endTime = toUnixSeconds(new Date());
  const startTime = endTime - (normalizedDays * DAY_IN_SECONDS);
  const params = {
    start_time: startTime,
    end_time: endTime,
    bucket_width: "1d"
  };

  if (projectId) {
    params.project_ids = projectId;
  } else if (process.env.OPENAI_PROJECT_ID) {
    params.project_ids = process.env.OPENAI_PROJECT_ID;
  }

  const [costPayload, completionsPayload] = await Promise.all([
    fetchOpenAiResource("/v1/organization/costs", params),
    fetchOpenAiResource("/v1/organization/usage/completions", params)
  ]);

  const costResults = flattenBucketResults(costPayload);
  const usageResults = flattenBucketResults(completionsPayload);

  return {
    range: {
      days: normalizedDays,
      startTime,
      endTime
    },
    filters: {
      projectId: params.project_ids || ""
    },
    totals: {
      costUsd: Number(sumCostResults(costResults).toFixed(6)),
      inputTokens: sumUsageResults(usageResults, "input_tokens"),
      outputTokens: sumUsageResults(usageResults, "output_tokens"),
      modelRequests: sumUsageResults(usageResults, "num_model_requests")
    },
    series: {
      costs: safeArray(costPayload && costPayload.data).map((bucket) => ({
        startTime: bucket.start_time,
        endTime: bucket.end_time,
        amountUsd: Number(sumCostResults(safeArray(bucket.results)).toFixed(6))
      })),
      completions: safeArray(completionsPayload && completionsPayload.data).map((bucket) => ({
        startTime: bucket.start_time,
        endTime: bucket.end_time,
        inputTokens: sumUsageResults(safeArray(bucket.results), "input_tokens"),
        outputTokens: sumUsageResults(safeArray(bucket.results), "output_tokens"),
        modelRequests: sumUsageResults(safeArray(bucket.results), "num_model_requests")
      }))
    }
  };
}

module.exports = {
  getOpenAiUsageMetrics
};
