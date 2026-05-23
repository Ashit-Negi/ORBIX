"use client";

import { useState } from "react";

import API from "@/lib/api";

export default function MessageInput({ selectedConversation }) {
  const [text, setText] = useState("");

  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);

      await API.post("/messages/send", {
        conversationId: selectedConversation.id,

        text,
      });

      setText("");
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  // ENTER SEND
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="
          flex-1
          min-w-0
          text-sm
          border
          border-gray-300
          rounded-full
          px-4
          py-3
          outline-none
          focus:border-black
          bg-white
        "
        />

        <button
          onClick={handleSendMessage}
          disabled={sending}
          className="
          shrink-0
          bg-black
          text-white
          px-5
          py-3
          rounded-full
          hover:opacity-90
          transition
          disabled:opacity-50
          text-sm
        "
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
