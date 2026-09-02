"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  /** Sau khi đăng xuất, điều hướng về đây. Mặc định "/" */
  callbackUrl?: string;
}

export default function LogoutButton({
  className,
  callbackUrl = "/",
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    const confirmed = window.confirm("Bạn có chắc muốn đăng xuất?");
    if (!confirmed) return;

    setLoading(true);
    await signOut({ callbackUrl });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Đăng xuất"
      className={
        className ??
        `
        flex items-center gap-1 sm:gap-1.5
        rounded-xl border border-neutral-200 bg-white
        px-2.5 py-2 sm:px-3.5
        text-xs font-medium text-neutral-600
        transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900
        disabled:cursor-not-allowed disabled:opacity-40
      `
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 shrink-0"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>

      <span className="hidden sm:inline">
        {loading ? "Đang đăng xuất..." : "Đăng xuất"}
      </span>
    </button>
  );
}
