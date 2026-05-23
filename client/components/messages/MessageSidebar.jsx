"use client";

import { useEffect, useMemo, useState } from "react";

import API from "@/lib/api";

import ConversationItem from "./ConversationItem";

export default function MessageSidebar({
  selectedConversation,
  setSelectedConversation,
  socket,
}) {
  const [conversations, setConversations] = useState([]);

  const [connections, setConnections] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  // CURRENT USER
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");

    return token ? JSON.parse(atob(token.split(".")[1])) : null;
  }, []);

  // FETCH SIDEBAR DATA
  const fetchSidebarData = async () => {
    try {
      setLoading(true);

      const [conversationRes, connectionRes] = await Promise.all([
        API.get("/messages/conversations"),

        API.get("/connections/accepted"),
      ]);

      setConversations(conversationRes.data);

      setConnections(connectionRes.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // INITIAL FETCH
  useEffect(() => {
    fetchSidebarData();
  }, []);

  // ONLINE USERS
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, [socket]);

  // REALTIME SIDEBAR UPDATE
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = ({ conversationId, lastMessage }) => {
      setConversations((prev) => {
        const updated = [...prev];

        const index = updated.findIndex(
          (conversation) => conversation.id === conversationId,
        );

        // IF CONVERSATION NOT FOUND
        if (index === -1) {
          fetchSidebarData();

          return prev;
        }

        // UPDATE LAST MESSAGE
        updated[index] = {
          ...updated[index],

          messages: [lastMessage],

          updatedAt: new Date().toISOString(),
        };

        // MOVE TO TOP
        const updatedConversation = updated[index];

        updated.splice(index, 1);

        updated.unshift(updatedConversation);

        return updated;
      });
    };

    socket.on("conversation-updated", handleConversationUpdate);

    return () => {
      socket.off("conversation-updated", handleConversationUpdate);
    };
  }, [socket]);

  // FILTER CONNECTIONS
  const filteredConnections = useMemo(() => {
    const existingChatUserIds = conversations.map((conversation) => {
      const otherUser = conversation.participants.find(
        (participant) => participant.user.id !== currentUser?.userId,
      )?.user;

      return otherUser?.id;
    });

    return connections.filter((user) => {
      const fullName = `${user.name || ""} ${
        user.username || ""
      }`.toLowerCase();

      return fullName.includes(search.toLowerCase());
    });
  }, [connections, conversations, search, currentUser]);

  // START CHAT
  const handleStartConversation = async (receiverId) => {
    try {
      const res = await API.post("/messages/conversation", {
        receiverId,
      });

      const conversation = res.data;

      // ADD TO TOP IF NOT EXISTS
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversation.id);

        if (exists) {
          // MOVE EXISTING TO TOP
          const filtered = prev.filter((c) => c.id !== conversation.id);

          return [conversation, ...filtered];
        }

        return [conversation, ...prev];
      });

      // SELECT CHAT
      setSelectedConversation(conversation);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full md:w-[350px] border-r border-gray-200 bg-white flex flex-col h-full min-w-0">
      {/* HEADER */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold">Messages</h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search connections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mt-4 text-sm sm:text-base border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-black"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* RECENT CHATS */}
        {conversations.length > 0 && (
          <div>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase">
              Recent Chats
            </div>

            {conversations.slice(0, 2).map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                onlineUsers={onlineUsers}
              />
            ))}
          </div>
        )}

        {/* CONNECTIONS */}
        <div>
          <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase">
            Connections
          </div>

          {loading ? (
            <p className="p-4 text-sm text-gray-500">Loading...</p>
          ) : filteredConnections.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No connections found</p>
          ) : (
            filteredConnections.map((user) => (
              <button
                key={user.id}
                onClick={() => handleStartConversation(user.id)}
                className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition text-left border-b border-gray-100"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.image || "https://placehold.co/100x100"}
                    alt="profile"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover"
                  />

                  {onlineUsers.includes(user.id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-medium text-sm truncate">
                    {user.name || user.username}
                  </h3>

                  <p className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
