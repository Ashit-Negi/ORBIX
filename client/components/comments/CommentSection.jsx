"use client";

import { useEffect, useState } from "react";

import API from "../../lib/api";

import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import DeleteCommentModal from "./DeleteCommentModal";
import socket from "../../lib/socket";

export default function CommentSection({ id, token, loggedInUserId }) {
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);

  const [editText, setEditText] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedCommentId, setSelectedCommentId] = useState(null);

  // LOAD MORE COMMENTS
  const [visibleComments, setVisibleComments] = useState(2);

  const [sortBy, setSortBy] = useState("top");

  // FETCH COMMENTS
  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${id}?sort=${sortBy}`);

      setComments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // SOCKET EVENTS
  useEffect(() => {
    fetchComments();

    // NEW COMMENT
    const handleNewComment = (data) => {
      if (data.postId === id) {
        fetchComments();
      }
    };

    // COMMENT LIKE
    const handleCommentLiked = (data) => {
      if (data.postId === id) {
        fetchComments();
      }
    };

    // COMMENT UPDATED
    const handleCommentUpdated = (data) => {
      if (data.postId === id) {
        fetchComments();
      }
    };

    // COMMENT DELETED
    const handleCommentDeleted = (data) => {
      if (data.postId === id) {
        fetchComments();
      }
    };

    socket.on("new-comment", handleNewComment);

    socket.on("comment-liked", handleCommentLiked);

    socket.on("comment-updated", handleCommentUpdated);

    socket.on("comment-deleted", handleCommentDeleted);

    return () => {
      socket.off("new-comment", handleNewComment);

      socket.off("comment-liked", handleCommentLiked);

      socket.off("comment-updated", handleCommentUpdated);

      socket.off("comment-deleted", handleCommentDeleted);
    };
  }, [id, sortBy]);

  // CREATE COMMENT
  const handleCreateComment = async () => {
    try {
      if (!token) {
        alert("Please login first");

        return;
      }

      if (!commentText.trim()) {
        return;
      }

      await API.post(
        "/comments/create",
        {
          content: commentText,
          postId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };

  // OPEN DELETE MODAL
  const openDeleteModal = (commentId) => {
    setSelectedCommentId(commentId);

    setShowDeleteModal(true);
  };

  // CLOSE DELETE MODAL
  const closeDeleteModal = () => {
    setSelectedCommentId(null);

    setShowDeleteModal(false);
  };

  // DELETE COMMENT
  const handleDeleteComment = async () => {
    try {
      await API.delete(`/comments/delete/${selectedCommentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      closeDeleteModal();
    } catch (error) {
      console.log(error);
    }
  };

  // START EDIT
  const startEditing = (comment) => {
    setEditingCommentId(comment.id);

    setEditText(comment.content);
  };

  // UPDATE COMMENT
  const handleUpdateComment = async (commentId) => {
    try {
      await API.put(
        `/comments/update/${commentId}`,
        {
          content: editText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditingCommentId(null);

      setEditText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mt-6 border-t border-[#e5e7eb] pt-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h3 className="text-sm font-medium text-[#111111]">Comments</h3>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full sm:w-auto bg-white border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="top">Top</option>

          <option value="newest">Newest</option>

          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* INPUT */}
      <CommentInput
        commentText={commentText}
        setCommentText={setCommentText}
        handleCreateComment={handleCreateComment}
      />

      {/* COMMENTS */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <div className="text-sm text-[#6b7280]">No comments yet.</div>
        )}

        {comments.slice(0, visibleComments).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            loggedInUserId={loggedInUserId}
            editingCommentId={editingCommentId}
            editText={editText}
            setEditText={setEditText}
            startEditing={startEditing}
            handleUpdateComment={handleUpdateComment}
            openDeleteModal={openDeleteModal}
            token={token}
            postId={id}
          />
        ))}

        {/* LOAD MORE */}
        {visibleComments < comments.length && (
          <button
            onClick={() => setVisibleComments((prev) => prev + 5)}
            className="text-sm font-medium text-[#6b7280] hover:text-black transition"
          >
            Load more comments
          </button>
        )}
      </div>

      {/* DELETE MODAL */}
      <DeleteCommentModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        handleDeleteComment={handleDeleteComment}
      />
    </div>
  );
}
