"use client";

export default function NotificationCard({ notification, onAccept }) {
  return (
    <div className="p-5 border-b border-[#f3f4f6]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#111111]">
            {notification.message}
          </p>

          <p className="text-xs text-[#6b7280] mt-1">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>

        {notification.type === "CONNECTION_REQUEST" &&
          notification.connectionId && (
            <button
              onClick={() => onAccept(notification.connectionId)}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm px-4 py-2 rounded-xl transition"
            >
              Accept
            </button>
          )}
      </div>
    </div>
  );
}
