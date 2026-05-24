"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

export default function NotificationCard({
  notification,
  onAccept,
  setShowNotifications,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // HANDLE CLICK
  const handleNavigation = () => {
    setShowNotifications(false);

    // POST
    if (notification.postId) {
      router.push(`/posts/${notification.postId}`);

      return;
    }

    // COMMUNITY
    if (notification.community?.slug) {
      router.push(`/communities/${notification.community.slug}`);

      return;
    }

    // PROFILE
    if (notification.sender?.username) {
      router.push(`/profile/${notification.sender.username}`);
    }
  };

  // ACCEPT REQUEST
  const handleAccept = async (e) => {
    e.stopPropagation();

    try {
      setLoading(true);

      await onAccept(notification.connectionId);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleNavigation}
      className="p-4 sm:p-5 border-b border-[#f3f4f6] hover:bg-[#f8fafc] transition cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3 min-w-0 flex-1">
          {/* USER IMAGE */}
          {notification.sender?.image ? (
            <img
              src={notification.sender.image}
              alt=""
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black text-white flex items-center justify-center font-semibold shrink-0">
              {notification.sender?.username?.charAt(0).toUpperCase() || "O"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#111111] leading-6 break-words">
              {notification.message}
            </p>

            <p className="text-xs text-[#6b7280] mt-1">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ACCEPT BUTTON */}
        {notification.type === "CONNECTION_REQUEST" &&
          notification.connectionId && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white text-sm px-4 py-2 rounded-xl transition shrink-0"
            >
              {loading ? "Accepting..." : "Accept"}
            </button>
          )}
      </div>
    </div>
  );
}
