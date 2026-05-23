export default function EmptyState({ title, description }) {
  return (
    <div className="dark-card rounded-[24px] sm:rounded-[32px] p-8 sm:p-14 text-center">
      {/* ICON */}
      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/5 border border-white/5 mx-auto flex items-center justify-center text-3xl sm:text-4xl">
        💬
      </div>

      {/* TITLE */}
      <h2 className="text-2xl sm:text-3xl font-semibold mt-5 sm:mt-7 tracking-tight break-words">
        {title}
      </h2>

      {/* DESCRIPTION */}
      <p className="text-[#9ca3af] mt-3 sm:mt-4 max-w-lg mx-auto leading-7 sm:leading-8 text-sm sm:text-base break-words">
        {description}
      </p>
    </div>
  );
}
