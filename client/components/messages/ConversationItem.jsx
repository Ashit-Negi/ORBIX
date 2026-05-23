"use client";

import { useMemo } from "react";

export default function ConversationItem({
  conversation,
  selectedConversation,
  setSelectedConversation,
  onlineUsers = [],
}) {
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");

    return token ? JSON.parse(atob(token.split(".")[1])) : null;
  }, []);

  const otherUser = conversation.participants.find(
    (participant) => participant.user.id !== currentUser?.userId,
  )?.user;

  const lastMessage = conversation.messages?.[0];

  const isSelected = selectedConversation?.id === conversation.id;

  const isOnline = onlineUsers.includes(otherUser?.id);

  return (
    <button
      onClick={() => setSelectedConversation(conversation)}
      className={`w-full flex items-center gap-3 p-3 sm:p-4 text-left border-b border-gray-100 transition hover:bg-gray-50 ${
        isSelected ? "bg-gray-100" : ""
      }`}
    >
      {/* PROFILE IMAGE */}
      <div className="relative shrink-0">
        <img
          src={otherUser?.image || "https://placehold.co/100x100"}
          alt="profile"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover"
        />

        {/* ONLINE DOT */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* USER INFO */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm truncate">
            {otherUser?.name || otherUser?.username}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {lastMessage?.text || "Start chatting"}
        </p>
      </div>
    </button>
  );
}
