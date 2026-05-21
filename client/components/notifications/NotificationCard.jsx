"use client";

import { useRouter } from "next/navigation";

export default function NotificationCard({
  notification,
  onAccept,
  setShowNotifications,
}) {
  const router = useRouter();

  // HANDLE CLICK
  const handleNavigation = () => {
    // POST
    setShowNotifications(false);
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

  return (
    <div
      onClick={handleNavigation}
      className="p-5 border-b border-[#f3f4f6] hover:bg-[#f8fafc] transition cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          {/* USER IMAGE */}
          {notification.sender?.image ? (
            <img
              src={notification.sender.image}
              alt=""
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-semibold">
              {notification.sender?.username?.charAt(0).toUpperCase() || "O"}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-[#111111] leading-6">
              {notification.message}
            </p>

            <p className="text-xs text-[#6b7280] mt-1">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ACCEPT */}
        {notification.type === "CONNECTION_REQUEST" &&
          notification.connectionId && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                onAccept(notification.connectionId);
              }}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm px-4 py-2 rounded-xl transition"
            >
              Accept
            </button>
          )}
      </div>
    </div>
  );
}
