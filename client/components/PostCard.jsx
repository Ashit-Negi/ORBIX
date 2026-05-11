"use client";

import { useEffect, useState } from "react";

import API from "../lib/api";

import CommentSection from "./comments/CommentSection";

import socket from "../lib/socket";

export default function PostCard({
  id,
  author,
  title,
  content,
  commentCount,
  votes,
}) {
  const [showComments, setShowComments] = useState(false);

  const [localVotes, setLocalVotes] = useState(votes || []);

  const [localCommentCount, setLocalCommentCount] = useState(commentCount || 0);

  // SYNC VOTES ONLY
  useEffect(() => {
    setLocalVotes(votes || []);
  }, [votes]);

  // GET TOKEN
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // GET USER ID
  let loggedInUserId = null;

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));

    loggedInUserId = payload.userId;
  }

  // REALTIME POST LIKE
  useEffect(() => {
    const handlePostLiked = (data) => {
      if (data.postId !== id) return;

      setLocalVotes((prev) => {
        const alreadyLiked = prev.find((vote) => vote.userId === data.userId);

        // USER UNLIKED
        if (data.action === "unliked") {
          return prev.filter((vote) => vote.userId !== data.userId);
        }

        // PREVENT DUPLICATE LIKE
        if (alreadyLiked) {
          return prev;
        }

        // USER LIKED
        return [
          ...prev,
          {
            userId: data.userId,
          },
        ];
      });
    };

    socket.on("post-liked", handlePostLiked);

    return () => {
      socket.off("post-liked", handlePostLiked);
    };
  }, [id]);

  // REALTIME COMMENT COUNT
  useEffect(() => {
    const syncCommentCount = async () => {
      try {
        const res = await API.get("/posts");

        const updatedPost = res.data.find((post) => post.id === id);

        if (updatedPost) {
          setLocalCommentCount(updatedPost.commentCount || 0);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const handleNewComment = (data) => {
      if (data.postId === id) {
        syncCommentCount();
      }
    };

    const handleDeleteComment = (data) => {
      if (data.postId === id) {
        syncCommentCount();
      }
    };

    socket.on("new-comment", handleNewComment);

    socket.on("comment-deleted", handleDeleteComment);

    return () => {
      socket.off("new-comment", handleNewComment);

      socket.off("comment-deleted", handleDeleteComment);
    };
  }, [id]);

  const score = localVotes.length;

  const currentUserVote = localVotes.find(
    (vote) => vote.userId === loggedInUserId,
  );

  // TOGGLE COMMENTS
  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  // HANDLE LIKE
  const handleVote = async () => {
    try {
      if (!token) {
        alert("Please login first");

        return;
      }

      // OPTIMISTIC UPDATE
      if (currentUserVote) {
        setLocalVotes((prev) =>
          prev.filter((vote) => vote.userId !== loggedInUserId),
        );
      } else {
        setLocalVotes((prev) => [
          ...prev,
          {
            userId: loggedInUserId,
          },
        ]);
      }

      await API.post(
        "/votes",
        {
          postId: id,
          value: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  // HANDLE SHARE
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: content,
          url: shareUrl,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);

      alert("Link copied!");
    }
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-3xl p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#ececeb]"></div>

        <div>
          <h3 className="font-medium text-[#111111] text-sm sm:text-base">
            {author}
          </h3>

          <p className="text-xs text-[#6b7280]">Community Member</p>
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-[22px] sm:text-[28px] leading-[30px] sm:leading-[36px] font-semibold tracking-tight text-[#111111] mb-4 break-words">
        {title}
      </h2>

      {/* CONTENT */}
      <p className="text-[#52525b] leading-7 sm:leading-8 text-[14px] sm:text-[15px] break-words">
        {content}
      </p>

      {/* STATS */}
      <div className="flex items-center justify-between mt-6 sm:mt-8 pb-4 border-b border-[#e5e7eb] text-sm text-[#6b7280]">
        <p>❤️ {score}</p>

        <p>💬 {localCommentCount}</p>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-3 gap-2 pt-3">
        {/* LIKE */}
        <button
          onClick={handleVote}
          className={`h-11 rounded-2xl transition text-sm font-medium ${
            currentUserVote
              ? "bg-black text-white"
              : "hover:bg-[#f7f7f7] text-[#52525b]"
          }`}
        >
          ❤️ Like
        </button>

        {/* COMMENT */}
        <button
          onClick={handleToggleComments}
          className="h-11 rounded-2xl hover:bg-[#f7f7f7] transition text-sm font-medium text-[#52525b]"
        >
          {showComments ? "✖ Hide" : "💬 Comment"}
        </button>

        {/* SHARE */}
        <button
          onClick={handleShare}
          className="h-11 rounded-2xl hover:bg-[#f7f7f7] transition text-sm font-medium text-[#52525b]"
        >
          📤 Share
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <CommentSection
          id={id}
          token={token}
          loggedInUserId={loggedInUserId}
          setLocalCommentCount={setLocalCommentCount}
        />
      )}
    </div>
  );
}
