"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import API from "@/lib/api";

import PostCard from "@/components/PostCard";

export default function SinglePostPage() {
  const params = useParams();

  const postId = params.postId;

  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await API.get(`/posts/${postId}`);

      setPost(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!post) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <PostCard
        id={post.id}
        author={post.author.username}
        authorId={post.author.id}
        title={post.title}
        content={post.content}
        commentCount={post.commentCount}
        votes={post.votes}
        community={post.community}
      />
    </main>
  );
}
