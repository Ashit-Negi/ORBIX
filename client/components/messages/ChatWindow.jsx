"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import API from "@/lib/api";
import socket from "@/lib/socket";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({ selectedConversation }) {
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // CURRENT USER
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");

    return token ? JSON.parse(atob(token.split(".")[1])) : null;
  }, []);

  // OTHER USER
  const otherUser = selectedConversation?.participants?.find(
    (participant) => participant.user.id !== currentUser?.userId,
  )?.user;

  // SOCKET CONNECT
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("receive-message");
    };
  }, []);

  // FETCH + JOIN ROOM
  useEffect(() => {
    if (!selectedConversation) return;

    setMessages([]);

    fetchMessages();

    // JOIN ROOM
    socket.emit("join-conversation", selectedConversation.id);

    return () => {
      socket.emit("leave-conversation", selectedConversation.id);
    };
  }, [selectedConversation]);

  // REALTIME RECEIVE
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      // ONLY CURRENT CONVERSATION
      if (newMessage.conversationId !== selectedConversation?.id) {
        return;
      }

      setMessages((prev) => {
        // DUPLICATE PREVENTION
        const exists = prev.find((message) => message.id === newMessage.id);

        if (exists) return prev;

        return [...prev, newMessage];
      });
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [selectedConversation]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // FETCH MESSAGES
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/messages/${selectedConversation.id}`);

      setMessages(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* HEADER */}
      <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center">
        <div className="flex items-center gap-3">
          <img
            src={otherUser?.image || "https://placehold.co/100x100"}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <h2 className="font-semibold text-lg">
              {otherUser?.name || otherUser?.username}
            </h2>

            <p className="text-xs text-gray-500">@{otherUser?.username}</p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">
            No messages yet
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <MessageInput selectedConversation={selectedConversation} />
    </div>
  );
}
