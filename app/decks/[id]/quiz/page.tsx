"use client";

import { use, useEffect, useState } from "react";

interface Word {
  _id: string;
  term: string;
  meaning: string;
}

interface Question {
  term: string;
  correct: string;
  options: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function buildQuestions(pool: Word[], fullPool: Word[]): Question[] {
  return shuffle(pool).map((w) => {
    const distractorPool = fullPool
      .filter((x) => x._id !== w._id)
      .map((x) => x.meaning);

    const distractors = shuffle(distractorPool).slice(0, 3);

    return {
      term: w.term,
      correct: w.meaning,
      options: shuffle([...distractors, w.meaning]),
    };
  });
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [words, setWords] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD WORDS
  // =========================

  useEffect(() => {
    fetch(`/api/decks/${id}/words`)
      .then((r) => r.json())
      .then((data: Word[]) => {
        setWords(data);
        setQuestions(buildQuestions(data, data));
      })
      .finally(() => setLoading(false));
  }, [id]);

  // =========================
  // ANSWER QUESTION
  // =========================

  function answerQuestion(option: string) {
    // Không cho chọn lại sau khi đã trả lời
    if (answered !== null) return;

    const q = questions[qIdx];

    if (!q) return;

    const isCorrect = option === q.correct;

    setAnswered(option);

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      const wordObj = words.find((w) => w.term === q.term);

      if (wordObj) {
        setWrongWords((prev) =>
          prev.some((w) => w._id === wordObj._id) ? prev : [...prev, wordObj]
        );
      }
    }
  }

  // =========================
  // NEXT QUESTION
  // =========================

  function nextQuestion() {
    if (answered === null) return;

    setQIdx((i) => i + 1);
    setAnswered(null);
  }

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================

  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      // Nếu đang nhập text thì không xử lý shortcut
      const target = e.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      // =========================
      // 1 / 2 / 3 / 4
      // Chọn đáp án
      // =========================

      if (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4") {
        e.preventDefault();

        // Không cho chọn nếu đã trả lời
        if (answered !== null) return;

        const optionIndex = Number(e.key) - 1;
        const q = questions[qIdx];

        if (!q || !q.options[optionIndex]) return;

        answerQuestion(q.options[optionIndex]);

        return;
      }

      // =========================
      // A / B / C / D
      // Chọn đáp án
      // =========================

      const key = e.key.toLowerCase();

      if (key === "a" || key === "b" || key === "c" || key === "d") {
        e.preventDefault();

        if (answered !== null) return;

        const optionIndex = key.charCodeAt(0) - "a".charCodeAt(0);

        const q = questions[qIdx];

        if (!q || !q.options[optionIndex]) return;

        answerQuestion(q.options[optionIndex]);

        return;
      }

      // =========================
      // ENTER
      // Sang câu tiếp theo
      // =========================

