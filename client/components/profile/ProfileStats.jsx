export default function ProfileStats({ profile }) {
  const stats = [
    {
      label: "Posts",
      value: profile.counts.posts,
      color: "text-[#4ade80]",
    },

    {
      label: "Experience",

      value: profile.experiences?.length || 0,

      color: "text-[#60a5fa]",
    },

    {
      label: "Communities",
      value: profile.counts.createdCommunities,
      color: "text-[#fbbf24]",
    },

    {
      label: "Connections",
      value: profile.counts.connections,
      color: "text-[#fb7185]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="dark-card rounded-[22px] sm:rounded-[28px] p-4 sm:p-6"
        >
          <h2
            className={`text-2xl sm:text-4xl font-bold tracking-tight ${stat.color}`}
          >
            {stat.value}
          </h2>

          <p className="text-[#9ca3af] mt-2 sm:mt-3 text-xs sm:text-base break-words">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}