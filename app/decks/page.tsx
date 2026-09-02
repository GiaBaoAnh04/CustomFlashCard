"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import DeleteDeckButton from "@/components/DeleteDeckButton";
import LogoutButton from "@/components/LogoutButton";

interface Deck {
  _id: string;
  name: string;
  language: "en" | "ko";
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/decks")
      .then((r) => r.json())
      .then(setDecks)
      .finally(() => setLoading(false));
  }, []);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-8 w-56 animate-pulse rounded bg-neutral-200" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-2xl bg-white" />
            <div className="h-40 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              Vocabulary decks
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Bộ từ vựng của bạn
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
              Chọn một bộ từ để bắt đầu ôn tập, hoặc tạo bộ mới.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* New deck */}
        <Link
          href="/decks/new"
          className="
            group relative mb-4 flex items-center gap-4
            overflow-hidden rounded-2xl
            border border-dashed border-neutral-300
            bg-white/60 p-5
            transition-all duration-300
            hover:-translate-y-1
            hover:border-neutral-900
            hover:bg-white
            hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]
          "
        >
          <div
            className="
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-xl border border-neutral-200 bg-neutral-50
              text-lg font-medium text-neutral-500
              transition-all duration-300
              group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white
            "
          >
            +
          </div>

          <div>
            <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
              Tạo bộ từ mới
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Bắt đầu một bộ từ vựng khác để học.
            </p>
          </div>
        </Link>

        {/* Empty state */}
        {decks.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-xl text-white">
              📚
            </div>

            <h2 className="mt-6 text-lg font-semibold text-neutral-900">
              Chưa có bộ từ nào
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Tạo bộ từ đầu tiên để bắt đầu học nhé.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {decks.map((d) => (
              <div
                key={d._id}
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
                {/* Lớp phủ điều hướng — nằm dưới cùng, không lồng nút xoá bên trong */}
                <Link
                  href={`/decks/${d._id}`}
                  className="absolute inset-0 z-0"
                  aria-label={`Mở bộ từ ${d.name}`}
                />

                {/* Top row */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0 items-center justify-center
                      rounded-xl
                      bg-neutral-900
                      text-sm font-medium uppercase text-white
                      transition-transform duration-300
                      group-hover:scale-105
                    "
                  >
                    {d.language}
                  </div>

                  <div className="flex items-center gap-2">
                    <DeleteDeckButton
                      deckId={d._id}
                      deckName={d.name}
                      onDeleted={() =>
                        setDecks((prev) => prev.filter((x) => x._id !== d._id))
                      }
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 pointer-events-none mt-6">
                  <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                    {d.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Xem các chế độ học cho bộ từ này.
                  </p>
                </div>

                {/* Bottom line */}
                <div
                  className="
                    pointer-events-none absolute bottom-0 left-0 h-[2px] w-0
                    bg-neutral-900
                    transition-all duration-300
                    group-hover:w-full
                  "
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
