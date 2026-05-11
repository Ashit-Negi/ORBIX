"use client";

import { useState, useEffect } from "react";

import API from "../../lib/api";

import formatTime from "../utils/formatTime";

import ReplyInput from "./ReplyInput";

export default function CommentItem({
  comment,
  loggedInUserId,
  editingCommentId,
  editText,
  setEditText,
  startEditing,
  handleUpdateComment,
  openDeleteModal,
  token,
  postId,
  depth = 0,
}) {
  const [activeReplyId, setActiveReplyId] = useState(null);

  const [replyText, setReplyText] = useState("");

  const [replyingTo, setReplyingTo] = useState("");

  const [localLikes, setLocalLikes] = useState(comment.likes || []);

  // LOAD MORE REPLIES
  const [visibleReplies, setVisibleReplies] = useState(2);

  const currentUserLiked = localLikes.find(
    (like) => like.userId === loggedInUserId,
  );

  useEffect(() => {
    setLocalLikes(comment.likes || []);
  }, [comment.likes]);

  // CREATE REPLY
  const handleReply = async () => {
    try {
      if (!token) {
        alert("Please login first");

        return;
      }

      // ALWAYS REPLY TO TOP LEVEL COMMENT
      const topLevelParentId = comment.parentId || comment.id;

      await API.post(
        "/comments/create",
        {
          content: depth > 0 ? `@${replyingTo} ${replyText}` : replyText,

          postId,

          parentId: topLevelParentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReplyText("");

      setReplyingTo("");

      setActiveReplyId(null);
    } catch (error) {
      console.log(error);
    }
  };

  // TOGGLE LIKE
  const handleCommentLike = async () => {
    try {
      if (!token) {
        alert("Please login first");

        return;
      }

      // OPTIMISTIC UPDATE
      if (currentUserLiked) {
        setLocalLikes((prev) =>
          prev.filter((like) => like.userId !== loggedInUserId),
        );
      } else {
        setLocalLikes((prev) => [
          ...prev,
          {
            userId: loggedInUserId,
          },
        ]);
      }

      await API.post(
        "/comment-likes/toggle",
        {
          commentId: comment.id,
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
  useEffect(() => {
    setVisibleReplies(2);
  }, [comment.replies]);

  return (
    <div
      className={`${
        depth === 0
          ? "bg-[#f7f7f7] rounded-2xl p-4"
          : "mt-4 pl-4 border-l border-[#e5e7eb]"
      }`}
    >
      <div className="flex gap-3">
        {/* AVATAR */}
        <div className="w-8 h-8 rounded-full bg-[#e5e7eb] flex-shrink-0"></div>

        <div className="flex-1 min-w-0">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111111]">
                {comment.author.username}
              </p>

              <p className="text-xs text-[#6b7280]">
                {formatTime(comment.createdAt)}
              </p>
            </div>

            {/* OWNER ACTIONS */}
            {comment.author.id === loggedInUserId && (
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => startEditing(comment)}
                  className="text-[#6b7280] hover:text-black"
                >
                  Edit
                </button>

                <button
                  onClick={() => openDeleteModal(comment.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* CONTENT */}
          {editingCommentId === comment.id ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 bg-white border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none"
              />

              <button
                onClick={() => handleUpdateComment(comment.id)}
                className="bg-black text-white px-3 rounded-xl text-sm"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#52525b] mt-2 leading-6 break-words">
              {comment.content}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-5 mt-3">
            {/* LIKE */}
            <button
              onClick={handleCommentLike}
              className={`text-xs font-medium flex items-center gap-1 transition ${
                currentUserLiked ? "text-red-500" : "text-[#6b7280]"
              }`}
            >
              {currentUserLiked ? "❤️" : "🤍"}

              {localLikes.length}
            </button>

            {/* REPLY */}
            <button
              onClick={() => {
                setActiveReplyId(comment.id);

                setReplyingTo(comment.author.username);
              }}
              className="text-xs text-[#6b7280] hover:text-black"
            >
              Reply
            </button>
          </div>

          {/* REPLY INPUT */}
          {activeReplyId === comment.id && (
            <div className="mt-3">
              <ReplyInput
                replyText={replyText}
                setReplyText={setReplyText}
                handleReply={handleReply}
              />
            </div>
          )}

          {/* REPLIES */}
          {depth === 0 && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 ml-4">
              {comment.replies.slice(0, visibleReplies).map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  loggedInUserId={loggedInUserId}
                  editingCommentId={editingCommentId}
                  editText={editText}
                  setEditText={setEditText}
                  startEditing={startEditing}
                  handleUpdateComment={handleUpdateComment}
                  openDeleteModal={openDeleteModal}
                  token={token}
                  postId={postId}
                  depth={1}
                />
              ))}

              {/* LOAD MORE REPLIES */}
              {visibleReplies < comment.replies.length && (
                <button
                  onClick={() => setVisibleReplies((prev) => prev + 5)}
                  className="text-xs font-medium text-[#6b7280] hover:text-black transition"
                >
                  View more replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
