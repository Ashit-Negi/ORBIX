"use client";

import { BriefcaseBusiness, MapPin } from "lucide-react";

export default function ProfileExperience({
  experiences,
  isOwner,
  setIsExperienceOpen,
}) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Experience</h2>

        {isOwner && (
          <button
            onClick={() => setIsExperienceOpen(true)}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-5 py-3 rounded-2xl transition-all duration-300"
          >
            + Add Experience
          </button>
        )}
      </div>

      {/* EMPTY */}
      {!experiences.length ? (
        <div className="dark-card rounded-[32px] p-14 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-3xl">
            💼
          </div>

          <h2 className="text-2xl font-semibold mt-6">No Experience Yet</h2>

          <p className="text-[#9ca3af] mt-3 max-w-md mx-auto leading-7">
            {isOwner
              ? "Add your professional experience, internships and work history."
              : "This user hasn’t added any experience yet."}
          </p>
        </div>
      ) : (
        experiences.map((experience) => (
          <div
            key={experience.id}
            className="dark-card rounded-[32px] p-7 border border-white/5"
          >
            {/* TOP */}
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center">
                    <BriefcaseBusiness size={22} className="text-[#22c55e]" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold">
                      {experience.title}
                    </h2>

                    <p className="text-[#9ca3af] mt-1">
                      {experience.company}

                      {experience.employmentType &&
                        ` • ${experience.employmentType}`}
                    </p>
                  </div>
                </div>

                {/* DATES */}
                <div className="mt-5 text-sm text-[#9ca3af]">
                  {new Date(experience.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {experience.currentlyWorking
                    ? "Present"
                    : experience.endDate
                      ? new Date(experience.endDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "Present"}
                </div>

                {/* LOCATION */}
                {experience.location && (
                  <div className="flex items-center gap-2 mt-3 text-[#9ca3af]">
                    <MapPin size={16} />

                    <p className="text-sm">{experience.location}</p>
                  </div>
                )}
              </div>

              {/* CURRENT BADGE */}
              {experience.currentlyWorking && (
                <div className="bg-[#22c55e]/10 text-[#4ade80] px-4 py-2 rounded-full text-sm font-medium border border-[#22c55e]/20">
                  Current
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {experience.description && (
              <p className="mt-6 text-[#d1d5db] leading-8">
                {experience.description}
              </p>
            )}

            {/* SKILLS */}
            {experience.skills?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                {experience.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#d1d5db]"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
