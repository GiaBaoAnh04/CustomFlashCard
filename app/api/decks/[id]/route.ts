import { connectDB } from "@/lib/mongodb";
import Decks from "@/models/Decks";
import Word from "@/models/Word";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const deck = await Decks.findOne({ _id: id, userId: session.user.id });
  if (!deck) {
    return Response.json(
      { error: "Không tìm thấy bộ từ vựng" },
      { status: 404 }
    );
  }
  return Response.json(deck);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // chỉ cho xoá nếu deck thuộc về user đang đăng nhập
  const deck = await Decks.findOne({ _id: id, userId: session.user.id });
  if (!deck) {
    return Response.json(
      { error: "Không tìm thấy bộ từ vựng" },
      { status: 404 }
    );
  }

  // xoá toàn bộ từ vựng thuộc deck này trước, tránh dữ liệu mồ côi
  await Word.deleteMany({ deckId: id });
  await Decks.deleteOne({ _id: id });

  return Response.json({ deleted: true });
}
