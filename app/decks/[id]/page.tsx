import Link from "next/link";

export default async function DeckHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const modes = [
    {
      href: `/decks/${id}/import`,
      icon: "↓",
      title: "Import từ vựng",
      description: "Thêm danh sách từ vựng mới vào bộ học của bạn.",
    },
    {
      href: `/decks/${id}/flashcard`,
      icon: "↻",
      title: "Flashcard",
      description: "Ôn tập từ vựng theo phương pháp ghi nhớ chủ động.",
    },
    {
      href: `/decks/${id}/quiz`,
      icon: "✓",
      title: "Trắc nghiệm",
      description: "Kiểm tra khả năng ghi nhớ qua các câu hỏi.",
    },
    {
      href: `/decks/${id}/spelling`,
      icon: "Aa",
      title: "Kiểm tra chính tả",
      description: "Luyện viết và kiểm tra khả năng nhớ chính xác từ.",
    },
    {
      href: `/decks/${id}/punish`,
      icon: "✍",
      title: "Chép phạt",
      description: "Nhập từ cần học và số lần muốn chép để ghi nhớ.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Learning modes
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Chọn chế độ học
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Chọn phương pháp phù hợp để bắt đầu ôn tập và ghi nhớ từ vựng.
          </p>
        </div>

        {/* Learning modes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="
                group relative overflow-hidden rounded-2xl
                border border-neutral-200/80
                bg-white p-5
                shadow-[0_2px_10px_rgba(0,0,0,0.03)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-neutral-300
                hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]
                sm:p-6
              "
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                {/* Icon */}
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl
                    bg-neutral-900
                    text-sm font-medium text-white
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                >
                  {mode.icon}
                </div>

                {/* Arrow */}
                <div
                  className="
                    text-lg text-neutral-300
                    transition-all duration-300
                    group-hover:translate-x-1
                    group-hover:text-neutral-900
                  "
                >
                  →
                </div>
              </div>

              {/* Content */}
              <div className="mt-6">
                <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                  {mode.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  {mode.description}
                </p>
              </div>

              {/* Bottom line */}
              <div
                className="
                  absolute bottom-0 left-0 h-[2px] w-0
                  bg-neutral-900
                  transition-all duration-300
                  group-hover:w-full
                "
              />
            </Link>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          Chọn một chế độ để bắt đầu học
        </div>
      </div>
    </main>
  );
}
