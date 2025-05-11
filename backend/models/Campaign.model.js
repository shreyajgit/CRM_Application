const mongoose = require("mongoose");

const SegmentRuleSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
      enum: [
        "equals",
        "not_equals",
        "greater_than",
        "less_than",
        "contains",
        "not_contains",
        "between",
        "in",
        "not_in",
      ],
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    logicalOperator: {
      type: String,
      enum: ["AND", "OR"],
      default: "AND",
    },
  },
  { _id: true }
);

const CampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    segment: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "failed"],
      default: "draft",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    description: { type: String, trim: true },
    segmentRules: { type: [SegmentRuleSchema], required: true },
    audienceSize: { type: Number, required: true },
    deliveryStats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    scheduledDate: { type: Date },
    tags: { type: [String], default: [] },
    aiGeneratedTags: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", CampaignSchema);
