"use client";

import { use, useEffect, useState } from "react";
import { speak } from "@/lib/speak";

interface Word {
  _id: string;
  term: string;
  meaning: string;
  example: string;
}

interface Deck {
  language: "en" | "ko";
}

export default function FlashcardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [words, setWords] = useState<Word[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/decks/${id}`).then((r) => r.json()),
      fetch(`/api/decks/${id}/words`).then((r) => r.json()),
    ])
      .then(([deckData, wordsData]) => {
        setDeck(deckData);
        setWords(wordsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="mt-8 h-[360px] animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (!words.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-xl text-white">
            +
          </div>

          <h1 className="mt-6 text-lg font-semibold text-neutral-900">
            Chưa có từ vựng
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Hãy import một danh sách từ vựng trước khi bắt đầu học.
          </p>
        </div>
      </main>
    );
  }

  const w = words[idx];
  const lang = deck?.language ?? "en";
  const progress = ((idx + 1) / words.length) * 100;

  const previousWord = () => {
    setIdx((i) => Math.max(0, i - 1));
    setFlipped(false);
  };

  const nextWord = () => {
    setIdx((i) => Math.min(words.length - 1, i + 1));
    setFlipped(false);
  };

  const flipCard = () => {
    setFlipped((f) => !f);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // không cho lật thẻ khi bấm nút loa
    speak(w.term, lang);
  };

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Flashcards
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Ôn tập từ vựng
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-400">Tiến độ</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {idx + 1} / {words.length}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Flashcard */}
        <button
          type="button"
          onClick={flipCard}
          aria-label={flipped ? "Xem từ vựng" : "Xem nghĩa"}
          className="
            group relative flex min-h-[360px] w-full
            cursor-pointer flex-col items-center justify-center
            overflow-hidden rounded-3xl
            border border-neutral-200
            bg-white px-6 py-12
            text-center
            shadow-[0_4px_25px_rgba(0,0,0,0.04)]
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-[0_16px_45px_rgba(0,0,0,0.08)]
            focus:outline-none
            focus:ring-2
            focus:ring-neutral-900
            focus:ring-offset-4
            sm:min-h-[420px]
            sm:px-12
          "
        >
          {/* Card number */}
          <div className="absolute left-5 top-5 text-xs font-medium text-neutral-300">
            {String(idx + 1).padStart(2, "0")}
          </div>

          {/* Flip indicator */}
          <div className="absolute right-5 top-5 rounded-full border border-neutral-200 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400 transition-colors group-hover:border-neutral-400 group-hover:text-neutral-600">
            {flipped ? "Meaning" : "Word"}
          </div>

          {!flipped ? (
            <>
              <span className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Vocabulary
              </span>

              <div className="flex max-w-2xl items-center gap-3">
                <h2 className="break-words text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                  {w.term}
                </h2>

                {/* Nút loa */}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Đọc từ"
                  onClick={handleSpeak}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSpeak(e as unknown as React.MouseEvent);
                    }
                  }}
                  className="
                    flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center
                    rounded-full border border-neutral-200 bg-white text-neutral-500
                    transition-all hover:border-neutral-400 hover:text-neutral-900
                    active:scale-95
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path
                      d="M15.5 8.5a5 5 0 0 1 0 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18 6a9 9 0 0 1 0 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>

              {w.example && (
                <p className="mt-8 max-w-xl text-sm italic leading-7 text-neutral-500 sm:text-base">
                  “{w.example}”
                </p>
              )}

              <div className="absolute bottom-6 left-0 right-0 text-xs text-neutral-300 transition-colors group-hover:text-neutral-500">
                Click để xem nghĩa
              </div>
            </>
          ) : (
            <>
              <span className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Meaning
              </span>

              <h2 className="max-w-2xl text-2xl font-medium leading-relaxed text-neutral-900 sm:text-4xl">
                {w.meaning}
              </h2>

              <div className="absolute bottom-6 left-0 right-0 text-xs text-neutral-300 transition-colors group-hover:text-neutral-500">
                Click để xem từ
              </div>
            </>
          )}
        </button>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={previousWord}
            disabled={idx === 0}
            className="
              flex h-12 flex-1 items-center justify-center gap-2
              rounded-xl border border-neutral-200
              bg-white
              text-sm font-medium text-neutral-700
              transition-all
              hover:border-neutral-400
              hover:bg-neutral-50
              disabled:cursor-not-allowed
              disabled:opacity-30
              sm:flex-none sm:px-8
            "
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">Trước</span>
          </button>

          <button
            type="button"
            onClick={flipCard}
            className="
              flex h-12 flex-[1.5] items-center justify-center
              rounded-xl
              bg-neutral-900
              px-6
              text-sm font-medium text-white
              shadow-sm
              transition-all
              hover:bg-neutral-800
              hover:shadow-md
              active:scale-[0.98]
              sm:flex-none sm:min-w-[140px]
            "
          >
            {flipped ? "Xem từ" : "Xem nghĩa"}
          </button>

          <button
            type="button"
            onClick={nextWord}
            disabled={idx === words.length - 1}
            className="
              flex h-12 flex-1 items-center justify-center gap-2
              rounded-xl border border-neutral-200
              bg-white
              text-sm font-medium text-neutral-700
              transition-all
              hover:border-neutral-400
              hover:bg-neutral-50
              disabled:cursor-not-allowed
              disabled:opacity-30
              sm:flex-none sm:px-8
            "
          >
            <span className="hidden sm:inline">Tiếp</span>
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="mt-5 text-center text-xs text-neutral-400">
          Nhấn vào thẻ để lật • Dùng ← → để chuyển từ • Bấm 🔊 để nghe phát âm
        </p>
      </div>
    </main>
  );
}
