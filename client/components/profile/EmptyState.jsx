export default function EmptyState({ title, description }) {
  return (
    <div className="dark-card rounded-[32px] p-14 text-center">
      {/* ICON */}
      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 mx-auto flex items-center justify-center text-4xl">
        💬
      </div>

      {/* TITLE */}
      <h2 className="text-3xl font-semibold mt-7 tracking-tight">{title}</h2>

      {/* DESCRIPTION */}
      <p className="text-[#9ca3af] mt-4 max-w-lg mx-auto leading-8">
        {description}
      </p>
    </div>
  );
}
