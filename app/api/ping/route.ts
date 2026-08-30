import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: "connected" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ status: "error", message }, { status: 500 });
  }
}
