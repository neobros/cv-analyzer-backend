const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    currency: {
      type: String,
      required: true,
      trim: true
    },
    visaProcessingDays: {
      type: Number,
      default: 30
    },
    intakeSeasons: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Country", countrySchema);
