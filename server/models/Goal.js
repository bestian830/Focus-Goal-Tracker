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
 * - motivation: Why the goal is important (moved from details)
 * - targetDate: Target completion date
 * - visionImageUrl: URL to an image related to the goal
 * - resources: Array of resources that can help achieve the goal (optional)
 * - dailyTasks: Array of daily tasks related to the goal (optional)
 * - rewards: Array of rewards for achieving progress or completion (optional)
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
      index: true  // 普通非唯一索引
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
    motivation: {
      type: String,
      maxlength: 500,
    },
    targetDate: {
      type: Date,
    },
    visionImageUrl: {
      type: String,
      default: null,
    },
    resources: {
      type: [String], // 改为字符串数组
      default: [],
    },
    dailyTasks: {
      type: [String], // 改为字符串数组
      default: [],
    },
    rewards: {
      type: [String], // 改为字符串数组
      default: [],
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
        taskCompletions: {
          type: Object,
          default: {}
        },
        records: [
          {
            content: {
              type: String,
              required: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            }
          }
        ],
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
