"use client";

import { use, useEffect, useRef, useState } from "react";
import { speak } from "@/lib/speak";

interface Word {
  _id: string;
  term: string;
  meaning: string;
  example: string;
}

interface Deck {
  language: "en" | "ko" | "zh";
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

  // true = mặt trước hiện nghĩa, mặt sau hiện từ vựng (đảo ngược mặc định)
  const [isSwapped, setIsSwapped] = useState(false);

  // Dùng để xử lý swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  // =========================
  // NAVIGATION
  // =========================

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

  const toggleSwap = () => {
    setIsSwapped((s) => !s);
    setFlipped(false);
  };

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================

  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      // Không xử lý shortcut nếu người dùng đang nhập vào input/textarea
      const target = e.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          previousWord();
          break;

        case "ArrowRight":
          e.preventDefault();
          nextWord();
          break;

        case " ":
        case "Enter":
          e.preventDefault();
          flipCard();
          break;

        case "s":
        case "S":
          e.preventDefault();
          toggleSwap();
          break;

        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [words.length]);

  // =========================
  // SWIPE
  // =========================

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = e.changedTouches[0];

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;

    // Chỉ xem là swipe nếu chuyển động ngang lớn hơn dọc
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    // Khoảng cách tối thiểu để tính là swipe
    const SWIPE_THRESHOLD = 60;

    if (!isHorizontalSwipe || Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    // Vuốt trái → từ tiếp theo
    if (deltaX < 0) {
      nextWord();
    }

    // Vuốt phải → từ trước
    if (deltaX > 0) {
      previousWord();
    }
  };

  // =========================
  // SPEAK
  // =========================

  // Chỉ lấy phần chữ của ngôn ngữ đó, bỏ phần pinyin/nghĩa trong ngoặc
  const getSpokenText = (text: string) => {
    const idx = text.indexOf("(");
    return (idx > -1 ? text.slice(0, idx) : text).trim();
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    const w = words[idx];
    const lang = deck?.language ?? "en";

    speak(getSpokenText(w.term), lang);
  };

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    const w = words[idx];
    const lang = deck?.language ?? "en";
    if (w.example) speak(getSpokenText(w.example), lang);
  };

  // =========================
  // LOADING
  // =========================

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

  // =========================
  // EMPTY
  // =========================

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

  // Nội dung mặt trước / mặt sau tùy theo isSwapped
  const frontText = isSwapped ? w.meaning : w.term;
  const backText = isSwapped ? w.term : w.meaning;
  const frontTag = isSwapped ? "Meaning" : "Vocabulary";
  const backTag = isSwapped ? "Vocabulary" : "Meaning";
  const cornerBadge = flipped
    ? isSwapped
      ? "Word"
      : "Meaning"
    : isSwapped
      ? "Meaning"
      : "Word";
  // Mặt nào đang hiện từ vựng gốc (w.term) thì mới cho phát âm + hiện ví dụ
  const currentSideShowsTerm = flipped ? isSwapped : !isSwapped;

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* =========================
            HEADER
        ========================= */}

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

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-neutral-400">Tiến độ</p>

                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {idx + 1} / {words.length}
                </p>
              </div>

              {/* Nút xoay: đổi thứ tự hiển thị mặt trước/sau cho toàn bộ deck */}
              <button
                type="button"
                onClick={toggleSwap}
                aria-label="Đổi thứ tự mặt trước / mặt sau"
                title="Đổi thứ tự mặt trước / mặt sau (S)"
                className="
                  flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-full border border-neutral-200
                  bg-white text-neutral-500
                  transition-all
                  hover:border-neutral-400
                  hover:text-neutral-900
                  active:scale-95
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isSwapped ? "rotate-180" : ""
                  }`}
                >
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </header>

        {/* =========================
            FLASHCARD
        ========================= */}

        <button
          type="button"
          onClick={flipCard}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={flipped ? "Xem mặt trước" : "Xem mặt sau"}
          className="
            group relative flex min-h-[360px] w-full
            cursor-pointer touch-pan-y
            flex-col items-center justify-center
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
            {cornerBadge}
          </div>

          {/* =========================
              FRONT
          ========================= */}

          {!flipped ? (
            <>
              <span className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                {frontTag}
              </span>

              <div className="flex max-w-2xl items-center gap-3">
                <h2
                  className={
                    currentSideShowsTerm
                      ? "break-words text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl"
                      : "max-w-2xl text-2xl font-medium leading-relaxed text-neutral-900 sm:text-4xl"
                  }
                >
                  {frontText}
                </h2>

                {/* Speaker: chỉ hiện ở mặt đang show từ vựng gốc */}
                {currentSideShowsTerm && (
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
                      flex h-9 w-9 shrink-0 cursor-pointer
                      items-center justify-center
                      rounded-full border border-neutral-200
                      bg-white text-neutral-500
                      transition-all
                      hover:border-neutral-400
                      hover:text-neutral-900
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
                )}
              </div>

              {currentSideShowsTerm && w.example && (
                <div className="mt-8 flex max-w-xl items-center gap-2">
                  <p className="text-sm italic leading-7 text-neutral-500 sm:text-base">
                    “{w.example}”
                  </p>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Đọc ví dụ"
                    onClick={handleSpeakExample}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSpeakExample(e as unknown as React.MouseEvent);
                      }
                    }}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 transition-all hover:border-neutral-400 hover:text-neutral-900 active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                      <path
                        d="M15.5 8.5a5 5 0 0 1 0 7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
              )}

              <div className="absolute bottom-6 left-0 right-0 text-xs text-neutral-300 transition-colors group-hover:text-neutral-500">
                Click / Space để xem {backTag === "Meaning" ? "nghĩa" : "từ"}
              </div>
            </>
          ) : (
            /* =========================
               BACK
            ========================= */

            <>
              <span className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                {backTag}
              </span>

              <div className="flex max-w-2xl items-center gap-3">
                <h2
                  className={
                    currentSideShowsTerm
                      ? "break-words text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl"
                      : "max-w-2xl text-2xl font-medium leading-relaxed text-neutral-900 sm:text-4xl"
                  }
                >
                  {backText}
                </h2>

                {currentSideShowsTerm && (
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
                      flex h-9 w-9 shrink-0 cursor-pointer
                      items-center justify-center
                      rounded-full border border-neutral-200
                      bg-white text-neutral-500
                      transition-all
                      hover:border-neutral-400
                      hover:text-neutral-900
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
                )}
              </div>

              {currentSideShowsTerm && w.example && (
                <p className="mt-8 max-w-xl text-sm italic leading-7 text-neutral-500 sm:text-base">
                  “{w.example}”
                </p>
              )}

              <div className="absolute bottom-6 left-0 right-0 text-xs text-neutral-300 transition-colors group-hover:text-neutral-500">
                Click / Space để xem {frontTag === "Meaning" ? "nghĩa" : "từ"}
              </div>
            </>
          )}
        </button>

        {/* =========================
            CONTROLS
        ========================= */}

        <div className="mt-6 flex items-center justify-between gap-3">
          {/* Previous */}
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

          {/* Flip */}
          <button
            type="button"
            onClick={flipCard}
            className="
              flex h-12 flex-[1.5]
              items-center justify-center
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
            {flipped
              ? `Xem ${frontTag === "Meaning" ? "nghĩa" : "từ"}`
              : `Xem ${backTag === "Meaning" ? "nghĩa" : "từ"}`}
          </button>

          {/* Next */}
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

        {/* =========================
            KEYBOARD SHORTCUTS
        ========================= */}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-400">
          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              ←
            </kbd>{" "}
            Từ trước
          </span>

          <span className="text-neutral-200">•</span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              →
            </kbd>{" "}
            Từ tiếp
          </span>

          <span className="text-neutral-200">•</span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              Space
            </kbd>{" "}
            Lật thẻ
          </span>

          <span className="text-neutral-200">•</span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              S
            </kbd>{" "}
            Đổi mặt trước/sau
          </span>
        </div>

        {/* Mobile hint */}
        <p className="mt-3 text-center text-xs text-neutral-300 sm:hidden">
          Vuốt trái / phải để chuyển từ
        </p>
      </div>
    </main>
  );
}
