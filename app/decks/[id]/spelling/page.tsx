"use client";

import { use, useEffect, useState } from "react";

interface Word {
  _id: string;
  term: string;
  meaning: string;
  example: string;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function diffChars(input: string, correct: string) {
  const maxLen = Math.max(input.length, correct.length);

  const result: { char: string; ok: boolean }[] = [];

  for (let i = 0; i < maxLen; i++) {
    const ch = input[i] ?? "";
    const ok = normalize(ch) === normalize(correct[i] ?? "");

    result.push({
      char: ch || "_",
      ok,
    });
  }

  return result;
}

export default function SpellingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/decks/${id}/words`)
      .then((r) => r.json())
      .then(setWords)
      .finally(() => setLoading(false));
  }, [id]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="mt-6 h-8 w-52 animate-pulse rounded bg-neutral-200" />
          <div className="mt-8 h-[400px] animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  // Empty state
  if (!words.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-xl text-white">
            Aa
          </div>

          <h1 className="mt-6 text-lg font-semibold text-neutral-900">
            Chưa có từ vựng
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Hãy import từ vựng trước khi bắt đầu luyện chính tả.
          </p>
        </div>
      </main>
    );
  }

  const w = words[idx];

  const isCorrect = checked && normalize(input) === normalize(w.term);

  const progress = ((idx + 1) / words.length) * 100;

  const hiddenExample = w.example
    ? w.example.replace(new RegExp(w.term, "gi"), "_____")
    : "";

  function handleCheck() {
    if (!input.trim()) return;

    setChecked(true);

    if (normalize(input) === normalize(w.term)) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    setIdx((i) => Math.min(words.length - 1, i + 1));
    setInput("");
    setChecked(false);
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <header className="mb-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Spelling
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Kiểm tra chính tả
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-400">Đúng</p>

              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {correctCount}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-xs font-medium text-neutral-400">
              {idx + 1}/{words.length}
            </span>
          </div>
        </header>

        {/* Main card */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] sm:p-8">
          {/* Question */}
          <div className="border-b border-neutral-100 pb-7 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Write the word
            </p>

            <h2 className="mt-4 text-2xl font-semibold leading-relaxed tracking-tight text-neutral-900 sm:text-3xl">
              {w.meaning}
            </h2>

            {hiddenExample && (
              <p className="mx-auto mt-4 max-w-xl text-sm italic leading-7 text-neutral-500">
                “{hiddenExample}”
              </p>
            )}
          </div>

          {/* Input */}
          <div className="mt-7">
            <label
              htmlFor="spelling-input"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Your answer
            </label>

            <input
              id="spelling-input"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="
                w-full rounded-2xl
                border border-neutral-200
                bg-neutral-50
                px-5 py-4
                text-lg font-medium
                text-neutral-900
                outline-none
                placeholder:text-neutral-300
                transition-all
                focus:border-neutral-900
                focus:bg-white
                focus:ring-4
                focus:ring-neutral-900/5
                disabled:cursor-not-allowed
                disabled:bg-neutral-100
              "
              placeholder="Type the word..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !checked) {
                  handleCheck();
                }
              }}
              disabled={checked}
            />

            {!checked && (
              <p className="mt-2 text-xs text-neutral-400">
                Nhấn Enter để kiểm tra câu trả lời
              </p>
            )}
          </div>

          {/* Check button */}
          {!checked && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!input.trim()}
              className="
                mt-5 w-full rounded-xl
                bg-neutral-900
                px-5 py-3.5
                text-sm font-medium text-white
                shadow-sm
                transition-all
                hover:bg-neutral-800
                hover:shadow-md
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Kiểm tra
            </button>
          )}

          {/* Result */}
          {checked && (
            <div className="mt-6">
              {/* Correct / Wrong */}
              <div
                className={`
                  rounded-2xl border p-5
                  ${
                    isCorrect
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-red-200 bg-red-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex h-9 w-9 items-center justify-center
                      rounded-full
                      text-sm font-semibold
                      ${
                        isCorrect
                          ? "bg-white/10 text-white"
                          : "bg-white text-red-600"
                      }
                    `}
                  >
                    {isCorrect ? "✓" : "×"}
                  </div>

                  <div>
                    <p
                      className={`
                        text-sm font-semibold
                        ${isCorrect ? "text-white" : "text-red-700"}
                      `}
                    >
                      {isCorrect ? "Chính xác!" : "Chưa chính xác"}
                    </p>

                    <p
                      className={`
                        mt-0.5 text-xs
                        ${isCorrect ? "text-neutral-300" : "text-red-500"}
                      `}
                    >
                      {isCorrect
                        ? "Bạn đã viết đúng từ."
                        : "Hãy xem lại cách viết bên dưới."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Correct answer */}
              {!isCorrect && (
                <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                    Correct answer
                  </p>

                  <p className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
                    {w.term}
                  </p>

                  {/* Character comparison */}
                  <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-lg">
                    {diffChars(input, w.term).map((c, i) => (
                      <span
                        key={i}
                        className={`
                          inline-flex min-w-7
                          items-center justify-center
                          rounded-md px-1
                          ${
                            c.ok
                              ? "text-neutral-700"
                              : "bg-red-100 text-red-600 underline decoration-red-400 underline-offset-4"
                          }
                        `}
                      >
                        {c.char}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-4 text-xs text-neutral-400">
                    <span>
                      <span className="font-medium text-neutral-700">✓</span>{" "}
                      Đúng
                    </span>

                    <span>
                      <span className="font-medium text-red-500">_</span> Sai /
                      thiếu
                    </span>
                  </div>
                </div>
              )}

              {/* Next */}
              <button
                type="button"
                onClick={handleNext}
                className="
                  mt-6 w-full rounded-xl
                  bg-neutral-900
                  px-5 py-3.5
                  text-sm font-medium text-white
                  shadow-sm
                  transition-all
                  hover:bg-neutral-800
                  hover:shadow-md
                  active:scale-[0.99]
                "
              >
                {idx === words.length - 1 ? "Hoàn thành →" : "Từ tiếp theo →"}
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-neutral-400">
          Gõ từ và nhấn Enter để kiểm tra
        </p>
      </div>
    </main>
  );
}
