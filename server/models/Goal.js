import mongoose from "mongoose";

/**
 * Goal Schema - Defines the structure for goal documents in MongoDB
 *
 * Fields:
 * - userId: Reference to the user who created this goal
 * - title: Title of the goal
 * - description: Detailed description of the goal
 * - priority: Priority level (High, Medium, Low)
 * - status: Current status (active, completed, archived)
 * - targetDate: Target completion date (optional)
 * - declaration: Goal declaration and vision statement
 * - checkpoints: Array of milestones to track progress
 * - createdAt: Timestamp when the goal was created
 */
const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    targetDate: {
      type: Date,
    },
    declaration: {
      content: {
        type: String,
        default: "",
      },
      vision: {
        type: String,
        default: "",
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    checkpoints: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        targetDate: {
          type: Date,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "goals",
  }
);

// Create and export the Goal model
const Goal = mongoose.model("Goal", GoalSchema);
export default Goal;
