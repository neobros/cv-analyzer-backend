const AiSetting = require("../models/AiSetting");
const Country = require("../models/Country");
const Institution = require("../models/Institution");
const { analyzeWithOpenAI } = require("./openAiAnalysis");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildProfileDetails(payload, countries) {
  return {
    personalInformation: {
      fullName: payload.studentName || "",
      email: payload.email || "",
      phone: "",
      countryOfOrigin: "",
      currentLocation: "",
      englishProficiency: payload.englishTestType
        ? `${payload.englishTestType}${payload.englishScore ? ` ${payload.englishScore}` : ""}`
        : payload.englishScore ? `Score ${payload.englishScore}` : "Pending formal score",
      maritalStatus: payload.maritalStatus || "",
      partnerAustralianStatus: payload.partnerAustralianStatus || ""
    },
    educationHistory: [],
    workExperience: [],
    technicalSkills: [],
    toolsAndSoftware: [],
    softSkills: [],
    languages: [],
    certifications: [],
    awards: [],
    studyPreferences: {
      preferredField: payload.targetStudyGoal || "",
      preferredLevel: payload.desiredDegree || "",
      studyMode: "full-time",
      preferredCountries: countries.map((country) => country.name)
    },
    financialProfile: payload.budget ? `Estimated annual budget: ${payload.budget}` : "",
    careerGoals: payload.targetStudyGoal || "",
    visaTravelHistory: ""
  };
}

function buildAssessment(payload, suitabilityScore, visaChance, countries, risks, profileSummary) {
  return {
    profileStrength: {
      score: suitabilityScore,
      label: suitabilityScore >= 80 ? "strong" : suitabilityScore >= 60 ? "moderate" : "weak",
      summary: profileSummary.join(" ")
    },
    readinessIndicators: {
      academic: payload.academicScore >= 70 ? "high" : payload.academicScore >= 55 ? "medium" : "low",
      english: payload.englishScore >= 6.5 ? "high" : payload.englishScore >= 5.5 ? "medium" : "low",
      financial: payload.budget >= 30000 ? "high" : payload.budget >= 15000 ? "medium" : "low",
      overall: suitabilityScore >= 75 ? "high" : suitabilityScore >= 55 ? "medium" : "low"
    },
    riskOverview: {
      financial: payload.budget >= 30000 ? "low" : "medium",
      academic: payload.academicScore >= 65 ? "low" : "medium",
      visa: visaChance === "high" ? "low" : "medium",
      english: payload.englishScore >= 6.5 ? "low" : "medium",
      overall: risks.length >= 4 ? "high" : risks.length >= 2 ? "medium" : "low",
      summary: risks.join(" ")
    },
    englishPath: {
      currentLevel: payload.englishScore ? `Current score ${payload.englishScore}` : "Formal score not provided",
      targetRequirement: "IELTS 6.0 to 6.5 or equivalent",
      timeline: "4 to 8 weeks preparation"
    },
    visaReadinessByCountry: countries.map((country) => ({
      countryName: country.name,
      status: visaChance === "high" ? "likely" : "possible",
      summary: risks.join(" "),
      concerns: risks
    }))
  };
}

function pickPrograms(payload, institution) {
  const degree = (payload.desiredDegree || "").toLowerCase();
  const programs = institution.availablePrograms || [];
  const matched = programs.filter((program) => program.toLowerCase().includes(degree));
  return (matched.length > 0 ? matched : programs).slice(0, 3);
}

function buildStrengths(payload, topRecommendation) {
  const strengths = [];

  if (payload.academicScore >= 75) strengths.push("Strong academic background for competitive admission review.");
  if (payload.englishScore >= 6.5) strengths.push("English profile supports direct-entry or smoother visa preparation.");
  if (payload.budget >= (topRecommendation ? topRecommendation.annualCost : 0)) strengths.push("Budget is aligned with the estimated first-year cost.");
  if (topRecommendation) strengths.push(`Clear partner-pathway match through ${topRecommendation.institution.partner.name}.`);

  return strengths.slice(0, 4);
}

function buildProfileSummary(payload) {
  const analysisText = [payload.cvText || "", payload.extractedCvText || ""].filter(Boolean).join("\n");
  const summary = [];

  if (payload.age > 0) {
    summary.push(`Age ${payload.age} is suitable for a student visa profile.`);
  }
  if (payload.academicScore >= 70) {
    summary.push("Academic background is above average for postgraduate admission review.");
  }
  if (analysisText.length > 120) {
    summary.push("CV shows practical project or work exposure that strengthens admission value.");
  }
  if (payload.desiredDegree === "master") {
    summary.push("Master's pathway is a natural next step for career progression.");
  }

  return summary.slice(0, 4);
}

