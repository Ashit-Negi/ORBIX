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
    <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border border-gray-300 rounded-full px-5 py-3 outline-none focus:border-black"
      />

      <button
        onClick={handleSendMessage}
        disabled={sending}
        className="bg-black text-white px-5 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
