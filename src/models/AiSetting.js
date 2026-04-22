const mongoose = require("mongoose");

const aiSettingSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["hybrid-score", "openai", "manual-review"],
      default: "hybrid-score"
    },
    model: {
      type: String,
      default: "gpt-4.1"
    },
    scoringWeights: {
      academics: { type: Number, default: 40 },
      english: { type: Number, default: 20 },
      finance: { type: Number, default: 20 },
      relevance: { type: Number, default: 20 }
    },
    prompts: {
      cvAnalysis: {
        type: String,
        default: "Analyze student CVs for migration-study opportunities with fit score, costs, campus details, risks, and next actions."
      }
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AiSetting", aiSettingSchema);
