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
    <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full min-w-0 text-sm sm:text-base border border-gray-300 rounded-full px-4 sm:px-5 py-3 outline-none focus:border-black"
      />

      <button
        onClick={handleSendMessage}
        disabled={sending}
        className="w-full sm:w-auto shrink-0 bg-black text-white px-5 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50 text-sm"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
