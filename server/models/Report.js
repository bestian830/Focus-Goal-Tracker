const mongoose = require("mongoose");

/**
 * Report Schema - Defines the structure for AI-generated reports in MongoDB
 * 
 * Fields:
 * - goalId: Reference to the goal this report is about
 * - userId: Reference to the user who owns this report
 * - type: Type of report (weekly, monthly)
 * - period: Time period the report covers
 * - content: Main report content
 * - insights: AI-generated insights
 * - recommendations: AI-generated recommendations
 * - createdAt: Timestamp when the report was created
 */
const ReportSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["weekly", "monthly", "custom"],
    default: "weekly"
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  content: {
    type: String,
    required: true
  },
  insights: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  metrics: {
    totalDuration: {
      type: Number,
      default: 0
    },
    completedCheckpoints: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    }
  },
  isGenerated: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Report model
module.exports = mongoose.model("Report", ReportSchema); 