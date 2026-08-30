"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDeckPage() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<"en" | "ko">("en");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          language,
        }),
      });

      const deck = await res.json();

      router.push(`/decks/${deck._id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 py-8 sm:px-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Vocabulary
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Tạo bộ từ vựng mới
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Tạo một bộ từ vựng để bắt đầu học và luyện tập.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="
            rounded-3xl
            border border-neutral-200
            bg-white
            p-6
            shadow-[0_8px_35px_rgba(0,0,0,0.05)]
            sm:p-8
          "
        >
          {/* Deck name */}
          <div>
            <label
              htmlFor="deck-name"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Tên bộ từ vựng
            </label>

            <input
              id="deck-name"
              type="text"
              placeholder="Ví dụ: English B2 Vocabulary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
              className="
                w-full rounded-xl
                border border-neutral-200
                bg-neutral-50
                px-4 py-3.5
                text-sm text-neutral-900
                outline-none
                placeholder:text-neutral-300
                transition-all
                focus:border-neutral-900
                focus:bg-white
                focus:ring-4
                focus:ring-neutral-900/5
              "
            />
          </div>

          {/* Language */}
          <div className="mt-7">
            <div className="mb-3">
              <p className="text-sm font-medium text-neutral-800">Ngôn ngữ</p>

              <p className="mt-1 text-xs text-neutral-400">
                Chọn ngôn ngữ của từ vựng trong bộ này.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* English */}
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`
                  rounded-2xl border p-4
                  text-left
                  transition-all duration-200
                  ${
                    language === "en"
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🇬🇧</span>

                  {language === "en" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm font-semibold">Tiếng Anh</p>

                <p
                  className={`mt-1 text-xs ${
                    language === "en" ? "text-neutral-400" : "text-neutral-400"
                  }`}
                >
                  English
                </p>
              </button>

              {/* Korean */}
              <button
                type="button"
                onClick={() => setLanguage("ko")}
                className={`
                  rounded-2xl border p-4
                  text-left
                  transition-all duration-200
                  ${
                    language === "ko"
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🇰🇷</span>

                  {language === "ko" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm font-semibold">Tiếng Hàn</p>

                <p className="mt-1 text-xs text-neutral-400">Korean</p>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="
              mt-8 w-full rounded-xl
              bg-neutral-900
              px-5 py-3.5
              text-sm font-medium text-white
              shadow-sm
              transition-all duration-200
              hover:bg-neutral-800
              hover:shadow-md
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {loading ? "Đang tạo..." : "Tạo bộ từ vựng"}
          </button>

          {/* Helper */}
          <p className="mt-4 text-center text-xs text-neutral-400">
            Bạn có thể import từ vựng sau khi tạo bộ.
          </p>
        </form>
      </div>
    </main>
  );
}
