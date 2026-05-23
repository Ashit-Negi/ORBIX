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

  const [mediaFile, setMediaFile] = useState(null);

  const [mediaPreview, setMediaPreview] = useState("");

  const [mediaType, setMediaType] = useState("");

  const [uploading, setUploading] = useState(false);

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

  // HANDLE FILE CHANGE
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const isVideo = file.type.startsWith("video");

    // VIDEO SIZE VALIDATION
    if (isVideo && file.size > 30 * 1024 * 1024) {
      alert("Video size should be under 30MB");

      return;
    }

    // IMAGE SIZE VALIDATION
    if (!isVideo && file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB");

      return;
    }

    // VIDEO DURATION VALIDATION
    if (isVideo) {
      const video = document.createElement("video");

      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);

        if (video.duration > 60) {
          alert("Video must be under 60 seconds");

          setMediaFile(null);

          setMediaPreview("");

          return;
        }
      };

      video.src = URL.createObjectURL(file);
    }

    setMediaFile(file);

    setMediaType(isVideo ? "video" : "image");

    setMediaPreview(URL.createObjectURL(file));
  };

  // CREATE POST
  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        return;
      }

      setUploading(true);

      const formData = new FormData();

      formData.append("title", title);

      formData.append("content", content);

      formData.append("communityId", "");

      // MEDIA FILE
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      await API.post("/posts/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "multipart/form-data",
        },
      });

      // CLEAR INPUTS
      setTitle("");

      setContent("");

      setMediaFile(null);

      setMediaPreview("");

      setMediaType("");
    } catch (error) {
      console.log(error);

      alert("Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3">
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
                    <p className="font-medium text-sm text-[#111111] break-words">
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
        <section className="lg:col-span-9 space-y-4 sm:space-y-5 min-w-0">
          {/* CREATE POST */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-4 sm:p-5">
            {/* TITLE */}
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none mb-3"
            />

            {/* CONTENT */}
            <textarea
              placeholder="Share something with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none resize-none h-28 sm:h-32"
            />

            {/* MEDIA PREVIEW */}
            {mediaPreview && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb]">
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="preview"
                    className="w-full max-h-[400px] object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-[400px] object-cover"
                  />
                )}
              </div>
            )}

            {/* FILE INPUT */}
            <div className="mt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-[#f7f7f7] hover:bg-[#ececec] transition px-4 py-2 rounded-full text-sm text-[#111111]">
                📎 Add Photo/Video
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* ACTION */}
            <div className="flex justify-stretch sm:justify-end mt-4">
              <button
                onClick={handleCreatePost}
                disabled={uploading || !title.trim() || !content.trim()}
                className="w-full sm:w-auto bg-[#111111] text-white px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {uploading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>

          {/* POSTS */}
          <div className="space-y-4 sm:space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.author.username}
                authorImage={post.author.image}
                authorId={post.author.id}
                title={post.title}
                content={post.content}
                mediaUrl={post.mediaUrl}
                mediaType={post.mediaType}
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
          </div>
        </section>
      </div>
    </main>
  );
}
