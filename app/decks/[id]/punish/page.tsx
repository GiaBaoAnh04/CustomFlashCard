"use client";

import { use, useEffect, useRef, useState } from "react";

interface Word {
  _id: string;
  term: string;
  meaning: string;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export default function PunishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup
  const [setup, setSetup] = useState(true);
  const [selected, setSelected] = useState<Word | null>(null);
  const [times, setTimes] = useState(5);

  // Practice
  const [round, setRound] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // =========================
  // LOAD WORDS
  // =========================

  useEffect(() => {
    fetch(`/api/decks/${id}/words`)
      .then((r) => r.json())
      .then(setWords)
      .finally(() => setLoading(false));
  }, [id]);

  // =========================
  // AUTO FOCUS
  // =========================

  useEffect(() => {
    if (!setup && !checked) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [round, checked, setup]);

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================

  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      // ESC → quay về màn hình setup
      if (e.key === "Escape") {
        e.preventDefault();

        if (!setup) {
          reset();
        }

        return;
      }

      // Chỉ xử lý Enter khi đang practice
      if (!setup && e.key === "Enter") {
        e.preventDefault();

        // Chưa kiểm tra → kiểm tra
        if (!checked) {
          handleCheck();
        }
        // Đã kiểm tra → sang lần tiếp theo
        else {
          handleNext();
        }
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [setup, checked, input, selected, round, times]);

  // =========================
  // START PRACTICE
  // =========================

  function startPractice(e: React.FormEvent) {
    e.preventDefault();

    if (!selected || times < 1) return;

    setSetup(false);
    setRound(0);
    setCorrectCount(0);
    setInput("");
    setChecked(false);
  }

  // =========================
  // CHECK ANSWER
  // =========================

  const isCorrect =
    checked &&
    selected !== null &&
    normalize(input) === normalize(selected.term);

  // =========================
  // DONE
  // =========================

  const done = round >= times;

  // =========================
  // HANDLE CHECK
  // =========================

  function handleCheck() {
    if (!input.trim() || !selected || checked) return;

    const correct = normalize(input) === normalize(selected.term);

    setChecked(true);

    if (correct) {
      setCorrectCount((c) => c + 1);
    }
  }

  // =========================
  // NEXT ROUND
  // =========================

  function handleNext() {
    setRound((r) => r + 1);
    setInput("");
    setChecked(false);

    // Focus lại input sau khi render
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  // =========================
  // RESET
  // =========================

  function reset() {
    setSetup(true);
    setSelected(null);
    setInput("");
    setChecked(false);
    setRound(0);
    setCorrectCount(0);
  }

  // =========================
  // LOADING
  // =========================

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

  // =========================
  // EMPTY STATE
  // =========================

  if (!words.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-xl text-white">
            ✍
          </div>

          <h1 className="mt-6 text-lg font-semibold text-neutral-900">
            Chưa có từ vựng
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Hãy import từ vựng trước khi bắt đầu chép phạt.
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // SETUP
  // =========================

  if (setup) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-2xl">
          <header className="mb-7">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Chép phạt
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Chọn từ cần chép
            </h1>
          </header>

          <form
            onSubmit={startPractice}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] sm:p-8"
          >
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Từ vựng
            </label>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {words.map((w) => {
                const isSelected = selected?._id === w._id;

                return (
                  <button
                    key={w._id}
                    type="button"
                    onClick={() => setSelected(w)}
                    className={`
                      flex w-full items-center justify-between gap-3
                      rounded-2xl border p-4 text-left
                      transition-all duration-200
                      ${
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }
                    `}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{w.term}</p>

                      <p
                        className={`mt-0.5 truncate text-xs ${
                          isSelected ? "text-neutral-300" : "text-neutral-500"
                        }`}
                      >
                        {w.meaning}
                      </p>
                    </div>

                    {isSelected && <span className="text-sm">✓</span>}
                  </button>
                );
              })}
            </div>

            <label className="mt-6 block text-sm font-medium text-neutral-700">
              Số lần muốn chép
            </label>

            <input
              type="number"
              min={1}
              value={times}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value >= 1) {
                  setTimes(value);
                }
              }}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
            />

            <button
              type="submit"
              disabled={!selected}
              className="
                mt-6 w-full rounded-xl bg-neutral-900 px-5 py-3.5
                text-sm font-medium text-white
                transition-all hover:bg-neutral-800
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              Bắt đầu chép
            </button>
          </form>
        </div>
      </main>
    );
  }

  // =========================
  // DONE
  // =========================

  if (done && selected) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-xl text-white">
            ✓
          </div>

          <h1 className="mt-6 text-lg font-semibold text-neutral-900">
            Hoàn thành!
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Đúng {correctCount}/{times} lần cho từ &quot;
            {selected.term}
            &quot;
          </p>

          <button
            onClick={reset}
            className="mt-6 w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Chép từ khác
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // SAFETY
  // =========================

  if (!selected) return null;

  // =========================
  // PRACTICE
  // =========================

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* HEADER */}
        <header className="mb-7">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Chép phạt
          </p>

          <div className="flex items-center justify-between gap-4">
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Lần {round + 1}/{times}
            </h1>

            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-neutral-400 transition hover:text-neutral-900"
            >
              Thoát <span className="ml-1">Esc</span>
            </button>
          </div>

          {/* PROGRESS */}
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all duration-300"
              style={{
                width: `${(round / times) * 100}%`,
              }}
            />
          </div>
        </header>

        {/* CARD */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] sm:p-8">
          {/* WORD */}
          <div className="border-b border-neutral-100 pb-7 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Chép lại từ
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
              {selected.term}
            </h2>

            <p className="mt-2 text-sm text-neutral-500">{selected.meaning}</p>
          </div>

          {/* INPUT */}
          <div className="mt-7">
            <input
              ref={inputRef}
              autoComplete="off"
              spellCheck={false}
              className={`
                w-full rounded-2xl border px-5 py-4
                text-lg font-medium text-neutral-900
                outline-none transition
                ${
                  checked
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-300 bg-red-50"
                    : "border-neutral-200 bg-neutral-50 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5"
                }
              `}
              placeholder="Gõ lại từ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={checked}
            />
          </div>

          {/* CHECK BUTTON */}
          {!checked && (
            <>
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="
                  mt-5 w-full rounded-xl bg-neutral-900 px-5 py-3.5
                  text-sm font-medium text-white
                  transition hover:bg-neutral-800
                  disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                Kiểm tra
              </button>

              <p className="mt-3 text-center text-xs text-neutral-400">
                Nhấn{" "}
                <kbd className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-medium text-neutral-600">
                  Enter
                </kbd>{" "}
                để kiểm tra
              </p>
            </>
          )}

          {/* RESULT */}
          {checked && (
            <div className="mt-6">
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
                <p
                  className={`
                    text-sm font-semibold
                    ${isCorrect ? "text-white" : "text-red-700"}
                  `}
                >
                  {isCorrect
                    ? "Chính xác!"
                    : `Chưa đúng — từ đúng là: ${selected.term}`}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="
                  mt-6 w-full rounded-xl bg-neutral-900 px-5 py-3.5
                  text-sm font-medium text-white
                  hover:bg-neutral-800
                "
              >
                {round === times - 1 ? "Xem kết quả →" : "Lần tiếp theo →"}
              </button>

              <p className="mt-3 text-center text-xs text-neutral-400">
                Nhấn{" "}
                <kbd className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-medium text-neutral-600">
                  Enter
                </kbd>{" "}
                để tiếp tục
              </p>
            </div>
          )}
        </section>

        {/* KEYBOARD SHORTCUTS */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              Enter
            </kbd>{" "}
            {checked ? "Tiếp tục" : "Kiểm tra"}
          </span>

          <span className="text-neutral-200">•</span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              Esc
            </kbd>{" "}
            Thoát
          </span>
        </div>
      </div>
    </main>
  );
}
