import { connectDB } from "@/lib/mongodb";
import Word from "@/models/Word";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const words = await Word.find({ deckId: id }).sort({ createdAt: 1 });
  return Response.json(words);
}

interface ImportWord {
  term: string;
  meaning: string;
  example?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const { words }: { words: ImportWord[] } = await req.json();

  if (!Array.isArray(words) || !words.length) {
    return Response.json({ error: "Không có từ nào để lưu" }, { status: 400 });
  }

  const docs = words.map((w) => ({
    deckId: id,
    term: w.term,
    meaning: w.meaning,
    example: w.example || "",
    status: "new" as const,
  }));

  const result = await Word.insertMany(docs);
  return Response.json({ inserted: result.length });
}
