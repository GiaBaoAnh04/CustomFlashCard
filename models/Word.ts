import { Schema, models, model, Types } from "mongoose";

export interface IWord {
  _id: string;
  deckId: Types.ObjectId;
  term: string;
  meaning: string;
  example: string;
  status: "new" | "review" | "known";
}

const WordSchema = new Schema<IWord>(
  {
    deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    term: { type: String, required: true },
    meaning: { type: String, required: true },
    example: { type: String, default: "" },
    status: { type: String, enum: ["new", "review", "known"], default: "new" },
  },
  { timestamps: true }
);

export default models.Word || model<IWord>("Word", WordSchema);
