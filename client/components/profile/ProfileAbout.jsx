import { MapPin, Link as LinkIcon } from "lucide-react";

export default function ProfileAbout({ profile }) {
  return (
    <div className="dark-card rounded-[24px] sm:rounded-[32px] p-5 sm:p-7">
      {/* TITLE */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          About
        </h2>

        <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
      </div>

      {/* BIO */}
      <p className="text-[#d1d5db] leading-7 sm:leading-8 mt-5 sm:mt-6 text-sm sm:text-[15px] break-words">
        {profile.bio || (
          <span className="text-[#6b7280]">No bio added yet.</span>
        )}
      </p>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 sm:mt-8">
        {/* LOCATION */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-[#4ade80] shrink-0" />

            <p className="text-sm text-[#9ca3af]">Location</p>
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-medium break-words">
            {profile.location || (
              <span className="text-[#6b7280] text-sm sm:text-base">
                Not added
              </span>
            )}
          </h3>
        </div>

        {/* WEBSITE */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <LinkIcon size={18} className="text-[#60a5fa] shrink-0" />

            <p className="text-sm text-[#9ca3af]">Website</p>
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-medium break-all">
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
              <span className="text-[#6b7280] text-sm sm:text-base">
                Not added
              </span>
            )}
          </h3>
        </div>

        {/* GITHUB */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#c084fc] shrink-0" />

            <p className="text-sm text-[#9ca3af]">Github</p>
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-medium break-all">
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
              <span className="text-[#6b7280] text-sm sm:text-base">
                Not added
              </span>
            )}
          </h3>
        </div>

        {/* ROLE */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f97316] shrink-0" />

            <p className="text-sm text-[#9ca3af]">Role</p>
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-medium break-words">
            {profile.role || (
              <span className="text-[#6b7280] text-sm sm:text-base">
                Not added
              </span>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}
