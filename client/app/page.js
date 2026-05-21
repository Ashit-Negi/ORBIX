"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import API from "../lib/api";

import PostCard from "../components/PostCard";

import socket from "../lib/socket";

export default function Home() {
  const [posts, setPosts] = useState([]);

  const [communities, setCommunities] = useState([]);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [selectedCommunity, setSelectedCommunity] = useState("");

  useEffect(() => {
    fetchPosts();

    fetchCommunities();
  }, []);

  // REALTIME SOCKETS
  useEffect(() => {
    // NEW POST
    const handleNewPost = (newPost) => {
      setPosts((prev) => {
        const exists = prev.find((post) => post.id === newPost.id);

        if (exists) return prev;

        // ONLY GLOBAL POSTS ON HOME
        if (newPost.communityId) return prev;

        return [newPost, ...prev];
      });
    };

    // UPDATE POST
    const handleUpdatedPost = (updatedPost) => {
      setPosts((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );
    };

    // DELETE POST
    const handleDeletePost = (data) => {
      setPosts((prev) => prev.filter((post) => post.id !== data.postId));
    };

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

    socket.on("new-post", handleNewPost);

    socket.on("post-updated", handleUpdatedPost);

    socket.on("post-deleted", handleDeletePost);

    socket.on("new-community", handleNewCommunity);

    socket.on("community-joined", handleCommunityJoined);

    socket.on("community-left", handleCommunityLeft);

    return () => {
      socket.off("new-post", handleNewPost);

      socket.off("post-updated", handleUpdatedPost);

      socket.off("post-deleted", handleDeletePost);

      socket.off("new-community", handleNewCommunity);

      socket.off("community-joined", handleCommunityJoined);

      socket.off("community-left", handleCommunityLeft);
    };
  }, []);

  // FETCH POSTS
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");

      setPosts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH COMMUNITIES
  const fetchCommunities = async () => {
    try {
      const res = await API.get("/communities");

      setCommunities(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // CREATE POST
  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        return;
      }

      await API.post(
        "/posts/create",
        {
          title,
          content,

          // OPTIONAL COMMUNITY
          communityId: selectedCommunity || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // CLEAR INPUTS
      setTitle("");

      setContent("");

      setSelectedCommunity("");
    } catch (error) {
      console.log(error);

      alert("Failed to create post");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <aside className="col-span-3">
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#111111]">
                Communities
              </h2>

              <Link
                href="/communities/create"
                className="text-xs text-[#111111]"
              >
                + Create
              </Link>
            </div>

            <div className="space-y-4">
              {communities.slice(0, 6).map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="block"
                >
                  <div className="hover:bg-[#f7f7f7] rounded-2xl p-3 transition">
                    <p className="font-medium text-sm text-[#111111]">
                      r/
                      {community.slug}
                    </p>

                    <p className="text-xs text-[#6b7280] mt-1">
                      👥 {community._count.memberships} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN FEED */}
        <section className="col-span-6 space-y-5">
          {/* CREATE POST */}
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5">
            {/* TITLE */}
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none mb-3"
            />

            {/* CONTENT */}
            <textarea
              placeholder="Share something with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none resize-none h-32"
            />

            {/* COMMUNITY SELECT */}
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none text-sm mt-3"
            >
              <option value="">Post globally</option>

              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  r/
                  {community.slug}
                </option>
              ))}
            </select>

            {/* ACTION */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreatePost}
                className="bg-[#111111] text-white px-5 py-2 rounded-full text-sm hover:opacity-90 transition"
              >
                Publish
              </button>
            </div>
          </div>

          {/* POSTS */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              author={post.author.username}
              authorId={post.author.id}
              title={post.title}
              content={post.content}
              commentCount={post.commentCount}
              votes={post.votes}
              community={post.community}
              onDelete={(deletedPostId) => {
                setPosts((prev) =>
                  prev.filter((post) => post.id !== deletedPostId),
                );
              }}
            />
          ))}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-3">
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-[#111111] mb-5">
              Trending Communities
            </h2>

            <div className="space-y-4">
              {communities.slice(0, 5).map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="block"
                >
                  <div>
                    <p className="font-medium text-sm text-[#111111]">
                      r/
                      {community.slug}
                    </p>

                    <p className="text-xs text-[#6b7280]">
                      👥 {community._count.memberships} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
