const OpenAI = require("openai");

let client = null;
const MAX_CV_TEXT_LENGTH = 14000;
const MODEL_PRICING_USD_PER_MILLION = {
  "gpt-4.1": {
    input: 2,
    output: 8
  },
  "gpt-4.1-mini": {
    input: 0.4,
    output: 1.6
  },
  "gpt-4o": {
    input: 2.5,
    output: 10
  }
};

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}

function buildPrompt(payload, countries) {
  const cvNotes = safeString(payload.cvText);
  const extractedCvText = safeString(payload.extractedCvText);
  const truncatedCvText = extractedCvText.length > MAX_CV_TEXT_LENGTH
    ? `${extractedCvText.slice(0, MAX_CV_TEXT_LENGTH)}\n\n[CV text truncated for faster analysis]`
    : extractedCvText;

  return [
    "You are a senior student migration admissions analyst working for a professional student migration consultancy.",
    "Analyze the uploaded CV and student profile, then return only valid JSON.",
    "Your output must feel like a strong consultant-ready assessment, not a generic summary.",
    "Be practical, detailed, and decision-oriented.",
    "Focus on CV interpretation, admission fit, course matching, university selection, affordability, living cost, campus details, work options, visa readiness, and next actions.",
    "Use your broader knowledge of study destinations and realistic universities in the selected countries.",
    "Read the CV carefully and extract structured profile details from it. Do not ignore skills, work history, certifications, awards, or study intent if they appear in the CV.",
    "If the CV shows software engineering, backend, DevOps, microservices, AI, data, or similar skills, reflect them properly in technicalSkills, toolsAndSoftware, workExperience, and recommendations.",
    "Prefer specific and useful outputs over vague statements.",
    "",
    "Student profile:",
    JSON.stringify({
      studentName: payload.studentName,
      email: payload.email,
      age: payload.age,
      maritalStatus: payload.maritalStatus || "",
      partnerAustralianStatus: payload.partnerAustralianStatus || "",
      targetStudyGoal: payload.targetStudyGoal || "",
      desiredDegree: payload.desiredDegree,
      academicScore: payload.academicScore,
      englishTestType: payload.englishTestType || "",
      englishScore: payload.englishScore,
      budget: payload.budget,
      studentQuestion: payload.studentQuestion || "",
      selectedCountries: countries,
      cvNotes,
      extractedCvText: truncatedCvText,
      cvFileName: payload.cvFileName || ""
    }, null, 2),
    "",
    "Selected target countries:",
    JSON.stringify(countries, null, 2),
    "",
    "Analysis instructions:",
    "1. Infer a complete professional profile from the CV and submitted fields.",
    "2. Build a strong admissions-style summary that explains profile competitiveness.",
    "3. Extract clear technical skills and skill levels from the CV whenever possible.",
    "4. Extract work experience role by role, including responsibilities.",
    "5. Generate realistic course directions that fit both the CV and the selected countries.",
    "6. Recommend institutions from the selected countries only.",
    "7. Prefer 6 to 10 recommendations when realistic options exist.",
    "8. Include a mix of safer, balanced, and stronger options when appropriate.",
    "9. Cost estimates should be realistic annual estimates, not placeholders.",
    "10. Visa readiness must mention genuine concerns such as English scores, finances, gaps, or unclear progression if relevant.",
    "11. Consider marital status and whether the partner is an Australian citizen or PR holder when it is relevant to advice.",
    "12. Consider the student's own question and address it naturally in the analysis, next actions, and recommendations.",
    "13. If some details are missing, make a careful best-effort inference and keep the wording professional.",
    "",
    "Return JSON with this exact shape:",
    JSON.stringify({
      summary: "string",
      profileSummary: ["string"],
      bestCourseOptions: ["string"],
      profileDetails: {
        personalInformation: {
          fullName: "string",
          email: "string",
          phone: "string",
          countryOfOrigin: "string",
          currentLocation: "string",
          englishProficiency: "string",
          maritalStatus: "string",
          partnerAustralianStatus: "string"
        },
        educationHistory: [
          {
            institution: "string",
            program: "string",
            level: "bachelor",
            startYear: "string",
            endYear: "string",
            country: "string",
            honours: "string"
          }
        ],
        workExperience: [
          {
            title: "string",
            organization: "string",
            industry: "string",
            durationLabel: "string",
            isCurrent: false,
            responsibilities: ["string"]
          }
        ],
        technicalSkills: [
          {
            name: "string",
            level: "advanced"
          }
        ],
        toolsAndSoftware: [
          {
            name: "string",
            level: "intermediate"
          }
        ],
        softSkills: ["string"],
        languages: [
          {
            name: "string",
            level: "fluent"
          }
        ],
        certifications: [
          {
            name: "string",
            issuer: "string"
          }
        ],
        awards: ["string"],
        studyPreferences: {
          preferredField: "string",
          preferredLevel: "string",
          studyMode: "string",
          preferredCountries: ["string"]
        },
        financialProfile: "string",
        careerGoals: "string",
        visaTravelHistory: "string"
      },
      assessment: {
        profileStrength: {
          score: 0,
          label: "strong",
          summary: "string"
        },
        readinessIndicators: {
          academic: "high",
          english: "medium",
          financial: "medium",
          overall: "medium"
        },
        riskOverview: {
          financial: "medium",
          academic: "low",
          visa: "medium",
          english: "medium",
          overall: "medium",
          summary: "string"
        },
        englishPath: {
          currentLevel: "string",
          targetRequirement: "string",
          timeline: "string"
        },
        visaReadinessByCountry: [
          {
            countryName: "string",
            status: "likely",
            summary: "string",
            concerns: ["string"]
          }
        ]
      },
      suitabilityScore: 0,
      visaChance: "low",
      strengths: ["string"],
      risks: ["string"],
      nextActions: ["string"],
      recommendationStrategy: ["string"],
      costBreakdown: {
        tuitionAnnual: 0,
        livingCostAnnual: 0,
        totalYearOne: 0
      },
      recommendedInstitutions: [
        {
          institutionName: "string",
          institutionType: "university",
          countryName: "string",
          city: "string",
          rankingBand: "string",
          fitScore: 0,
          tuitionAnnual: 0,
          livingCostAnnual: 0,
          annualCost: 0,
          monthlyLivingCost: 0,
          intakeDetails: "string",
          matchingPrograms: ["string"],
          campusDetails: "string",
          accommodationDetails: "string",
          workOpportunity: "string",
          scholarshipNote: "string",
          reason: "string"
        }
      ]
    }, null, 2),
    "",
    "Rules:",
    "1. Recommend 6 to 10 realistic institutions when possible.",
    "2. Keep suitabilityScore and fitScore between 0 and 99.",
    "3. costBreakdown must be based on the top recommendation.",
    "4. If budget is weak, mention it clearly.",
    "5. Prefer 4 to 8 ranked recommendations when suitable matches exist.",
    "6. Recommend universities or colleges from the selected countries only.",
    "7. If no institution is suitable, return an empty recommendedInstitutions array but still give summary, risks, and nextActions.",
    "8. Populate profileDetails from the CV and student data. Do not leave technicalSkills empty if the CV contains skills.",
    "9. Use readiness/risk levels only from: low, medium, high.",
    "10. Use profileStrength.label only from: weak, moderate, strong.",
    "11. Use visaReadinessByCountry.status only from: unlikely, possible, likely.",
    "12. Keep each recommendation reason useful and specific to the student's background.",
    "13. Avoid generic filler such as 'good university' or 'good option' without explaining why.",
    "14. If the CV clearly indicates a field such as software engineering, ensure bestCourseOptions and recommendedInstitutions reflect that direction.",
    "15. If englishTestType or englishScore is provided, reflect it clearly in englishProficiency and readiness.",
    "16. Return JSON only. No markdown, no prose outside JSON."
  ].join("\n");
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function safeLevel(value, fallback = "medium") {
  const normalized = safeString(value).toLowerCase();
  return ["low", "medium", "high"].includes(normalized) ? normalized : fallback;
}

function safeStrengthLabel(value, fallback = "moderate") {
  const normalized = safeString(value).toLowerCase();
  return ["weak", "moderate", "strong"].includes(normalized) ? normalized : fallback;
}

function safeVisaStatus(value, fallback = "possible") {
  const normalized = safeString(value).toLowerCase();
  return ["unlikely", "possible", "likely"].includes(normalized) ? normalized : fallback;
}

function sanitizePersonalInformation(value, payload) {
  const data = safeObject(value);
  return {
    fullName: safeString(data.fullName, payload.studentName || ""),
    email: safeString(data.email, payload.email || ""),
    phone: safeString(data.phone),
    countryOfOrigin: safeString(data.countryOfOrigin),
    currentLocation: safeString(data.currentLocation),
    englishProficiency: safeString(data.englishProficiency),
    maritalStatus: safeString(data.maritalStatus, payload.maritalStatus || ""),
    partnerAustralianStatus: safeString(data.partnerAustralianStatus, payload.partnerAustralianStatus || "")
  };
}

function sanitizeEducationHistory(value) {
  return safeArray(value).map((item) => {
    const data = safeObject(item);
    return {
      institution: safeString(data.institution),
      program: safeString(data.program),
      level: safeString(data.level),
      startYear: safeString(data.startYear),
      endYear: safeString(data.endYear),
      country: safeString(data.country),
      honours: safeString(data.honours)
    };
  }).filter((item) => item.institution || item.program || item.level);
}

function sanitizeWorkExperience(value) {
  return safeArray(value).map((item) => {
    const data = safeObject(item);
    return {
      title: safeString(data.title),
      organization: safeString(data.organization),
      industry: safeString(data.industry),
      durationLabel: safeString(data.durationLabel),
      isCurrent: Boolean(data.isCurrent),
      responsibilities: safeArray(data.responsibilities).map((entry) => safeString(entry)).filter(Boolean)
    };
  }).filter((item) => item.title || item.organization);
}

function sanitizeSkillList(value) {
  return safeArray(value).map((item) => {
    if (typeof item === "string") {
      return {
        name: safeString(item),
        level: ""
      };
    }

    const data = safeObject(item);
    return {
      name: safeString(data.name),
      level: safeString(data.level)
    };
  }).filter((item) => item.name);
}

function sanitizeLanguages(value) {
  return safeArray(value).map((item) => {
    if (typeof item === "string") {
      return {
        name: safeString(item),
        level: ""
      };
    }

    const data = safeObject(item);
    return {
      name: safeString(data.name),
      level: safeString(data.level)
    };
  }).filter((item) => item.name);
}

function sanitizeCertifications(value) {
  return safeArray(value).map((item) => {
    if (typeof item === "string") {
      return {
        name: safeString(item),
        issuer: ""
      };
    }

    const data = safeObject(item);
    return {
      name: safeString(data.name),
      issuer: safeString(data.issuer)
    };
  }).filter((item) => item.name);
}

function sanitizeProfileDetails(value, payload, countries) {
  const data = safeObject(value);
  const studyPreferences = safeObject(data.studyPreferences);

  return {
    personalInformation: sanitizePersonalInformation(data.personalInformation, payload),
    educationHistory: sanitizeEducationHistory(data.educationHistory),
    workExperience: sanitizeWorkExperience(data.workExperience),
    technicalSkills: sanitizeSkillList(data.technicalSkills),
    toolsAndSoftware: sanitizeSkillList(data.toolsAndSoftware),
    softSkills: safeArray(data.softSkills).map((item) => safeString(item)).filter(Boolean),
    languages: sanitizeLanguages(data.languages),
    certifications: sanitizeCertifications(data.certifications),
    awards: safeArray(data.awards).map((item) => safeString(item)).filter(Boolean),
    studyPreferences: {
      preferredField: safeString(studyPreferences.preferredField),
      preferredLevel: safeString(studyPreferences.preferredLevel, payload.desiredDegree || ""),
      studyMode: safeString(studyPreferences.studyMode),
      preferredCountries: safeArray(studyPreferences.preferredCountries).map((item) => safeString(item)).filter(Boolean).length > 0
        ? safeArray(studyPreferences.preferredCountries).map((item) => safeString(item)).filter(Boolean)
        : countries
    },
    financialProfile: safeString(data.financialProfile),
    careerGoals: safeString(data.careerGoals, safeString(payload.targetStudyGoal)),
    visaTravelHistory: safeString(data.visaTravelHistory)
  };
}

function sanitizeAssessment(value, countries, suitabilityScore, visaChance) {
  const data = safeObject(value);
  const profileStrength = safeObject(data.profileStrength);
  const readinessIndicators = safeObject(data.readinessIndicators);
  const riskOverview = safeObject(data.riskOverview);
  const englishPath = safeObject(data.englishPath);
  const visaReadiness = safeArray(data.visaReadinessByCountry).map((item) => {
    const entry = safeObject(item);
    return {
      countryName: safeString(entry.countryName),
      status: safeVisaStatus(entry.status),
      summary: safeString(entry.summary),
      concerns: safeArray(entry.concerns).map((concern) => safeString(concern)).filter(Boolean)
    };
  }).filter((item) => item.countryName);

  return {
    profileStrength: {
      score: safeNumber(profileStrength.score, suitabilityScore),
      label: safeStrengthLabel(profileStrength.label, suitabilityScore >= 80 ? "strong" : "moderate"),
      summary: safeString(profileStrength.summary)
    },
    readinessIndicators: {
      academic: safeLevel(readinessIndicators.academic),
      english: safeLevel(readinessIndicators.english),
      financial: safeLevel(readinessIndicators.financial),
      overall: safeLevel(readinessIndicators.overall)
    },
    riskOverview: {
      financial: safeLevel(riskOverview.financial),
      academic: safeLevel(riskOverview.academic),
      visa: safeLevel(riskOverview.visa, visaChance === "high" ? "low" : "medium"),
      english: safeLevel(riskOverview.english),
      overall: safeLevel(riskOverview.overall),
      summary: safeString(riskOverview.summary)
    },
    englishPath: {
      currentLevel: safeString(englishPath.currentLevel),
      targetRequirement: safeString(englishPath.targetRequirement),
      timeline: safeString(englishPath.timeline)
    },
    visaReadinessByCountry: visaReadiness.length > 0
      ? visaReadiness
      : countries.map((countryName) => ({
        countryName,
        status: safeVisaStatus(visaChance === "high" ? "likely" : "possible"),
        summary: "",
        concerns: []
      }))
  };
}

function parseJsonResponse(rawText) {
  const cleaned = String(rawText || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function normalizeModelName(model) {
  return safeString(model).toLowerCase();
}

function getModelPricing(model) {
  const normalized = normalizeModelName(model);

  if (MODEL_PRICING_USD_PER_MILLION[normalized]) {
    return MODEL_PRICING_USD_PER_MILLION[normalized];
  }

  const matchedKey = Object.keys(MODEL_PRICING_USD_PER_MILLION).find((key) => normalized.startsWith(key));
  return matchedKey ? MODEL_PRICING_USD_PER_MILLION[matchedKey] : null;
}

function buildAiUsage(response, model) {
  const usage = safeObject(response && response.usage);
  const inputTokens = safeNumber(usage.input_tokens);
  const outputTokens = safeNumber(usage.output_tokens);
  const totalTokens = safeNumber(usage.total_tokens, inputTokens + outputTokens);
  const pricing = getModelPricing(model);
  const estimatedCostUsd = pricing
    ? Number((((inputTokens / 1000000) * pricing.input) + ((outputTokens / 1000000) * pricing.output)).toFixed(6))
    : 0;

  return {
    model: safeString(model),
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostUsd
  };
}

async function analyzeWithOpenAI({ payload, countries, model, provider }) {
  const startedAt = Date.now();
  const openai = getClient();
  const resolvedModel = model || process.env.OPENAI_MODEL || "gpt-4.1";

  if (!openai) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await openai.responses.create({
    model: resolvedModel,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are an expert education migration analyst. Return JSON only."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildPrompt(payload, countries)
          }
        ]
      }
    ]
  });

  const rawText = response.output_text || "";
  const parsed = parseJsonResponse(rawText);
  const recommendations = safeArray(parsed.recommendedInstitutions)
    .map((item) => {
      return {
        institutionName: item.institutionName || "",
        institutionType: item.institutionType || "university",
        countryName: item.countryName || "",
        city: item.city || "",
        rankingBand: item.rankingBand || "",
        source: "ai-generated",
        fitScore: safeNumber(item.fitScore),
        tuitionAnnual: safeNumber(item.tuitionAnnual),
        livingCostAnnual: safeNumber(item.livingCostAnnual),
        annualCost: safeNumber(item.annualCost),
        monthlyLivingCost: safeNumber(item.monthlyLivingCost),
        intakeDetails: item.intakeDetails || "",
        matchingPrograms: safeArray(item.matchingPrograms),
        campusDetails: item.campusDetails || "",
        accommodationDetails: item.accommodationDetails || "",
        workOpportunity: item.workOpportunity || "",
        scholarshipNote: item.scholarshipNote || "",
        reason: item.reason || ""
      };
    })
    .filter((item) => item.institutionName)
    .slice(0, 10);

  const top = recommendations[0];
  const suitabilityScore = safeNumber(parsed.suitabilityScore);
  const visaChance = ["low", "medium", "high"].includes(parsed.visaChance) ? parsed.visaChance : "medium";
  const profileDetails = sanitizeProfileDetails(parsed.profileDetails, payload, countries);
  const assessment = sanitizeAssessment(parsed.assessment, countries, suitabilityScore, visaChance);
  const aiUsage = buildAiUsage(response, resolvedModel);

  const result = {
    aiProvider: provider,
    aiUsage,
    summary: parsed.summary || "",
    profileSummary: safeArray(parsed.profileSummary),
    bestCourseOptions: safeArray(parsed.bestCourseOptions),
    profileDetails,
    assessment,
    suitabilityScore,
    visaChance,
    strengths: safeArray(parsed.strengths),
    risks: safeArray(parsed.risks),
    nextActions: safeArray(parsed.nextActions),
    recommendationStrategy: safeArray(parsed.recommendationStrategy),
    costBreakdown: {
      tuitionAnnual: safeNumber(parsed.costBreakdown && parsed.costBreakdown.tuitionAnnual, top ? top.tuitionAnnual : 0),
      livingCostAnnual: safeNumber(parsed.costBreakdown && parsed.costBreakdown.livingCostAnnual, top ? top.livingCostAnnual : 0),
      totalYearOne: safeNumber(parsed.costBreakdown && parsed.costBreakdown.totalYearOne, top ? top.annualCost : 0)
    },
    recommendedInstitutions: recommendations
  };

  console.info(
    `[analysis] OpenAI ${resolvedModel} completed in ${Date.now() - startedAt}ms with ${recommendations.length} recommendations, ${aiUsage.totalTokens} tokens, estimated $${aiUsage.estimatedCostUsd}`
  );

  return result;
}

module.exports = {
  analyzeWithOpenAI
};
