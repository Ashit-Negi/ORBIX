"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import API from "@/lib/api";

export default function UserSearch() {
  const [query, setQuery] = useState("");

  const [users, setUsers] = useState([]);

  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setUsers([]);

        setCommunities([]);

        return;
      }

      try {
        const [usersRes, communitiesRes] = await Promise.all([
          API.get(`/users/search?q=${query}`),

          API.get(`/communities/search?q=${query}`),
        ]);

        setUsers(usersRes.data);

        setCommunities(communitiesRes.data);
      } catch (error) {
        console.log(error);
      }
    };

    const timer = setTimeout(fetchData, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md hidden md:block">
      {/* INPUT */}
      <input
        type="text"
        placeholder="Search people or communities..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white border border-[#e5e7eb] rounded-full px-4 py-2 text-sm outline-none focus:border-black transition"
      />

      {/* RESULTS */}
      {(users.length > 0 || communities.length > 0) && (
        <div className="absolute top-12 w-full bg-white border border-[#e5e7eb] rounded-2xl shadow-xl overflow-hidden z-50">
          {/* USERS */}
          {users.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-[#71717a] uppercase">
                People
              </p>

              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  onClick={() => {
                    setQuery("");

                    setUsers([]);

                    setCommunities([]);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f7f7] transition"
                >
                  {/* IMAGE */}
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt="profile"
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  {/* INFO */}
                  <div>
                    <p className="text-sm font-medium text-black">
                      {user.name}
                    </p>

                    <p className="text-xs text-[#71717a]">@{user.username}</p>

                    {user.bio && (
                      <p className="text-xs text-[#52525b] mt-1 line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* COMMUNITIES */}
          {communities.length > 0 && (
            <div className="p-2 border-t border-[#f1f1f1]">
              <p className="px-3 py-2 text-xs font-semibold text-[#71717a] uppercase">
                Communities
              </p>

              {communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  onClick={() => {
                    setQuery("");

                    setUsers([]);

                    setCommunities([]);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f7f7] transition"
                >
                  {/* COMMUNITY ICON */}
                  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    {community.name?.charAt(0)}
                  </div>

                  {/* INFO */}
                  <div>
                    <p className="text-sm font-medium text-black">
                      {community.name}
                    </p>

                    {community.description && (
                      <p className="text-xs text-[#71717a] line-clamp-1">
                        {community.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