function buildBestCourseOptions(payload) {
  const options = [];

  if (payload.desiredDegree === "master") {
    options.push("Master of Information Technology");
    options.push("Master of Computer Science");
    options.push("Master of Software Engineering");
  } else if (payload.desiredDegree === "bachelor") {
    options.push("Bachelor of Information Technology");
    options.push("Bachelor of Computer Science");
  } else {
    options.push(`Best-fit ${payload.desiredDegree} pathway`);
  }

  return options.slice(0, 3);
}

function buildRecommendationStrategy(recommendations) {
  if (recommendations.length === 0) {
    return [
      "Keep one safe institution option under the selected partner coverage.",
      "Improve the profile and widen partner-country filters before final application."
    ];
  }

  return recommendations.slice(0, 3).map((item, index) => {
    const level = index === 0 ? "safe" : index === 1 ? "medium" : "strong";
    return `Apply to ${item.institution.name} as a ${level} option under the selected route.`;
  });
}

function buildRisks(payload, topRecommendation) {
  const risks = [];

  if (payload.englishScore > 0 && payload.englishScore < 6) risks.push("English score may require retake, pathway, or extra language support.");
  if (payload.academicScore < 60) risks.push("Academic result may reduce eligibility for higher-ranked institutions.");
  if (topRecommendation && payload.budget > 0 && payload.budget < topRecommendation.annualCost) {
    risks.push("Budget is below the estimated first-year cost for the top recommendation.");
  }
  if (!topRecommendation) risks.push("No exact institution match was found under the selected country and partner filters.");

  return risks.slice(0, 4);
}

function buildNextActions(payload, topRecommendation) {
  const actions = [
    "Review transcript, graduation certificate, and passport copy before final submission."
  ];

  if (payload.englishScore < 6.5) {
    actions.push("Advise the student on IELTS, PTE, or equivalent score improvement options.");
  }

  if (topRecommendation) {
    actions.push(`Prepare application package for ${topRecommendation.institution.name}.`);
  }

  actions.push("Confirm financial documents for tuition and living-cost coverage.");

  return actions.slice(0, 4);
}

function buildSummary(payload, score, recommendations, provider) {
  const top = recommendations[0];
  const topName = top ? top.institution.name : "No partner institution";
  const costText = top ? ` Estimated first-year cost is about ${top.annualCost}.` : "";

  return `${payload.studentName} is suitable for ${payload.desiredDegree} pathways with a ${score}% profile score using ${provider}. Top match: ${topName}.${costText}`;
}

async function loadInstitutionsForAnalysis(payload) {
  const exactMatches = await Institution.find({
    country: { $in: payload.preferredCountries },
    partner: { $in: payload.targetPartners }
  })
    .populate("country")
    .populate("partner")
    .lean();

  if (exactMatches.length >= 5) {
    return exactMatches;
  }

  const countryMatches = await Institution.find({
    country: { $in: payload.preferredCountries }
  })
    .populate("country")
    .populate("partner")
    .lean();

  const merged = [...exactMatches];
  const seen = new Set(exactMatches.map((item) => String(item._id)));

  countryMatches.forEach((item) => {
    const id = String(item._id);
    if (!seen.has(id)) {
      merged.push(item);
      seen.add(id);
    }
  });

  return merged;
}

