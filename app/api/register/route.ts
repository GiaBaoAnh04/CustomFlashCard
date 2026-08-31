import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await connectDB();
  const { username, password } = await req.json();

  if (!username || !password) {
    return Response.json(
      { error: "Thiếu tên đăng nhập hoặc mật khẩu" },
      { status: 400 }
    );
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return Response.json(
      { error: "Tên đăng nhập đã tồn tại" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash });

  return Response.json({ id: user._id, username: user.username });
}
