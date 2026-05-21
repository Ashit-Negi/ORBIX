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
    <div className="flex h-[calc(100vh-70px)]">
      {/* SIDEBAR */}
      <MessageSidebar
        socket={socket}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />

      {/* CHAT AREA */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow selectedConversation={selectedConversation} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}
