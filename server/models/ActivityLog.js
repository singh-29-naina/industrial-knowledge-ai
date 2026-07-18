import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["upload", "document", "user", "compliance", "system", "alert"],
      default: "document",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      default: "System",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional if system actions generate logs
    },
    metadata: {
      type: Object, // Stores flexible additional data (like file size, document ID, etc.)
      default: {},
    },
  },
  {
    timestamps: true, // Automatically creates and manages 'createdAt' and 'updatedAt' fields
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;