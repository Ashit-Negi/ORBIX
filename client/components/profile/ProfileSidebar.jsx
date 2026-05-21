"use client";

import { useEffect, useState } from "react";

import { Pencil, CalendarDays } from "lucide-react";

import API from "@/lib/api";

import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ProfileSidebar({ profile, setIsEditOpen, isOwner }) {
  const [connectionStatus, setConnectionStatus] = useState("NONE");

  const [loading, setLoading] = useState(false);

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

  return (
    <div className="dark-card glow rounded-[32px] p-6 sticky top-24">
      {/* PROFILE IMAGE */}
      <div className="flex flex-col items-center text-center">
        <div className="w-44 h-44 rounded-full overflow-hidden border-[6px] border-white/10 shadow-2xl">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#111827] flex items-center justify-center text-5xl font-bold">
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* NAME */}
        <h1 className="text-4xl font-bold mt-6 tracking-tight">
          {profile.name || profile.username}
        </h1>

        {/* USERNAME */}
        <p className="text-[#9ca3af] text-lg mt-1">@{profile.username}</p>

        {/* BIO */}
        <p className="text-[#d1d5db] mt-6 leading-7">
          {profile.bio || (
            <span className="text-[#6b7280]">No bio added yet.</span>
          )}
        </p>

        {/* EDIT BUTTON */}
        {isOwner && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="mt-7 border border-white/10 hover:border-[#22c55e]/30 hover:bg-[#22c55e]/10 transition-all duration-300 px-6 py-3 rounded-2xl flex items-center gap-2"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        )}

        {/* CONNECT BUTTON */}
        {!isOwner && (
          <>
            {connectionStatus === "ACCEPTED" ? (
              <button
                onClick={removeConnection}
                disabled={loading}
                className="mt-7 bg-red-500 hover:bg-red-600 transition-all duration-300 px-6 py-3 rounded-2xl font-semibold"
              >
                {loading ? "Loading..." : "Disconnect"}
              </button>
            ) : (
              <button
                onClick={sendConnectionRequest}
                disabled={loading || connectionStatus === "PENDING"}
                className="mt-7 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 transition-all duration-300 px-6 py-3 rounded-2xl font-semibold"
              >
                {loading
                  ? "Loading..."
                  : connectionStatus === "PENDING"
                    ? "Requested"
                    : "Connect"}
              </button>
            )}
          </>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 mt-8 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-r border-white/5">
          <h2 className="text-4xl font-bold text-[#4ade80]">
            {profile.counts.posts}
          </h2>

          <p className="text-[#9ca3af] mt-2">Posts</p>
        </div>

        <div className="p-6 border-b border-white/5">
          <h2 className="text-4xl font-bold text-[#a5b4fc]">
            {profile.counts.comments}
          </h2>

          <p className="text-[#9ca3af] mt-2">Messages</p>
        </div>

        <div className="p-6 border-r border-white/5">
          <h2 className="text-4xl font-bold text-[#fbbf24]">
            {profile.counts.createdCommunities}
          </h2>

          <p className="text-[#9ca3af] mt-2">Communities</p>
        </div>

        <div className="p-6">
          <h2 className="text-4xl font-bold text-[#fb7185]">
            {profile.counts.connections}
          </h2>

          <p className="text-[#9ca3af] mt-2">Connections</p>
        </div>
      </div>

      {/* JOIN DATE */}
      <div className="mt-6 flex items-center justify-center gap-3 text-[#9ca3af]">
        <CalendarDays size={18} />

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
