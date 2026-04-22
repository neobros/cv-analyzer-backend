const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["university", "college"],
      required: true
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true
    },
    rankingBand: {
      type: String,
      default: "Top 500"
    },
    tuitionAnnual: {
      type: Number,
      required: true
    },
    estimatedLivingCost: {
      type: Number,
      required: true
    },
    city: {
      type: String,
      default: ""
    },
    campusHighlights: [String],
    accommodationRange: {
      type: String,
      default: ""
    },
    workRightsNote: {
      type: String,
      default: ""
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false
    },
    availablePrograms: [String],
    minimumEnglishScore: {
      type: Number,
      default: 6
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Institution", institutionSchema);