      if (e.key === "Enter") {
        e.preventDefault();

        if (answered !== null) {
          nextQuestion();
        }

        return;
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [answered, qIdx, questions, words]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />

          <div className="mt-6 h-8 w-48 animate-pulse rounded bg-neutral-200" />

          <div className="mt-8 h-[420px] animate-pulse rounded-3xl bg-white" />
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
            ?
          </div>

          <h1 className="mt-6 text-lg font-semibold text-neutral-900">
            Chưa có từ vựng
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Hãy import từ vựng trước khi bắt đầu làm bài trắc nghiệm.
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // RESULT
  // =========================

  if (qIdx >= questions.length) {
    const percentage =
      questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    function reviewWrong() {
      setQuestions(buildQuestions(wrongWords, words));
      setWrongWords([]);
      setQIdx(0);
      setScore(0);
      setAnswered(null);
    }

    function retryAll() {
      setQuestions(buildQuestions(words, words));
      setWrongWords([]);
      setQIdx(0);
      setScore(0);
      setAnswered(null);
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_8px_35px_rgba(0,0,0,0.05)] sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Quiz completed
          </p>

          <div className="mx-auto mt-7 flex h-24 w-24 items-center justify-center rounded-full border-8 border-neutral-100">
            <span className="text-2xl font-semibold text-neutral-900">
              {percentage}%
            </span>
          </div>

          <h1 className="mt-7 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Hoàn thành bài kiểm tra
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Bạn đã trả lời đúng{" "}
            <span className="font-semibold text-neutral-900">{score}</span> trên
            tổng số{" "}
            <span className="font-semibold text-neutral-900">
              {questions.length}
            </span>{" "}
            câu hỏi.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-xs text-neutral-400">Điểm số</p>

              <p className="mt-1 text-xl font-semibold text-neutral-900">
                {score}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-xs text-neutral-400">Tổng câu</p>

              <p className="mt-1 text-xl font-semibold text-neutral-900">
                {questions.length}
              </p>
            </div>
          </div>

          {/* Wrong answers */}
          {wrongWords.length > 0 && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-500">
                Câu trả lời sai ({wrongWords.length})
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
                Ôn lại {wrongWords.length} câu sai
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
                hover:border-neutral-400
                hover:bg-neutral-50
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

  // =========================
  // CURRENT QUESTION
  // =========================

  const q = questions[qIdx];

  const progress = ((qIdx + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* =========================
            HEADER
        ========================= */}

        <header className="mb-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Multiple Choice
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Trắc nghiệm
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-400">Điểm</p>

              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {score}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span className="text-xs font-medium text-neutral-400">
              {qIdx + 1}/{questions.length}
            </span>
          </div>
        </header>

        {/* =========================
            QUESTION CARD
        ========================= */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] sm:p-8">
          {/* Question */}
          <div className="border-b border-neutral-100 pb-7 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              What does this word mean?
            </p>

            <h2 className="mt-4 break-words text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {q.term}
            </h2>
          </div>

          {/* =========================
              OPTIONS
          ========================= */}

          <div className="mt-7 space-y-3">
            {q.options.map((opt, index) => {
              const isCorrect = opt === q.correct;

              const isSelected = opt === answered;

              const showState = answered !== null;

              let stateClass =
                "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50";

              if (showState && isCorrect) {
                stateClass = "border-emerald-600 bg-emerald-600 text-white";
              }

              if (showState && isSelected && !isCorrect) {
                stateClass = "border-red-300 bg-red-50 text-red-700";
              }

              return (
                <button
                  key={`${opt}-${index}`}
                  type="button"
                  disabled={showState}
                  onClick={() => answerQuestion(opt)}
                  className={`
                    group flex w-full items-center gap-4
                    rounded-2xl border p-4
                    text-left
                    transition-all duration-200
                    disabled:cursor-default
                    ${stateClass}
                  `}
                >
                  {/* Number */}
                  <span
                    className={`
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-xl border
                      text-xs font-semibold
                      ${
                        showState && isCorrect
                          ? "border-white/20 bg-white/10 text-white"
                          : showState && isSelected
                            ? "border-red-200 bg-white text-red-600"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500 group-hover:border-neutral-300"
                      }
                    `}
                  >
                    {index + 1}
                  </span>

                  {/* Answer */}
                  <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                    {opt}
                  </span>

                  {/* State */}
                  {showState && isCorrect && <span className="text-sm">✓</span>}

                  {showState && isSelected && !isCorrect && (
                    <span className="text-sm text-red-500">×</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* =========================
              NEXT
          ========================= */}

          {answered !== null && (
            <div className="mt-6">
              <div className="mb-4 rounded-xl bg-neutral-50 px-4 py-3 text-center text-xs text-neutral-500">
                {answered === q.correct
                  ? "✓ Chính xác! Bạn đã chọn đúng đáp án."
                  : `Đáp án đúng: ${q.correct}`}
              </div>

              <button
                type="button"
                onClick={nextQuestion}
                className="
                  w-full rounded-xl
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
                {qIdx === questions.length - 1
                  ? "Xem kết quả"
                  : "Câu tiếp theo →"}
              </button>

              {/* Enter hint */}
              <p className="mt-3 text-center text-xs text-neutral-400">
                Nhấn{" "}
                <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
                  Enter
                </kbd>{" "}
                để tiếp tục
              </p>
            </div>
          )}
        </section>

        {/* =========================
            KEYBOARD SHORTCUTS
        ========================= */}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-400">
          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              1
            </kbd>{" "}
            A
          </span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              2
            </kbd>{" "}
            B
          </span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              3
            </kbd>{" "}
            C
          </span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              4
            </kbd>{" "}
            D
          </span>

          <span className="text-neutral-200">•</span>

          <span>
            <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-medium text-neutral-500">
              Enter
            </kbd>{" "}
            Tiếp tục
          </span>
        </div>

        {/* Mobile hint */}
        <p className="mt-3 text-center text-xs text-neutral-300 sm:hidden">
          Chạm vào đáp án để chọn
        </p>
      </div>
    </main>
  );
}
