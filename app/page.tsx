"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Deck {
  _id: string;
  name: string;
  language: "en" | "ko";
}

export default function HomePage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/decks")
      .then((r) => r.json())
      .then(setDecks)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Vocabulary
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Bộ từ vựng của tôi
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Chọn một bộ để bắt đầu học và luyện tập.
              </p>
            </div>

            <Link
              href="/decks/new"
              className="
                inline-flex
                w-full items-center justify-center
                gap-2
                rounded-xl
                bg-neutral-900
                px-5 py-3
                text-sm font-medium text-white
                shadow-sm
                transition-all
                hover:bg-neutral-800
                hover:shadow-md
                active:scale-[0.98]
                sm:w-auto
              "
            >
              <span className="text-lg leading-none">+</span>
              Tạo bộ mới
            </Link>
          </div>
        </header>

        {/* Stats */}
        {!loading && decks.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-xs text-neutral-400">Tổng số bộ</p>

              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {decks.length}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-xs text-neutral-400">Ngôn ngữ</p>

              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {new Set(decks.map((d) => d.language)).size}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-44
                  animate-pulse
                  rounded-2xl
                  border border-neutral-200
                  bg-white
                "
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && decks.length === 0 && (
          <div
            className="
              rounded-3xl
              border border-dashed border-neutral-300
              bg-white
              px-6 py-14
              text-center
            "
          >
            <div
              className="
                mx-auto flex h-16 w-16
                items-center justify-center
                rounded-2xl
                bg-neutral-900
                text-2xl text-white
              "
            >
              Aa
            </div>

            <h2 className="mt-6 text-lg font-semibold text-neutral-900">
              Chưa có bộ từ vựng
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
              Tạo bộ từ vựng đầu tiên của bạn và bắt đầu hành trình học ngay hôm
              nay.
            </p>

            <Link
              href="/decks/new"
              className="
                mt-6 inline-flex
                items-center gap-2
                rounded-xl
                bg-neutral-900
                px-5 py-3
                text-sm font-medium text-white
                transition-all
                hover:bg-neutral-800
              "
            >
              <span className="text-lg leading-none">+</span>
              Tạo bộ đầu tiên
            </Link>
          </div>
        )}

        {/* Deck list */}
        {!loading && decks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {decks.map((deck) => {
              const isEnglish = deck.language === "en";

              return (
                <Link
                  key={deck._id}
                  href={`/decks/${deck._id}`}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border border-neutral-200
                    bg-white
                    p-5
                    shadow-[0_2px_15px_rgba(0,0,0,0.02)]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:border-neutral-400
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                  "
                >
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div
                      className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-xl
                        bg-neutral-100
                        text-lg
                        grayscale
                      "
                    >
                      {isEnglish ? "🇬🇧" : "🇰🇷"}
                    </div>

                    <span
                      className="
                        rounded-full
                        bg-neutral-100
                        px-2.5 py-1
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-neutral-500
                      "
                    >
                      {isEnglish ? "English" : "Korean"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-7">
                    <h2
                      className="
                        line-clamp-2
                        text-base
                        font-semibold
                        leading-6
                        text-neutral-900
                        transition-colors
                        group-hover:text-neutral-700
                      "
                    >
                      {deck.name}
                    </h2>

                    <p className="mt-1.5 text-xs text-neutral-400">
                      {isEnglish
                        ? "Bộ từ vựng tiếng Anh"
                        : "Bộ từ vựng tiếng Hàn"}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div
                    className="
                      mt-5
                      flex items-center
                      justify-between
                      border-t border-neutral-100
                      pt-4
                    "
                  >
                    <span className="text-xs font-medium text-neutral-400">
                      Bắt đầu học
                    </span>

                    <span
                      className="
                        text-sm text-neutral-400
                        transition-transform duration-200
                        group-hover:translate-x-1
                        group-hover:text-neutral-900
                      "
                    >
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && decks.length > 0 && (
          <p className="mt-8 text-center text-xs text-neutral-400">
            Chọn một bộ từ vựng để bắt đầu.
          </p>
        )}
      </div>
    </main>
  );
}
