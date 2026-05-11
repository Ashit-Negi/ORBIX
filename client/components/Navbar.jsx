"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#f3f3f1]/80 backdrop-blur-md border-b border-[#e7e7e4] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111]"
        >
          Orbix
        </Link>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-sm text-[#52525b] hover:text-black transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-[#111111] text-white px-4 sm:px-5 py-2 rounded-full text-sm whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
