"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import API from "../lib/api";

import PostCard from "../components/PostCard";

import socket from "../lib/socket";

export default function Home() {
  const [posts, setPosts] = useState([]);

  const [communities, setCommunities] = useState([]);

  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

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

  // FETCH SUGGESTED USERS
  const fetchSuggestedUsers = async () => {
    try {
      const res = await API.get("/users/suggested");

      setSuggestedUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPosts();

    fetchCommunities();

    fetchSuggestedUsers();
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

    socket.on("new-post", handleNewPost);

    socket.on("post-updated", handleUpdatedPost);

    socket.on("post-deleted", handleDeletePost);

    socket.on("new-community", handleNewCommunity);

    return () => {
      socket.off("new-post", handleNewPost);

      socket.off("post-updated", handleUpdatedPost);

      socket.off("post-deleted", handleDeletePost);

      socket.off("new-community", handleNewCommunity);
    };
  }, []);

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

          communityId: null,
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
                Your Communities
              </h2>

              <Link
                href="/communities/create"
                className="text-xs text-[#111111]"
              >
                + Create
              </Link>
            </div>

            <div className="space-y-3">
              {communities.slice(0, 6).map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="block"
                >
                  <div className="hover:bg-[#f7f7f7] rounded-2xl p-3 transition border border-transparent hover:border-[#ececec]">
                    <p className="font-medium text-sm text-[#111111]">
                      {community.name}
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

        {/* MAIN CONTENT */}
        <section className="col-span-9 space-y-5">
          {/* TOP GRID */}
          <div className="grid grid-cols-12 gap-5">
            {/* FEED HEADER */}
            <div className="col-span-7 bg-white border border-[#e5e7eb] rounded-3xl p-6">
              <p className="text-sm text-[#71717a] mb-2">Welcome back 👋</p>

              <h1 className="text-2xl font-semibold text-[#111111] leading-snug">
                Discover conversations from your network.
              </h1>
            </div>

            {/* PEOPLE YOU MAY KNOW */}
            <div className="col-span-5 bg-white border border-[#e5e7eb] rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#111111]">
                  People You May Know
                </h2>

                <button className="text-xs text-[#71717a]">View all</button>
              </div>

              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.image || "/default-avatar.png"}
                        alt="profile"
                        className="w-11 h-11 rounded-full object-cover"
                      />

                      <div>
                        <p className="text-sm font-medium text-[#111111]">
                          {user.name}
                        </p>

                        <p className="text-xs text-[#71717a] line-clamp-1">
                          {user.bio || "Orbix User"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/profile/${user.username}`}
                      className="border border-[#e5e7eb] px-3 py-1.5 rounded-full text-xs hover:bg-[#f7f7f7] transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
              authorImage={post.author.image}
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
      </div>
    </main>
  );
}
