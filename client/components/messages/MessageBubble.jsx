"use client";

import { useMemo } from "react";

export default function MessageBubble({ message }) {
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");

    return token ? JSON.parse(atob(token.split(".")[1])) : null;
  }, []);

  const isOwnMessage = message.sender.id === currentUser?.userId;

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl break-words overflow-hidden ${
          isOwnMessage
            ? "bg-black text-white"
            : "bg-white border border-gray-200"
        }`}
      >
        <p className="text-sm leading-6 break-words whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </div>
  );
}
