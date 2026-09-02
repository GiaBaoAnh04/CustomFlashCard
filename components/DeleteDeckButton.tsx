"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteDeckButtonProps {
  deckId: string;
  deckName: string;
  /** Sau khi xoá thành công, điều hướng về trang này. Mặc định "/" */
  redirectTo?: string;
  /** Gọi thêm khi xoá xong, ví dụ để cập nhật lại danh sách trên UI không cần reload */
  onDeleted?: () => void;
  className?: string;
}

export default function DeleteDeckButton({
  deckId,
  deckName,
  redirectTo = "/",
  onDeleted,
  className,
}: DeleteDeckButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // tránh trigger click của Link/card bên ngoài

    const confirmed = window.confirm(
      `Xoá bộ từ vựng "${deckName}"? Toàn bộ từ vựng bên trong sẽ bị xoá vĩnh viễn, không thể khôi phục.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Xoá thất bại, thử lại sau.");
        return;
      }
      if (onDeleted) {
        onDeleted();
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label={`Xoá bộ từ vựng ${deckName}`}
      className={
        className ??
        `
        flex h-9 w-9 shrink-0 items-center justify-center
        rounded-full border border-neutral-200 bg-white text-neutral-400
        transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600
        disabled:cursor-not-allowed disabled:opacity-40
      `
      }
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      )}
    </button>
  );
}
