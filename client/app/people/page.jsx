"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import API from "@/lib/api";

export default function PeoplePage() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users/all");

      setUsers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-sm text-[#71717a] mb-2">Discover people</p>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111]">
          Connect with real users
        </h1>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-gray-500">No users found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-[#e5e7eb] rounded-3xl p-5"
            >
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="profile"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="font-semibold text-[#111111] truncate">
                    {user.name}
                  </h2>

                  <p className="text-sm text-[#71717a] truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#52525b] mt-4 line-clamp-2 min-h-[40px]">
                {user.bio || "No bio added yet"}
              </p>

              <Link
                href={`/profile/${user.username}`}
                className="mt-5 inline-flex w-full justify-center bg-black text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
