"use client";

import { useEffect, useState } from "react";

import API from "../lib/api";

import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");

      setPosts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

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

      // REFRESH POSTS
      fetchPosts();
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
            <h2 className="text-sm font-semibold text-[#111111] mb-5">
              Explore
            </h2>

            <div className="space-y-4 text-sm text-[#52525b]">
              <p>Home</p>
              <p>Communities</p>
              <p>Trending</p>
              <p>Discussions</p>
            </div>
          </div>
        </aside>

        {/* MAIN FEED */}
        <section className="col-span-6 space-y-5">
          {/* CREATE POST */}
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none mb-3"
            />

            <textarea
              placeholder="Share something with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none resize-none h-32"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreatePost}
                className="bg-[#111111] text-white px-5 py-2 rounded-full text-sm hover:opacity-90 transition"
              >
                Publish
              </button>
            </div>
          </div>

          {/* DYNAMIC POSTS */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              author={post.author.username}
              title={post.title}
              content={post.content}
              commentCount={post.commentCount}
              votes={post.votes}
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
              <div>
                <p className="font-medium text-sm text-[#111111]">Design</p>

                <p className="text-xs text-[#6b7280]">12k members</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
