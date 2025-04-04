import mongoose from "mongoose";

/**
 * Goal Schema - Defines the structure for goal documents in MongoDB
 *
 * Fields:
 * - userId: ID of the user who created this goal (ObjectId or tempId)
 * - title: Title of the goal
 * - description: Detailed description of the goal
 * - priority: Priority level (High, Medium, Low)
 * - status: Current status (active, completed, archived)
 * - targetDate: Target completion date (optional)
 * - details: Detailed goal information (motivation, resources, rewards, etc.)
 * - currentSettings: Current daily task and reward settings
 * - dailyCards: Array of daily task/reward snapshots
 * - declaration: Goal declaration and vision statement
 * - checkpoints: Array of milestones to track progress
 * - createdAt: Timestamp when the goal was created
 */
const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: String,  // 使用String类型存储用户ID (ObjectId或tempId)
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "High",
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    targetDate: {
      type: Date,
    },
    details: {
      motivation: {
        type: String,
        maxlength: 500,
      },
      resources: {
        type: String,
        maxlength: 500,
      },
      nextStep: {
        type: String,
        maxlength: 200,
      },
      visionImage: {
        type: String, // Cloudinary URL
      },
      dailyReward: {
        type: String,
        maxlength: 200,
      },
      ultimateReward: {
        type: String,
        maxlength: 200,
      },
    },
    currentSettings: {
      dailyTask: {
        type: String,
        maxlength: 200,
      },
      dailyReward: {
        type: String,
        maxlength: 200,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    dailyCards: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        dailyTask: {
          type: String,
        },
        dailyReward: {
          type: String,
        },
        completed: {
          dailyTask: {
            type: Boolean,
            default: false,
          },
          dailyReward: {
            type: Boolean,
            default: false,
          },
        },
        links: [
          {
            url: {
              type: String,
              required: true,
            },
            description: {
              type: String,
              default: "",
            },
          },
        ],
      },
    ],
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
        isDaily: {
          type: Boolean,
          default: false,
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
