export default function DeleteCommentModal({
  showDeleteModal,
  closeDeleteModal,
  handleDeleteComment,
}) {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 animate-in fade-in zoom-in duration-200">
        {/* TITLE */}
        <h2 className="text-lg font-semibold text-[#111111]">Delete Comment</h2>

        {/* MESSAGE */}
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>

        {/* ACTIONS */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            className="h-11 rounded-2xl border border-[#e5e7eb] px-5 text-sm font-medium text-[#52525b] transition hover:bg-[#f7f7f7]"
          >
            Cancel
          </button>

          <button
            onClick={handleDeleteComment}
            className="h-11 rounded-2xl bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
