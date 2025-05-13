import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["test-invitation", "result", "announcement", "reminder"],
    default: "announcement",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recipients: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      read: {
        type: Boolean,
        default: false,
      },
      readAt: {
        type: Date,
      },
    },
  ],
  relatedTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
})

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema)
