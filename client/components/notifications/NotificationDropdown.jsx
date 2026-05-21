"use client";

import { useEffect, useState } from "react";

import API from "@/lib/api";

import NotificationCard from "./NotificationCard";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");

      setNotifications(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ACCEPT REQUEST
  const acceptRequest = async (connectionId) => {
    try {
      await API.put(`/connections/accept/${connectionId}`);

      // REFETCH NOTIFICATIONS
      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-[360px] bg-white border border-[#e5e7eb] rounded-3xl shadow-2xl overflow-hidden z-50">
      {/* HEADER */}
      <div className="p-5 border-b border-[#f1f1f1] flex items-center justify-between">
        <h2 className="font-semibold text-lg">Notifications</h2>

        <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
          {notifications.length}
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
            />
          ))
        )}
      </div>
    </div>
  );
}
