import { connectDB } from "@/lib/mongodb";
import Decks from "@/models/Decks";

export async function GET() {
  await connectDB();
  const decks = await Decks.find().sort({ createdAt: -1 });
  return Response.json(decks);
}

export async function POST(req: Request) {
  await connectDB();
  const { name, language } = await req.json();
  if (!name || !language) {
    return Response.json({ error: "Thiếu tên hoặc ngôn ngữ" }, { status: 400 });
  }
  const deck = await Decks.create({ name, language });
  return Response.json(deck);
}
