import mongoose, { Schema, models, model } from "mongoose";

export interface IDeck {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  language: "en" | "ko" | "zh";
  createdAt: Date;
}

const DeckSchema = new Schema<IDeck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    language: { type: String, enum: ["en", "ko", "zh"], required: true },
  },
  { timestamps: true }
);

export default models.Deck || model<IDeck>("Deck", DeckSchema);
