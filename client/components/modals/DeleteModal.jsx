export default function DeleteCommentModal({
  showDeleteModal,
  closeDeleteModal,
  handleDeleteComment,
}) {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#111111] mb-2">
          Delete Comment
        </h2>

        <p className="text-sm text-[#6b7280] leading-6 mb-6">
          Are you sure you want to delete this comment?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 rounded-2xl border border-[#e5e7eb] text-sm hover:bg-[#f7f7f7]"
          >
            Cancel
          </button>

          <button
            onClick={handleDeleteComment}
            className="px-4 py-2 rounded-2xl bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
