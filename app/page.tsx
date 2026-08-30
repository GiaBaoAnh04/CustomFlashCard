"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Deck {
  _id: string;
  name: string;
  language: "en" | "ko";
}

export default function HomePage() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    fetch("/api/decks")
      .then((r) => r.json())
      .then(setDecks);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Bộ từ vựng của tôi</h1>
        <Link
          href="/decks/new"
          className="px-4 py-2 bg-black text-white rounded"
        >
          + Tạo bộ mới
        </Link>
      </div>

      {decks.length === 0 && (
        <p className="text-gray-500">Chưa có bộ từ vựng nào.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {decks.map((d) => (
          <Link
            key={d._id}
            href={`/decks/${d._id}`}
            className="border rounded p-4 hover:border-black"
          >
            <div className="text-xs uppercase text-gray-400">{d.language}</div>
            <div className="font-medium">{d.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
