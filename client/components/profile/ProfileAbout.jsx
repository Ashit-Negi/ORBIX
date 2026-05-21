import { MapPin, Link as LinkIcon } from "lucide-react";

export default function ProfileAbout({ profile }) {
  return (
    <div className="dark-card rounded-[32px] p-7">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">About</h2>

        <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse" />
      </div>

      {/* BIO */}
      <p className="text-[#d1d5db] leading-8 mt-6 text-[15px]">
        {profile.bio || (
          <span className="text-[#6b7280]">No bio added yet.</span>
        )}
      </p>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {/* LOCATION */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-[#4ade80]" />

            <p className="text-sm text-[#9ca3af]">Location</p>
          </div>

          <h3 className="mt-3 text-lg font-medium">
            {profile.location || (
              <span className="text-[#6b7280] text-base">Not added</span>
            )}
          </h3>
        </div>

        {/* WEBSITE */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <LinkIcon size={18} className="text-[#60a5fa]" />

            <p className="text-sm text-[#9ca3af]">Website</p>
          </div>

          <h3 className="mt-3 text-lg font-medium truncate">
            {profile.website ? (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#60a5fa] transition"
              >
                {profile.website}
              </a>
            ) : (
              <span className="text-[#6b7280] text-base">Not added</span>
            )}
          </h3>
        </div>

        {/* GITHUB */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#c084fc]" />

            <p className="text-sm text-[#9ca3af]">Github</p>
          </div>

          <h3 className="mt-3 text-lg font-medium truncate">
            {profile.github ? (
              <a
                href={`https://${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#c084fc] transition"
              >
                {profile.github}
              </a>
            ) : (
              <span className="text-[#6b7280] text-base">Not added</span>
            )}
          </h3>
        </div>

        {/* ROLE */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f97316]" />

            <p className="text-sm text-[#9ca3af]">Role</p>
          </div>

          <h3 className="mt-3 text-lg font-medium">
            {profile.role || (
              <span className="text-[#6b7280] text-base">Not added</span>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}
