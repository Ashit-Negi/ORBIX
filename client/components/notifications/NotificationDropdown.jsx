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
    <div className="absolute right-0 mt-3 w-[360px] bg-white border border-[#e5e7eb] rounded-3xl shadow-2xl overflow-hidden z-50">
      {/* HEADER */}
      <div className="p-5 border-b border-[#f1f1f1] flex items-center justify-between">
        <h2 className="font-semibold text-lg">Notifications</h2>

        <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
          {unreadCount}
        </span>
      </div>

      {/* BODY */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
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
