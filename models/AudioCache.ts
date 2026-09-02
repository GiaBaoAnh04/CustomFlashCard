// lib/models/AudioCache.ts
import { Schema, models, model } from "mongoose";

const AudioCacheSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    text: { type: String, required: true },
    language: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AudioCache || model("AudioCache", AudioCacheSchema);
