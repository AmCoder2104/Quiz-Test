import mongoose from "mongoose"

// Define the Question schema
const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Please provide a question"],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, "Please provide options"],
      validate: {
        validator: (v) => {
          return Array.isArray(v) && v.length >= 2 // At least 2 options required
        },
        message: "A question must have at least 2 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Please provide the correct answer index"],
      min: 0,
      validate: {
        validator: function (v) {
          return v < this.options.length // Correct answer must be a valid index
        },
        message: "Correct answer index must be valid",
      },
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      enum: [
        "mobile-development",
        "web-development",
        "graphic-design",
        "video-editing",
        "digital-marketing",
        "data-science",
      ],
      index: true, // Add index for faster queries
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    marks: {
      type: Number,
      default: 1,
    },
    explanation: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    successRate: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
)

// Use existing model if it exists, otherwise create a new one
export default mongoose.models.Question || mongoose.model("Question", QuestionSchema)
