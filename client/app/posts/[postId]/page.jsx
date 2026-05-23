"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import API from "@/lib/api";

import PostCard from "@/components/PostCard";

export default function SinglePostPage() {
  const params = useParams();

  const postId = params.postId;

  const [post, setPost] = useState(null);

  // FETCH POST
  const fetchPost = async () => {
    try {
      const res = await API.get(`/posts/${postId}`);

      setPost(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (!post) {
    return <div className="p-4 sm:p-10 text-sm text-[#6b7280]">Loading...</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <PostCard
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
      />
    </main>
  );
}
