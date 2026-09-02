"use client";

import { use, useEffect, useRef, useState } from "react";

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

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/decks/${id}/words`)
      .then((r) => r.json())
      .then((data: Word[]) => {
        setAllWords(data);
        setPracticeWords(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Tự động focus vào ô nhập mỗi khi chuyển từ hoặc quay lại trạng thái chưa kiểm tra
  useEffect(() => {
    if (!loading && !finished) {
      inputRef.current?.focus();
    }
  }, [idx, checked, loading, finished]);

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
  if (!allWords.length) {
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

  function handleCheck() {
    if (!input.trim()) return;

    const w = practiceWords[idx];
    setChecked(true);

    if (normalize(input) === normalize(w.term)) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongWords((prev) =>
        prev.some((x) => x._id === w._id) ? prev : [...prev, w]
      );
    }
  }

  function handleNext() {
    if (idx === practiceWords.length - 1) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
    }
    setInput("");
    setChecked(false);
  }

  function reviewWrong() {
    setPracticeWords(wrongWords);
    setWrongWords([]);
    setIdx(0);
    setCorrectCount(0);
    setInput("");
    setChecked(false);
    setFinished(false);
  }

  function retryAll() {
    setPracticeWords(allWords);
    setWrongWords([]);
    setIdx(0);
    setCorrectCount(0);
    setInput("");
    setChecked(false);
    setFinished(false);
  }

  // Finished screen
  if (finished) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_8px_35px_rgba(0,0,0,0.05)] sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Spelling completed
          </p>

          <h1 className="mt-7 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Hoàn thành luyện chính tả
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Bạn đã viết đúng{" "}
            <span className="font-semibold text-neutral-900">
              {correctCount}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-semibold text-neutral-900">
              {practiceWords.length}
            </span>{" "}
            từ.
          </p>

          {wrongWords.length > 0 && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-500">
                Từ viết sai ({wrongWords.length})
              </p>

              <div className="mt-3 space-y-2">
                {wrongWords.map((w) => (
                  <div
                    key={w._id}
                    className="rounded-xl border border-red-100 bg-white px-4 py-2.5"
                  >
                    <p className="text-sm font-semibold text-neutral-900">
                      {w.term}
                    </p>
                    <p className="text-xs text-neutral-500">{w.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {wrongWords.length > 0 && (
              <button
                type="button"
                onClick={reviewWrong}
                className="
                  flex-1 rounded-xl
                  bg-neutral-900 px-5 py-3.5
                  text-sm font-medium text-white
                  transition-all
                  hover:bg-neutral-800
                  hover:shadow-md
                  active:scale-[0.99]
                "
              >
                Ôn lại {wrongWords.length} từ sai
              </button>
            )}

            <button
              type="button"
              onClick={retryAll}
              className="
                flex-1 rounded-xl
                border border-neutral-200 bg-white px-5 py-3.5
                text-sm font-medium text-neutral-700
                transition-all
                hover:border-neutral-400 hover:bg-neutral-50
                active:scale-[0.99]
              "
            >
              Làm lại toàn bộ
            </button>
          </div>
        </div>
      </main>
    );
  }

  const w = practiceWords[idx];

  const isCorrect = checked && normalize(input) === normalize(w.term);

  const progress = ((idx + 1) / practiceWords.length) * 100;

  const hiddenExample = w.example
    ? w.example.replace(new RegExp(w.term, "gi"), "_____")
    : "";

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
              {idx + 1}/{practiceWords.length}
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
              ref={inputRef}
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
                      ? "border-emerald-600 bg-emerald-600 text-white"
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
                        ${isCorrect ? "text-emerald-100" : "text-red-500"}
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
                {idx === practiceWords.length - 1
                  ? "Hoàn thành →"
                  : "Từ tiếp theo →"}
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
