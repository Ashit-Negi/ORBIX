"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import API from "../../lib/api";

import socket from "../../lib/socket";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);

  const [loading, setLoading] = useState(true);

  // FETCH COMMUNITIES
  const fetchCommunities = async () => {
    try {
      const res = await API.get("/communities");

      setCommunities(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // REALTIME SOCKETS
  useEffect(() => {
    // NEW COMMUNITY
    const handleNewCommunity = (community) => {
      setCommunities((prev) => {
        const exists = prev.find((c) => c.id === community.id);

        if (exists) return prev;

        return [community, ...prev];
      });
    };

    // JOIN COMMUNITY
    const handleCommunityJoined = ({ communityId }) => {
      setCommunities((prev) =>
        prev.map((community) => {
          if (community.id === communityId) {
            return {
              ...community,

              _count: {
                ...community._count,

                memberships: community._count.memberships + 1,
              },
            };
          }

          return community;
        }),
      );
    };

    // LEAVE COMMUNITY
    const handleCommunityLeft = ({ communityId }) => {
      setCommunities((prev) =>
        prev.map((community) => {
          if (community.id === communityId) {
            return {
              ...community,

              _count: {
                ...community._count,

                memberships: Math.max(0, community._count.memberships - 1),
              },
            };
          }

          return community;
        }),
      );
    };

    socket.on("new-community", handleNewCommunity);

    socket.on("community-joined", handleCommunityJoined);

    socket.on("community-left", handleCommunityLeft);

    return () => {
      socket.off("new-community", handleNewCommunity);

      socket.off("community-joined", handleCommunityJoined);

      socket.off("community-left", handleCommunityLeft);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f3f1] px-3 sm:px-4 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs sm:text-sm text-[#6b7280] mb-2">
              Explore developer spaces
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
              Communities
            </h1>
          </div>

          <Link
            href="/communities/create"
            className="w-full sm:w-auto text-center bg-[#111111] text-white px-5 py-3 rounded-full text-sm hover:opacity-90 transition"
          >
            + Create Community
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-sm text-[#6b7280]">Loading communities...</div>
        ) : communities.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-sm text-[#6b7280]">
            No communities yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-[#d4d4d8] transition"
              >
                {/* IMAGE */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#f3f4f6] overflow-hidden mb-4 sm:mb-5">
                  {community.image ? (
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>

                {/* NAME */}
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#111111] mb-2 break-words">
                  r/{community.slug}
                </h2>

                {/* DESCRIPTION */}
                <p className="text-sm text-[#6b7280] leading-6 mb-5 line-clamp-3 break-words">
                  {community.description || "No description provided."}
                </p>

                {/* STATS */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#6b7280]">
                  <p>👥 {community._count.memberships} members</p>

                  <p>📝 {community._count.posts} posts</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
