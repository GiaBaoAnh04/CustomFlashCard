"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: deckId } = use(params);

  const [words, setWords] = useState<ParsedWord[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function handleSave() {
    if (!words.length || error) return;

    setSaving(true);

    try {
      await fetch(`/api/decks/${deckId}/words`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ words }),
      });

      router.push(`/decks/${deckId}/flashcard`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Vocabulary
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Import từ vựng
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Thêm nhiều từ vựng cùng lúc bằng cách tải lên file .txt.
          </p>
        </header>

        {/* Main card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] sm:p-8">
          {/* Format information */}
          <div className="mb-6 rounded-2xl bg-neutral-50 p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-sm text-white">
                i
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Định dạng file
                </p>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Mỗi dòng tương ứng với một từ vựng.
                </p>

                <code className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm">
                  từ | nghĩa | ví dụ
                </code>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <label
            htmlFor="file-upload"
            className="
              group flex min-h-[190px]
              cursor-pointer flex-col
              items-center justify-center
              rounded-2xl border border-dashed
              border-neutral-300
              bg-neutral-50/50
              px-6 py-8
              text-center
              transition-all duration-300
              hover:border-neutral-500
              hover:bg-neutral-50
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-2xl
                bg-white
                text-xl text-neutral-700
                shadow-sm
                transition-transform duration-300
                group-hover:-translate-y-1
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

          {/* Status */}
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

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                Kiểm tra lại dữ liệu
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
            </div>
          )}

          {/* Preview */}
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

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {words.map((w, i) => (
                  <div
                    key={i}
                    className="
                      rounded-xl border border-neutral-200
                      bg-white p-4
                      transition-colors
                      hover:border-neutral-300
                    "
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

          {/* Save */}
          {words.length > 0 && (
            <div className="mt-6 border-t border-neutral-100 pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !!error}
                className="
                  w-full rounded-xl
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
                {saving ? "Đang lưu..." : `Lưu ${words.length} từ vào bộ thẻ`}
              </button>

              {error && (
                <p className="mt-2 text-center text-xs text-neutral-400">
                  Vui lòng sửa các dòng bị lỗi trước khi lưu.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-5 text-center text-xs text-neutral-400">
          File nên sử dụng UTF-8 để hiển thị tiếng Việt chính xác.
        </p>
      </div>
    </main>
  );
}
