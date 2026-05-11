export default function ReplyInput({ replyText, setReplyText, handleReply }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-3">
      {/* INPUT */}
      <input
        type="text"
        placeholder="Write a reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="flex-1 bg-white border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none w-full"
      />

      {/* BUTTON */}
      <button
        onClick={handleReply}
        className="bg-black text-white px-4 py-2 rounded-xl text-sm w-full sm:w-auto"
      >
        Reply
      </button>
    </div>
  );
}
