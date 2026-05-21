"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";

import { Bell } from "lucide-react";

import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function Navbar() {
  const [user, setUser] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        setUser(payload);
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-[#f3f3f1]/80 backdrop-blur-md border-b border-[#e7e7e4] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          {/* LOGO */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111]"
          >
            Orbix
          </Link>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-6 text-sm text-[#52525b]">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>

            <Link href="/communities" className="hover:text-black transition">
              Communities
            </Link>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CREATE COMMUNITY */}
          {user && (
            <Link
              href="/communities/create"
              className="hidden sm:flex bg-white border border-[#e5e7eb] px-4 py-2 rounded-full text-sm text-[#111111] hover:bg-[#f7f7f7] transition"
            >
              + Create Community
            </Link>
          )}

          {!user ? (
            <>
              {/* LOGIN */}
              <Link
                href="/login"
                className="text-sm text-[#52525b] hover:text-black transition"
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
              {/* NOTIFICATIONS */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-black/5 transition"
                >
                  <Bell size={22} />
                </button>

                {showNotifications && <NotificationDropdown />}
              </div>

              {/* USERNAME */}
              <p className="text-sm text-[#52525b] hidden sm:block">
                @{user.username || "user"}
              </p>

              {/* PROFILE */}
              <Link
                href={`/profile/${user.username}`}
                className="text-sm bg-black text-white px-4 py-2 rounded-full"
              >
                My Profile
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="bg-[#111111] text-white px-4 sm:px-5 py-2 rounded-full text-sm hover:opacity-90 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
