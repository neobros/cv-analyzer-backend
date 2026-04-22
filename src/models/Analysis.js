const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution"
    },
    institutionName: String,
    institutionType: String,
    countryName: String,
    city: String,
    partnerName: String,
    rankingBand: String,
    source: {
      type: String,
      default: "database"
    },
    fitScore: Number,
    tuitionAnnual: Number,
    livingCostAnnual: Number,
    annualCost: Number,
    monthlyLivingCost: Number,
    intakeDetails: String,
    matchingPrograms: [String],
    campusDetails: String,
    accommodationDetails: String,
    workOpportunity: String,
    scholarshipNote: String,
    reason: String
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      default: 0
    },
    maritalStatus: {
      type: String,
      trim: true
    },
    partnerAustralianStatus: {
      type: String,
      trim: true
    },
    targetStudyGoal: {
      type: String,
      trim: true
    },
    desiredDegree: {
      type: String,
      enum: ["diploma", "bachelor", "master", "phd", "other"],
      required: true
    },
    academicScore: {
      type: Number,
      required: true
    },
    englishScore: {
      type: Number,
      default: 0
    },
    englishTestType: {
      type: String,
      trim: true
    },
    budget: {
      type: Number,
      default: 0
    },
    studentQuestion: {
      type: String,
      trim: true
    },
    preferredCountries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country"
      }
    ],
    targetPartners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner"
      }
    ],
    cvText: String,
    extractedCvText: String,
    cvFileName: String,
    analysisStatus: {
      type: String,
      enum: ["pending", "analyzed", "reviewed"],
      default: "pending"
    },
    summary: String,
    profileSummary: [String],
    bestCourseOptions: [String],
    profileDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    assessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    recommendationStrategy: [String],
    strengths: [String],
    risks: [String],
    nextActions: [String],
    costBreakdown: {
      tuitionAnnual: {
        type: Number,
        default: 0
      },
      livingCostAnnual: {
        type: Number,
        default: 0
      },
      totalYearOne: {
        type: Number,
        default: 0
      }
    },
    suitabilityScore: {
      type: Number,
      default: 0
    },
    visaChance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    aiProvider: String,
    aiUsage: {
      model: String,
      inputTokens: {
        type: Number,
        default: 0
      },
      outputTokens: {
        type: Number,
        default: 0
      },
      totalTokens: {
        type: Number,
        default: 0
      },
      estimatedCostUsd: {
        type: Number,
        default: 0
      }
    },
    recommendedInstitutions: [recommendationSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);
