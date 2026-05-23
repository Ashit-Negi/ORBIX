"use client";

import { useEffect, useState } from "react";

import { Pencil, CalendarDays, MessageCircle } from "lucide-react";

import API from "@/lib/api";
import socket from "@/lib/socket";
import { useRouter } from "next/navigation";

export default function ProfileSidebar({ profile, setIsEditOpen, isOwner }) {
  const router = useRouter();

  const [connectionStatus, setConnectionStatus] = useState("NONE");

  const [loading, setLoading] = useState(false);

  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (isOwner) return;

    fetchConnectionStatus();

    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));

      socket.emit("join-user-room", payload.userId);
    }

    socket.on("connection-updated", (data) => {
      // SAME PROFILE
      if (data.userId === profile.id) {
        setConnectionStatus(data.status);
      }
    });

    return () => {
      socket.off("connection-updated");
    };
  }, [profile]);

  const fetchConnectionStatus = async () => {
    try {
      const res = await API.get(`/connections/status/${profile.id}`);

      setConnectionStatus(res.data.status);
    } catch (error) {
      console.log(error);
    }
  };

  // SEND REQUEST
  const sendConnectionRequest = async () => {
    try {
      setLoading(true);

      await API.post(`/connections/send/${profile.id}`);

      setConnectionStatus("PENDING");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // REMOVE CONNECTION
  const removeConnection = async () => {
    const confirmDisconnect = window.confirm(
      "Are you sure you want to disconnect?",
    );

    if (!confirmDisconnect) return;

    try {
      setLoading(true);

      await API.delete(`/connections/remove/${profile.id}`);

      setConnectionStatus("NONE");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // MESSAGE USER
  const handleMessage = async () => {
    try {
      setMessageLoading(true);

      const res = await API.post("/messages/conversation", {
        receiverId: profile.id,
      });

      const conversation = res.data;

      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <div className="dark-card glow rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:sticky lg:top-24">
      {/* PROFILE IMAGE */}
      <div className="flex flex-col items-center text-center">
        <div className="w-28 h-28 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden border-[6px] border-white/10 shadow-2xl shrink-0">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#111827] flex items-center justify-center text-3xl sm:text-5xl font-bold">
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* NAME */}
        <h1 className="text-2xl sm:text-4xl font-bold mt-5 sm:mt-6 tracking-tight break-words">
          {profile.name || profile.username}
        </h1>

        {/* USERNAME */}
        <p className="text-[#9ca3af] text-sm sm:text-lg mt-1 break-all">
          @{profile.username}
        </p>

        {/* BIO */}
        <p className="text-[#d1d5db] mt-5 sm:mt-6 leading-6 sm:leading-7 text-sm sm:text-base break-words">
          {profile.bio || (
            <span className="text-[#6b7280]">No bio added yet.</span>
          )}
        </p>

        {/* OWNER BUTTON */}
        {isOwner && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="mt-6 sm:mt-7 border border-white/10 hover:border-[#22c55e]/30 hover:bg-[#22c55e]/10 transition-all duration-300 px-5 sm:px-6 py-3 rounded-2xl flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        )}

        {/* OTHER USER BUTTONS */}
        {!isOwner && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-7 w-full">
            {/* CONNECT BUTTON */}
            {connectionStatus === "ACCEPTED" ? (
              <button
                onClick={removeConnection}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 transition-all duration-300 px-5 sm:px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base"
              >
                {loading ? "Loading..." : "Disconnect"}
              </button>
            ) : (
              <button
                onClick={sendConnectionRequest}
                disabled={loading || connectionStatus === "PENDING"}
                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 transition-all duration-300 px-5 sm:px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base"
              >
                {loading
                  ? "Loading..."
                  : connectionStatus === "PENDING"
                    ? "Requested"
                    : "Connect"}
              </button>
            )}

            {/* MESSAGE BUTTON */}
            <button
              onClick={handleMessage}
              disabled={messageLoading || connectionStatus !== "ACCEPTED"}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-white/10 hover:border-[#22c55e]/30 hover:bg-[#22c55e]/10 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 mt-6 sm:mt-8 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-r border-white/5">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#4ade80]">
            {profile.counts.posts}
          </h2>

          <p className="text-[#9ca3af] mt-2 text-xs sm:text-base">Posts</p>
        </div>

        <div className="p-4 sm:p-6 border-b border-white/5">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#a5b4fc]">
            {profile.experiences?.length || 0}
          </h2>

          <p className="text-[#9ca3af] mt-2 text-xs sm:text-base">Experience</p>
        </div>

        <div className="p-4 sm:p-6 border-r border-white/5">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#fbbf24]">
            {profile.counts.createdCommunities}
          </h2>

          <p className="text-[#9ca3af] mt-2 text-xs sm:text-base">
            Communities
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#fb7185]">
            {profile.counts.connections}
          </h2>

          <p className="text-[#9ca3af] mt-2 text-xs sm:text-base">
            Connections
          </p>
        </div>
      </div>

      {/* JOIN DATE */}
      <div className="mt-5 sm:mt-6 flex items-center justify-center gap-3 text-[#9ca3af] text-xs sm:text-base text-center">
        <CalendarDays size={18} className="shrink-0" />

        <p>
          Joined{" "}
          {new Date(profile.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
