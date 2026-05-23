"use client";

import { useEffect, useState } from "react";

import socket from "@/lib/socket";

import API from "@/lib/api";

import NotificationCard from "./NotificationCard";

export default function NotificationDropdown({
  setNotificationCount,
  setShowNotifications,
}) {
  const [notifications, setNotifications] = useState([]);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");

      setNotifications(res.data);

      // ONLY UNREAD COUNT
      const unreadCount = res.data.filter(
        (notification) => !notification.read,
      ).length;

      setNotificationCount(unreadCount);
    } catch (error) {
      console.log(error);
    }
  };

  // MARK AS READ
  const markAsRead = async () => {
    try {
      await API.put("/notifications/read");

      setNotificationCount(0);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    markAsRead();

    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // JOIN ROOM
      socket.emit("join-user-room", payload.userId);
    }

    // REALTIME NOTIFICATIONS
    socket.on("new-notification", (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === notification.id);

        if (exists) return prev;

        return [notification, ...prev];
      });

      // REALTIME UNREAD COUNT
      setNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new-notification");
    };
  }, []);

  // ACCEPT REQUEST
  const acceptRequest = async (connectionId) => {
    try {
      await API.put(`/connections/accept/${connectionId}`);

      // REMOVE OLD REQUEST
      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.connectionId !== connectionId,
        ),
      );

      // REFETCH
      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  // UNREAD COUNT
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  console.log(notifications);

  return (
    <div
      className="
    absolute
    top-14
    right-0

    z-[999]

    w-[320px]
    max-w-[calc(100vw-16px)]

    sm:w-[380px]

    bg-white
    border
    border-[#e5e7eb]

    rounded-2xl
    sm:rounded-3xl

    shadow-2xl
    overflow-hidden
  "
    >
      {/* HEADER */}
      <div className="p-4 sm:p-5 border-b border-[#f1f1f1] flex items-center justify-between gap-3">
        <h2 className="font-semibold text-base sm:text-lg">Notifications</h2>

        <span className="text-xs bg-black text-white px-2 py-1 rounded-full shrink-0">
          {unreadCount}
        </span>
      </div>

      {/* BODY */}
      <div className="max-h-[75vh] overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <p className="text-sm text-[#6b7280]">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onAccept={acceptRequest}
              setShowNotifications={setShowNotifications}
            />
          ))
        )}
      </div>
    </div>
  );
}
