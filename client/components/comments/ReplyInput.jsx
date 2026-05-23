export default function ReplyInput({ replyText, setReplyText, handleReply }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-3">
      {/* INPUT */}
      <input
        type="text"
        placeholder="Write a reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="flex-1 w-full min-w-0 bg-white border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm sm:text-base outline-none"
      />

      {/* BUTTON */}
      <button
        onClick={handleReply}
        className="w-full sm:w-auto shrink-0 bg-black text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 transition"
      >
        Reply
      </button>
    </div>
  );
}
