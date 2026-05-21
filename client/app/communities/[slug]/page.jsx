"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import API from "../../../lib/api";

import PostCard from "../../../components/PostCard";

import socket from "../../../lib/socket";

export default function SingleCommunityPage() {
  const params = useParams();

  const slug = params.slug;

  const [community, setCommunity] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [joined, setJoined] = useState(false);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [creatingPost, setCreatingPost] = useState(false);

  const [visibility, setVisibility] = useState("PUBLIC");

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  // REALTIME SOCKETS
  useEffect(() => {
    // NEW POST
    const handleNewPost = (newPost) => {
      // ONLY THIS COMMUNITY
      if (newPost.community?.slug !== slug) return;

      setPosts((prev) => {
        const exists = prev.find((post) => post.id === newPost.id);

        if (exists) return prev;

        // MEMBERS ONLY CHECK
        if (newPost.visibility === "MEMBERS_ONLY" && !joined && !isAdmin) {
          return prev;
        }

        return [newPost, ...prev];
      });

      // POSTS COUNT
      setCommunity((prev) => ({
        ...prev,

        _count: {
          ...prev._count,

          posts: prev._count.posts + 1,
        },
      }));
    };

    // UPDATE POST
    const handleUpdatedPost = (updatedPost) => {
      if (updatedPost.community?.slug !== slug) return;

      setPosts((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );
    };

    // DELETE POST
    const handleDeletePost = ({ postId }) => {
      setPosts((prev) => prev.filter((post) => post.id !== postId));

      setCommunity((prev) => ({
        ...prev,

        _count: {
          ...prev._count,

          posts: Math.max(0, prev._count.posts - 1),
        },
      }));
    };

    // JOIN COMMUNITY
    const handleCommunityJoined = ({ communityId }) => {
      if (communityId !== community?.id) return;

      setCommunity((prev) => ({
        ...prev,

        _count: {
          ...prev._count,

          memberships: prev._count.memberships + 1,
        },
      }));
    };

    // LEAVE COMMUNITY
    const handleCommunityLeft = ({ communityId }) => {
      if (communityId !== community?.id) return;

      setCommunity((prev) => ({
        ...prev,

        _count: {
          ...prev._count,

          memberships: Math.max(0, prev._count.memberships - 1),
        },
      }));
    };

    socket.on("new-post", handleNewPost);

    socket.on("post-updated", handleUpdatedPost);

    socket.on("post-deleted", handleDeletePost);

    socket.on("community-joined", handleCommunityJoined);

    socket.on("community-left", handleCommunityLeft);

    return () => {
      socket.off("new-post", handleNewPost);

      socket.off("post-updated", handleUpdatedPost);

      socket.off("post-deleted", handleDeletePost);

      socket.off("community-joined", handleCommunityJoined);

      socket.off("community-left", handleCommunityLeft);
    };
  }, [slug, joined, isAdmin, community]);

  const fetchCommunity = async () => {
    try {
      // GET TOKEN
      const token = localStorage.getItem("token");

      const res = await API.get(`/communities/${slug}/posts`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      setCommunity(res.data.community);

      setPosts(res.data.posts);

      // CHECK USER
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const userId = payload.userId;

        // CHECK ADMIN
        const admin = res.data.community.creatorId === userId;

        setIsAdmin(admin);

        // CHECK JOINED
        const joinedAlready = res.data.community.memberships?.find(
          (member) => member.userId === userId,
        );

        setJoined(!!joinedAlready);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // JOIN COMMUNITY
  const handleJoin = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        return;
      }

      await API.post(
        `/communities/join/${community.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setJoined(true);

      fetchCommunity();
    } catch (error) {
      console.log(error);
    }
  };

  // LEAVE COMMUNITY
  const handleLeave = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        `/communities/leave/${community.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setJoined(false);

      fetchCommunity();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <main className="p-10 text-sm text-[#6b7280]">Loading community...</main>
    );
  }

  if (!community) {
    return (
      <main className="p-10 text-sm text-red-500">Community not found</main>
    );
  }

  // CREATE POST
  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        return;
      }

      if (!title.trim() || !content.trim()) {
        alert("All fields are required");

        return;
      }

      setCreatingPost(true);

      await API.post(
        "/posts/create",
        {
          title,
          content,

          // AUTO COMMUNITY
          communityId: community.id,

          visibility,
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

      setVisibility("PUBLIC");
    } catch (error) {
      console.log(error);

      alert("Failed to create post");
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f1] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* COMMUNITY HEADER */}
        <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#6b7280] mb-2">Community</p>

              <h1 className="text-4xl font-semibold tracking-tight text-[#111111] mb-3">
                r/{community.slug}
              </h1>

              <p className="text-sm text-[#52525b] leading-6 max-w-2xl">
                {community.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 mt-5 text-sm text-[#6b7280]">
                <p>👥 {community._count?.memberships} members</p>

                <p>📝 {community._count?.posts} posts</p>
              </div>
            </div>

            {/* JOIN BUTTON */}
            {joined ? (
              <button
                onClick={handleLeave}
                className="bg-[#f7f7f7] border border-[#e5e7eb] px-5 py-2 rounded-full text-sm"
              >
                Joined
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="bg-[#111111] text-white px-5 py-2 rounded-full text-sm"
              >
                Join
              </button>
            )}
          </div>
        </div>

        {/* CREATE POST */}
        {isAdmin && (
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-[#111111] mb-4">
              Create Post in r/{community.slug}
            </h2>

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

            {/* VISIBILITY */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none text-sm mt-3"
            >
              <option value="PUBLIC">🌍 Public Post</option>

              <option value="MEMBERS_ONLY">🔒 Members Only</option>
            </select>

            {/* ACTION */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreatePost}
                disabled={creatingPost}
                className="bg-[#111111] text-white px-5 py-2 rounded-full text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {creatingPost ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        )}

        {/* POSTS */}
        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="bg-white border border-[#e5e7eb] rounded-3xl p-8 text-sm text-[#6b7280]">
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
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
            ))
          )}
        </div>
      </div>
    </main>
  );
}
