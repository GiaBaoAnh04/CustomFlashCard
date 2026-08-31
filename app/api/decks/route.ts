import { connectDB } from "@/lib/mongodb";
import Decks from "@/models/Decks";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const decks = await Decks.find({ userId: session.user.id }).sort({
    createdAt: -1,
  });
  return Response.json(decks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { name, language } = await req.json();
  if (!name || !language) {
    return Response.json({ error: "Thiếu tên hoặc ngôn ngữ" }, { status: 400 });
  }

  const deck = await Decks.create({
    name,
    language,
    userId: session.user.id,
  });
  return Response.json(deck);
}
