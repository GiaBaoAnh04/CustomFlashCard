"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

interface ParsedWord {
  term: string;
  meaning: string;
  example: string;
}

function parseLines(text: string): ParsedWord[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());

      return {
        term: parts[0] || "",
        meaning: parts[1] || "",
        example: parts[2] || "",
      };
    })
    .filter((w) => w.term);
}

export default function NewDeckPage() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<"en" | "ko">("en");
  const [saving, setSaving] = useState(false);

  const [words, setWords] = useState<ParsedWord[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const router = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseLines(String(evt.target?.result));
      const bad = parsed.filter((w) => !w.meaning);

      setError(
        bad.length
          ? `${bad.length} dòng thiếu nghĩa: ${bad
              .map((w) => w.term)
              .join(", ")}`
          : ""
      );

      setWords(parsed);
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || error) return;

    setSaving(true);
    try {
      // Bước 1: tạo deck
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), language }),
      });
      const deck = await res.json();

      // Bước 2: nếu có từ vựng đã import, lưu luôn vào deck vừa tạo
      if (words.length > 0) {
        await fetch(`/api/decks/${deck._id}/words`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ words }),
        });
        router.push(`/decks/${deck._id}/flashcard`);
      } else {
        router.push(`/decks/${deck._id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* Top bar */}
        <div className="mb-4 flex justify-end">
          <LogoutButton />
        </div>

        {/* Header */}
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Vocabulary
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Tạo bộ từ vựng mới
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Đặt tên bộ từ, chọn ngôn ngữ, và import từ vựng ngay trong một bước.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card 1: tên + ngôn ngữ */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.05)] sm:p-8">
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

            <div className="mt-7">
              <div className="mb-3">
                <p className="text-sm font-medium text-neutral-800">Ngôn ngữ</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Chọn ngôn ngữ của từ vựng trong bộ này.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`
                    rounded-2xl border p-4 text-left transition-all duration-200
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
                  <p className="mt-1 text-xs text-neutral-400">English</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage("ko")}
                  className={`
                    rounded-2xl border p-4 text-left transition-all duration-200
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
          </div>

          {/* Card 2: import từ vựng */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="mb-6 rounded-2xl bg-neutral-50 p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-sm text-white">
                  i
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Import từ vựng (tuỳ chọn)
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Mỗi dòng tương ứng với một từ vựng. Có thể bỏ qua và thêm từ
                    sau.
                  </p>
                  <code className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm">
                    từ | nghĩa | ví dụ
                  </code>
                </div>
              </div>
            </div>

            <label
              htmlFor="file-upload"
              className="
                group flex min-h-[190px] cursor-pointer flex-col items-center
                justify-center rounded-2xl border border-dashed border-neutral-300
                bg-neutral-50/50 px-6 py-8 text-center transition-all duration-300
                hover:border-neutral-500 hover:bg-neutral-50
              "
            >
              <div
                className="
                  flex h-14 w-14 items-center justify-center rounded-2xl
                  bg-white text-xl text-neutral-700 shadow-sm
                  transition-transform duration-300 group-hover:-translate-y-1
                "
              >
                ↑
              </div>

              <p className="mt-4 text-sm font-medium text-neutral-900">
                {fileName || "Chọn file từ vựng"}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                {fileName ? "File đã được chọn" : "Định dạng hỗ trợ: .txt"}
              </p>

              <input
                id="file-upload"
                type="file"
                accept=".txt"
                onChange={handleFile}
                className="sr-only"
              />
            </label>

            {words.length > 0 && (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Đã đọc dữ liệu
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">{fileName}</p>
                </div>
                <div className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
                  {words.length} từ
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  Kiểm tra lại dữ liệu
                </p>
                <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
              </div>
            )}

            {words.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      Xem trước
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Kiểm tra dữ liệu trước khi lưu
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {words.length} entries
                  </span>
                </div>

                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {words.map((w, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
                    >
                      <div className="flex items-start gap-4">
                        <span className="mt-0.5 text-xs font-medium text-neutral-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold text-neutral-900">
                            {w.term}
                          </p>
                          <p className="mt-1 break-words text-sm text-neutral-600">
                            {w.meaning || "Chưa có nghĩa"}
                          </p>
                          <p className="mt-2 break-words text-xs italic leading-5 text-neutral-400">
                            {w.example || "(chưa có ví dụ)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !name.trim() || !!error}
            className="
              w-full rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium
              text-white shadow-sm transition-all duration-200 hover:bg-neutral-800
              hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {saving
              ? "Đang tạo..."
              : words.length > 0
                ? `Tạo bộ và lưu ${words.length} từ`
                : "Tạo bộ từ vựng"}
          </button>

          {error && (
            <p className="text-center text-xs text-neutral-400">
              Vui lòng sửa các dòng bị lỗi trước khi tạo bộ.
            </p>
          )}

          <p className="text-center text-xs text-neutral-400">
            File nên dùng UTF-8 để hiển thị tiếng Việt chính xác. Không import
            file cũng được — bạn có thể thêm từ sau.
          </p>
        </form>
      </div>
    </main>
  );
}