async function analyzeStudentProfile(payload) {
  const setting = (await AiSetting.findOne()) || {
    provider: "hybrid-score",
    scoringWeights: {
      academics: 40,
      english: 20,
      finance: 20,
      relevance: 20
    }
  };

  const institutions = await loadInstitutionsForAnalysis(payload);
  const countries = await Country.find({ _id: { $in: payload.preferredCountries } }).lean();

  const baseScore =
    (payload.academicScore / 100) * setting.scoringWeights.academics +
    (clamp(payload.englishScore, 0, 9) / 9) * setting.scoringWeights.english +
    (clamp(payload.budget, 0, 60000) / 60000) * setting.scoringWeights.finance +
    (payload.desiredDegree === "master" ? setting.scoringWeights.relevance : setting.scoringWeights.relevance * 0.8);

  const recommendations = institutions
    .map((institution) => {
      const affordabilityBonus = payload.budget >= institution.tuitionAnnual ? 12 : 4;
      const fitScore = Math.round(clamp(baseScore + affordabilityBonus - institution.minimumEnglishScore, 0, 99));
      const annualCost = institution.tuitionAnnual + institution.estimatedLivingCost;
      const matchingPrograms = pickPrograms(payload, institution);
      const intakeDetails = institution.country && institution.country.intakeSeasons && institution.country.intakeSeasons.length > 0
        ? `Typical intakes: ${institution.country.intakeSeasons.join(", ")}`
        : "Intake details available on request";
      const campusDetails = [
        institution.city ? `${institution.city} campus location` : null,
        institution.rankingBand ? `${institution.rankingBand} profile` : null,
        institution.campusHighlights && institution.campusHighlights.length > 0
          ? institution.campusHighlights.join(", ")
          : null
      ].filter(Boolean).join(" | ");

      const accommodationDetails = institution.accommodationRange
        || `Estimated living cost ${institution.estimatedLivingCost} per year.`;
      const workOpportunity = institution.workRightsNote
        || `Student can review part-time work options in ${institution.country.name}.`;
      const scholarshipNote = institution.scholarshipAvailable
        ? "Scholarship or bursary discussion is recommended during admission review."
        : "No scholarship preference is currently highlighted for this institution.";
      const isSelectedPartner = payload.targetPartners.some((partnerId) => String(partnerId) === String(institution.partner._id));
      const routeNote = isSelectedPartner
        ? `Matched under selected partner ${institution.partner.name}.`
        : `Added as a country-level alternative in ${institution.country.name} to widen suitable options.`;

      return {
        institution,
        fitScore,
        tuitionAnnual: institution.tuitionAnnual,
        livingCostAnnual: institution.estimatedLivingCost,
        annualCost,
        monthlyLivingCost: Math.round(institution.estimatedLivingCost / 12),
        intakeDetails,
        matchingPrograms,
        campusDetails,
        accommodationDetails,
        workOpportunity,
        scholarshipNote,
        reason: `Good fit for ${payload.desiredDegree}; ${institution.country.name} option through ${institution.partner.name}. ${routeNote}`
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 8);

  const suitabilityScore = recommendations[0]
    ? recommendations[0].fitScore
    : Math.round(clamp(baseScore, 0, 95));
  const topRecommendation = recommendations[0] || null;
  const strengths = buildStrengths(payload, topRecommendation);
  const profileSummary = buildProfileSummary(payload);
  const bestCourseOptions = buildBestCourseOptions(payload);
  const risks = buildRisks(payload, topRecommendation);
  const nextActions = buildNextActions(payload, topRecommendation);
  const recommendationStrategy = buildRecommendationStrategy(recommendations);

  return {
    aiProvider: setting.provider,
    aiUsage: {
      model: setting.model || process.env.OPENAI_MODEL || "",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0
    },
    suitabilityScore,
    visaChance: suitabilityScore >= 75 ? "high" : suitabilityScore >= 55 ? "medium" : "low",
    summary: buildSummary(payload, suitabilityScore, recommendations, setting.provider),
    profileSummary,
    bestCourseOptions,
    profileDetails: buildProfileDetails(payload, countries),
    assessment: buildAssessment(payload, suitabilityScore, suitabilityScore >= 75 ? "high" : suitabilityScore >= 55 ? "medium" : "low", countries, risks, profileSummary),
    strengths,
    risks,
    nextActions,
    recommendationStrategy,
    costBreakdown: {
      tuitionAnnual: topRecommendation ? topRecommendation.tuitionAnnual : 0,
      livingCostAnnual: topRecommendation ? topRecommendation.livingCostAnnual : 0,
      totalYearOne: topRecommendation ? topRecommendation.annualCost : 0
    },
    recommendedInstitutions: recommendations.map((item) => ({
      institution: item.institution._id,
      fitScore: item.fitScore,
      tuitionAnnual: item.tuitionAnnual,
      livingCostAnnual: item.livingCostAnnual,
      annualCost: item.annualCost,
      monthlyLivingCost: item.monthlyLivingCost,
      intakeDetails: item.intakeDetails,
      matchingPrograms: item.matchingPrograms,
      campusDetails: item.campusDetails,
      accommodationDetails: item.accommodationDetails,
      workOpportunity: item.workOpportunity,
      scholarshipNote: item.scholarshipNote,
      reason: item.reason
    }))
  };
}

async function analyzeStudentProfileWithProvider(payload) {
  const setting = (await AiSetting.findOne()) || {
    provider: process.env.AI_PROVIDER || "hybrid-score",
    model: process.env.OPENAI_MODEL || "gpt-4.1"
  };

  const countries = await Country.find({ _id: { $in: payload.preferredCountries } }).lean();
  const institutions = await loadInstitutionsForAnalysis(payload);

  if (setting.provider === "openai") {
    try {
      return await analyzeWithOpenAI({
        payload,
        countries: countries.map((country) => country.name),
        model: setting.model,
        provider: setting.provider
      });
    } catch (error) {
      console.error("OpenAI analysis failed, falling back to hybrid-score:", error.message);
    }
  }

  return analyzeStudentProfile(payload);
}

module.exports = {
  analyzeStudentProfile,
  analyzeStudentProfileWithProvider
};
