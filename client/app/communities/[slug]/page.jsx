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

  // FETCH COMMUNITY
  const fetchCommunity = async () => {
    try {
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

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const userId = payload.userId;

        const admin = res.data.community.creatorId === userId;

        setIsAdmin(admin);

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

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  // REALTIME SOCKETS
  useEffect(() => {
    const handleNewPost = (newPost) => {
      if (newPost.community?.slug !== slug) return;

      setPosts((prev) => {
        const exists = prev.find((post) => post.id === newPost.id);

        if (exists) return prev;

        if (newPost.visibility === "MEMBERS_ONLY" && !joined && !isAdmin) {
          return prev;
        }

        return [newPost, ...prev];
      });

      setCommunity((prev) => ({
        ...prev,

        _count: {
          ...prev._count,

          posts: prev._count.posts + 1,
        },
      }));
    };

    const handleUpdatedPost = (updatedPost) => {
      if (updatedPost.community?.slug !== slug) return;

      setPosts((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );
    };

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

          communityId: community.id,

          visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  if (loading) {
    return (
      <main className="p-4 sm:p-10 text-sm text-[#6b7280]">
        Loading community...
      </main>
    );
  }

  if (!community) {
    return (
      <main className="p-4 sm:p-10 text-sm text-red-500">
        Community not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f1] px-3 sm:px-4 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        {/* COMMUNITY HEADER */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-[#6b7280] mb-2">
                Community
              </p>

              <h1 className="text-2xl sm:text-4xl break-words font-semibold tracking-tight text-[#111111] mb-3">
                r/{community.slug}
              </h1>

              <p className="text-sm text-[#52525b] leading-6 max-w-2xl break-words">
                {community.description || "No description provided."}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 text-xs sm:text-sm text-[#6b7280]">
                <p>👥 {community._count?.memberships} members</p>

                <p>📝 {community._count?.posts} posts</p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {joined ? (
                <button
                  onClick={handleLeave}
                  className="w-full sm:w-auto bg-[#f7f7f7] border border-[#e5e7eb] px-5 py-2.5 rounded-full text-sm"
                >
                  Joined
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="w-full sm:w-auto bg-[#111111] text-white px-5 py-2.5 rounded-full text-sm"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CREATE POST */}
        {isAdmin && (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-5 sm:mb-6">
            <h2 className="text-sm font-semibold text-[#111111] mb-4 break-words">
              Create Post in r/{community.slug}
            </h2>

            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none mb-3"
            />

            <textarea
              placeholder="Share something with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none resize-none h-28 sm:h-32"
            />

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none text-sm mt-3"
            >
              <option value="PUBLIC">🌍 Public Post</option>

              <option value="MEMBERS_ONLY">🔒 Members Only</option>
            </select>

            <div className="flex justify-stretch sm:justify-end mt-4">
              <button
                onClick={handleCreatePost}
                disabled={creatingPost}
                className="w-full sm:w-auto bg-[#111111] text-white px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {creatingPost ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        )}

        {/* POSTS */}
        <div className="space-y-4 sm:space-y-5">
          {posts.length === 0 ? (
            <div className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-sm text-[#6b7280]">
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
