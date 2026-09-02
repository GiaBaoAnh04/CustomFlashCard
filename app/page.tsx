import Link from "next/link";
import { auth } from "@/auth";

const features = [
  {
    icon: "↻",
    title: "Flashcard",
    description: "Ôn tập chủ động, lật thẻ và nghe phát âm tự động.",
  },
  {
    icon: "✓",
    title: "Trắc nghiệm",
    description: "Kiểm tra khả năng ghi nhớ nghĩa qua các câu hỏi nhanh.",
  },
  {
    icon: "Aa",
    title: "Kiểm tra chính tả",
    description: "Nghe và gõ lại chính xác từ vựng đã học.",
  },
  {
    icon: "✍",
    title: "Chép phạt",
    description: "Luyện viết lặp lại để ghi nhớ từ khó lâu dài.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main className="min-h-screen bg-[#F7F7F5]">
      {/* Top bar */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-semibold text-white">
            Aa
          </div>
          <span className="text-sm font-semibold text-neutral-900">
            VocabDeck
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/decks"
              className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800"
            >
              Vào bộ từ vựng của tôi
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
          Học từ vựng đúng cách
        </p>

        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
          Tự tạo bộ từ vựng,
          <br />
          học theo cách của riêng bạn.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
          Import danh sách từ, nghĩa và ví dụ của riêng bạn — cho tiếng Anh,
          tiếng Hàn hay bất kỳ ngôn ngữ nào. Ôn tập bằng flashcard có giọng đọc,
          trắc nghiệm, kiểm tra chính tả và chép phạt.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isLoggedIn ? (
            <Link
              href="/decks"
              className="w-full rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md active:scale-[0.98] sm:w-auto"
            >
              Vào bộ từ vựng của tôi →
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md active:scale-[0.98] sm:w-auto"
              >
                Bắt đầu miễn phí →
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50 sm:w-auto"
              >
                Tôi đã có tài khoản
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white">
                {f.icon}
              </div>
              <h3 className="mt-5 text-sm font-semibold text-neutral-900">
                {f.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-neutral-500">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 text-center text-xs text-neutral-400">
        VocabDeck · Học từ vựng theo cách của bạn
      </footer>
    </main>
  );
}
