export default function CommentInput({
  commentText,
  setCommentText,
  handleCreateComment,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* INPUT */}
      <input
        type="text"
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="flex-1 bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none text-sm w-full"
      />

      {/* BUTTON */}
      <button
        onClick={handleCreateComment}
        className="bg-[#111111] text-white px-5 py-3 rounded-2xl text-sm w-full sm:w-auto"
      >
        Post
      </button>
    </div>
  );
}
