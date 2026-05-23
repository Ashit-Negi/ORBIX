"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";

import { Bell, MessageCircle, Menu, X } from "lucide-react";

import API from "@/lib/api";
import socket from "@/lib/socket";

import NotificationDropdown from "@/components/notifications/NotificationDropdown";

import UserSearch from "@/components/search/UserSearch";

export default function Navbar() {
  const [user, setUser] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  // GET USER + CONNECT SOCKET
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        setUser(payload);

        // CONNECT SOCKET
        socket.connect();

        // JOIN USER ROOM
        socket.emit("join-user-room", payload.userId);
      } catch (error) {
        console.log(error);
      }
    }

    return () => {};
  }, []);

  // REALTIME NOTIFICATIONS
  useEffect(() => {
    socket.on("new-notification", () => {
      setNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new-notification");
    };
  }, []);

  // CLOSE DROPDOWN OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");

    socket.disconnect();

    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-[#f3f3f1]/80 backdrop-blur-md border-b border-[#e7e7e4] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 min-h-16 flex items-center justify-between gap-3">
        {/* LEFT */}
        <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
          {/* LOGO */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111] whitespace-nowrap shrink-0"
          >
            Orbix
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6 text-sm text-[#52525b]">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>

            <Link
              href="/communities"
              className="hover:text-black transition"
            >
              Communities
            </Link>
          </div>

          {/* SEARCH */}
          {user && (
            <div className="hidden md:block flex-1 max-w-md">
              <UserSearch />
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* CREATE COMMUNITY */}
          {user && (
            <Link
              href="/communities/create"
              className="hidden xl:flex bg-white border border-[#e5e7eb] px-4 py-2 rounded-full text-sm text-[#111111] hover:bg-[#f7f7f7] transition whitespace-nowrap"
            >
              + Create Community
            </Link>
          )}

          {!user ? (
            <>
              {/* LOGIN */}
              <Link
                href="/login"
                className="hidden sm:block text-sm text-[#52525b] hover:text-black transition"
              >
                Login
              </Link>

              {/* REGISTER */}
              <Link
                href="/register"
                className="bg-[#111111] text-white px-4 sm:px-5 py-2 rounded-full text-sm whitespace-nowrap hover:opacity-90 transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* DESKTOP SEARCH MOBILE */}
              <div className="md:hidden">
                <button
                  onClick={() =>
                    setMobileMenuOpen((prev) => !prev)
                  }
                  className="p-2 rounded-full hover:bg-black/5 transition"
                >
                  {mobileMenuOpen ? (
                    <X size={22} />
                  ) : (
                    <Menu size={22} />
                  )}
                </button>
              </div>

              {/* MESSAGES */}
              <Link
                href="/messages"
                className="relative p-2 rounded-full hover:bg-black/5 transition"
              >
                <MessageCircle size={22} />
              </Link>

              {/* NOTIFICATIONS */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={async () => {
                    const newState = !showNotifications;

                    setShowNotifications(newState);

                    // MARK AS READ
                    if (newState) {
                      try {
                        await API.put("/notifications/read");

                        setNotificationCount(0);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                  className="relative p-2 rounded-full hover:bg-black/5 transition"
                >
                  <div className="relative">
                    <Bell size={22} />

                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                        {notificationCount > 99
                          ? "99+"
                          : notificationCount}
                      </span>
                    )}
                  </div>
                </button>

                {showNotifications && (
                  <NotificationDropdown
                    setNotificationCount={
                      setNotificationCount
                    }
                    setShowNotifications={
                      setShowNotifications
                    }
                  />
                )}
              </div>

              {/* USERNAME */}
              <p className="text-sm text-[#52525b] hidden lg:block">
                @{user.username || "user"}
              </p>

              {/* PROFILE */}
              <Link
                href={`/profile/${user.username}`}
                className="hidden sm:block text-sm bg-black text-white px-4 py-2 rounded-full whitespace-nowrap"
              >
                My Profile
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="hidden sm:block bg-[#111111] text-white px-4 sm:px-5 py-2 rounded-full text-sm hover:opacity-90 transition whitespace-nowrap"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-[#e7e7e4] bg-[#f3f3f1] px-3 py-4 space-y-4">
          {/* SEARCH */}
          <UserSearch />

          {/* NAV LINKS */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-2xl bg-white border border-[#e5e7eb] text-sm"
            >
              Home
            </Link>

            <Link
              href="/communities"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-2xl bg-white border border-[#e5e7eb] text-sm"
            >
              Communities
            </Link>

            <Link
              href="/communities/create"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-2xl bg-white border border-[#e5e7eb] text-sm"
            >
              + Create Community
            </Link>

            <Link
              href={`/profile/${user.username}`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-2xl bg-black text-white text-sm"
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-2xl bg-[#111111] text-white text-sm text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}