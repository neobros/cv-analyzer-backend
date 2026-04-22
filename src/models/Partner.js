const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["university", "college", "language-school", "pathway-provider"],
      required: true
    },
    countries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country"
      }
    ],
    contactEmail: String,
    applicationFee: {
      type: Number,
      default: 0
    },
    tuitionFrom: Number,
    tuitionTo: Number,
    commissionRate: Number,
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Partner", partnerSchema);
