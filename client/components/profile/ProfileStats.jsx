export default function ProfileStats({ profile }) {
  const stats = [
    {
      label: "Posts",
      value: profile.counts.posts,
      color: "text-[#4ade80]",
    },

    {
      label: "Messages",
      value: profile.counts.comments,
      color: "text-[#60a5fa]",
    },

    {
      label: "Communities",
      value: profile.counts.createdCommunities,
      color: "text-[#fbbf24]",
    },

    {
      label: "Upvotes",
      value: 0,
      color: "text-[#fb7185]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="dark-card rounded-[28px] p-6">
          <h2 className={`text-4xl font-bold tracking-tight ${stat.color}`}>
            {stat.value}
          </h2>

          <p className="text-[#9ca3af] mt-3">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
