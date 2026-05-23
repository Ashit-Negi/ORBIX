"use client";

import { BriefcaseBusiness, MapPin } from "lucide-react";

export default function ProfileExperience({
  experiences,
  isOwner,
  setIsExperienceOpen,
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Experience</h2>

        {isOwner && (
          <button
            onClick={() => setIsExperienceOpen(true)}
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-5 py-3 rounded-2xl transition-all duration-300 text-sm sm:text-base"
          >
            + Add Experience
          </button>
        )}
      </div>

      {/* EMPTY */}
      {!experiences.length ? (
        <div className="dark-card rounded-[24px] sm:rounded-[32px] p-8 sm:p-14 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-2xl sm:text-3xl">
            💼
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold mt-5 sm:mt-6">
            No Experience Yet
          </h2>

          <p className="text-[#9ca3af] mt-3 max-w-md mx-auto leading-6 sm:leading-7 text-sm sm:text-base">
            {isOwner
              ? "Add your professional experience, internships and work history."
              : "This user hasn’t added any experience yet."}
          </p>
        </div>
      ) : (
        experiences.map((experience) => (
          <div
            key={experience.id}
            className="dark-card rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 border border-white/5"
          >
            {/* TOP */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                    <BriefcaseBusiness size={20} className="text-[#22c55e]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-semibold break-words">
                      {experience.title}
                    </h2>

                    <p className="text-[#9ca3af] mt-1 text-sm sm:text-base break-words">
                      {experience.company}

                      {experience.employmentType &&
                        ` • ${experience.employmentType}`}
                    </p>
                  </div>
                </div>

                {/* DATES */}
                <div className="mt-5 text-xs sm:text-sm text-[#9ca3af] leading-6">
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
                    <MapPin size={15} className="shrink-0" />

                    <p className="text-xs sm:text-sm break-words">
                      {experience.location}
                    </p>
                  </div>
                )}
              </div>

              {/* CURRENT BADGE */}
              {experience.currentlyWorking && (
                <div className="w-fit bg-[#22c55e]/10 text-[#4ade80] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-[#22c55e]/20 shrink-0">
                  Current
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {experience.description && (
              <p className="mt-5 sm:mt-6 text-[#d1d5db] leading-7 sm:leading-8 text-sm sm:text-base break-words">
                {experience.description}
              </p>
            )}

            {/* SKILLS */}
            {experience.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-6">
                {experience.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-[#d1d5db] break-words"
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
