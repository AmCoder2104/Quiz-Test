import mongoose from "mongoose"

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a test title"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: [true, "Please provide a subject"],
    index: true,
  },
  duration: {
    type: Number, // in minutes
    required: [true, "Please provide test duration"],
    default: 30,
  },
  totalMarks: {
    type: Number,
    required: [true, "Please provide total marks"],
    default: 100,
  },
  passingMarks: {
    type: Number,
    required: [true, "Please provide passing marks"],
    default: 40,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  allowedAttempts: {
    type: Number,
    default: 1,
  },
  negativeMarking: {
    enabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  randomizeQuestions: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Test || mongoose.model("Test", TestSchema)
