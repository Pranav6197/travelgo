import { Schema, model } from "mongoose";

const imageAssetSchema = new Schema(
  {
    originalUrl: { type: String, required: true },
    originalKey: { type: String },
    processedUrl: { type: String, default: null },
    processedKey: { type: String, default: null },
    processedContentType: { type: String, default: null },
    imageStatus: {
      type: String,
      enum: ["READY", "PROCESSING", "FAILED"],
      default: "READY",
    },
    enhancementRequested: { type: Boolean, default: false },
    processedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
  },
  { _id: true },
);

const postSchema = new Schema({
  authorName: String,
  title: String,
  imageLink: String, // Deprecated, use images instead
  images: [String], // Array of image URLs
  // Per-image S3 state. `imageLink` and `images` remain for existing clients.
  imageAssets: { type: [imageAssetSchema], default: [] },
  categories: [String],
  description: String,
  isFeaturedPost: Boolean,
  timeOfPost: { type: Date, default: Date.now },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model("Post", postSchema);
