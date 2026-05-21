"use client";

import { useEffect, useState } from "react";

import API from "../lib/api";

import CommentSection from "./comments/CommentSection";

import socket from "../lib/socket";
import Link from "next/link";

export default function PostCard({
  id,
  author,
  authorId,
  title,
  content,
  commentCount,
  votes,
  community,
  onDelete,
}) {
  const [showComments, setShowComments] = useState(false);

  const [localVotes, setLocalVotes] = useState(votes || []);

  const [localCommentCount, setLocalCommentCount] = useState(commentCount || 0);

  const [isEditing, setIsEditing] = useState(false);

  const [editedTitle, setEditedTitle] = useState(title);

  const [editedContent, setEditedContent] = useState(content);

  const [localTitle, setLocalTitle] = useState(title);

  const [localContent, setLocalContent] = useState(content);

  const [showMenu, setShowMenu] = useState(false);

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

  // OWNER CHECK
  const isOwner = loggedInUserId === authorId;

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
        let updatedPost = null;

        // COMMUNITY POST
        if (community?.slug) {
          const token = localStorage.getItem("token");

          const res = await API.get(`/communities/${community.slug}/posts`, {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          });

          updatedPost = res.data.posts.find((post) => post.id === id);
        }

        // GLOBAL POST
        else {
          const res = await API.get("/posts");

          updatedPost = res.data.find((post) => post.id === id);
        }

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

  // REALTIME POST UPDATE + DELETE
  useEffect(() => {
    const handlePostUpdated = (updatedPost) => {
      if (updatedPost.id !== id) return;

      setLocalTitle(updatedPost.title);

      setLocalContent(updatedPost.content);
    };

    const handlePostDeleted = (data) => {
      if (data.postId !== id) return;

      if (onDelete) {
        onDelete(id);
      }
    };

    socket.on("post-updated", handlePostUpdated);

    socket.on("post-deleted", handlePostDeleted);

    return () => {
      socket.off("post-updated", handlePostUpdated);

      socket.off("post-deleted", handlePostDeleted);
    };
  }, [id, onDelete]);

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
    const shareUrl = `${window.location.origin}/posts/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: localTitle,
          text: localContent,
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

  // HANDLE DELETE
  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post?",
      );

      if (!confirmDelete) return;

      // OPTIMISTIC DELETE
      if (onDelete) {
        onDelete(id);
      }

      await API.delete(`/posts/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log(error);

      alert("Failed to delete post");
    }
  };

  // HANDLE EDIT
  const handleEdit = async () => {
    try {
      // OPTIMISTIC UPDATE
      setLocalTitle(editedTitle);

      setLocalContent(editedContent);

      await API.put(
        `/posts/edit/${id}`,
        {
          title: editedTitle,
          content: editedContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIsEditing(false);
    } catch (error) {
      console.log(error);

      alert("Failed to update post");
    }
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-3xl p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#ececeb]"></div>

          <div>
            <Link
              href={`/profile/${author}`}
              className="font-medium text-[#111111] text-sm sm:text-base hover:underline"
            >
              {author}
            </Link>

            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              {community && (
                <p>
                  Posted in{" "}
                  <span className="text-[#111111] font-medium">
                    r/{community.slug}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3 DOT MENU */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full hover:bg-[#f7f7f7] transition text-[#6b7280] text-xl"
            >
              ⋯
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 bg-white border border-[#e5e7eb] rounded-2xl shadow-lg p-2 w-40 z-50">
                <button
                  onClick={() => {
                    setIsEditing(true);

                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f7f7f7] text-sm"
                >
                  ✏ Edit Post
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#fef2f2] text-sm text-red-500"
                >
                  🗑 Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TITLE */}
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none mb-4"
        />
      ) : (
        <h2 className="text-[22px] sm:text-[28px] leading-[30px] sm:leading-[36px] font-semibold tracking-tight text-[#111111] mb-4 break-words">
          {localTitle}
        </h2>
      )}

      {/* CONTENT */}
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none resize-none h-32"
        />
      ) : (
        <p className="text-[#52525b] leading-7 sm:leading-8 text-[14px] sm:text-[15px] break-words">
          {localContent}
        </p>
      )}

      {/* SAVE BUTTON */}
      {isEditing && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleEdit}
            className="bg-black text-white px-5 py-2 rounded-full text-sm"
          >
            Save Changes
          </button>
        </div>
      )}

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
