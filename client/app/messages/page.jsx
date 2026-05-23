"use client";

import { useEffect, useState } from "react";

import MessageSidebar from "@/components/messages/MessageSidebar";
import ChatWindow from "@/components/messages/ChatWindow";
import EmptyChat from "@/components/messages/EmptyChat";

import socket from "@/lib/socket";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  // CONNECT SOCKET ON PAGE LOAD
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // JOIN USER ROOM
    const token = localStorage.getItem("token");

    const currentUser = token ? JSON.parse(atob(token.split(".")[1])) : null;

    if (currentUser?.userId) {
      socket.emit("join-user-room", currentUser.userId);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-70px)] overflow-hidden">
      {/* MOBILE SIDEBAR */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-auto`}
      >
        <MessageSidebar
          socket={socket}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      </div>

      {/* CHAT AREA */}
      <div
        className={`${
          selectedConversation ? "flex" : "hidden md:flex"
        } flex-1 min-w-0`}
      >
        {selectedConversation ? (
          <ChatWindow
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}
