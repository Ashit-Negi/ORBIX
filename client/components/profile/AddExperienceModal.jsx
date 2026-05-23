"use client";

import { useState } from "react";

import API from "@/lib/api";

import { X } from "lucide-react";

export default function AddExperienceModal({ isOpen, setIsOpen, setProfile }) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    employmentType: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    skills: "",
  });

  const [loading, setLoading] = useState(false);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ADD EXPERIENCE
  const handleAddExperience = async () => {
    try {
      setLoading(true);

      const res = await API.post("/experience/add", {
        ...formData,

        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      setProfile((prev) => ({
        ...prev,

        experiences: [res.data, ...prev.experiences],
      }));

      setIsOpen(false);

      // RESET
      setFormData({
        title: "",
        company: "",
        employmentType: "",
        location: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
        skills: "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-3 sm:px-4 py-4">
      <div className="w-full max-w-2xl dark-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Add Experience</h2>

          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="text-sm text-[#9ca3af]">Role</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="MERN Developer"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>

          {/* COMPANY */}
          <div>
            <label className="text-sm text-[#9ca3af]">Company</label>

            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Google"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>

          {/* EMPLOYMENT TYPE */}
          <div>
            <label className="text-sm text-[#9ca3af]">Employment Type</label>

            <input
              type="text"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              placeholder="Full Time"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="text-sm text-[#9ca3af]">Location</label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Remote"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>

          {/* START DATE */}
          <div>
            <label className="text-sm text-[#9ca3af]">Start Date</label>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>

          {/* END DATE */}
          {!formData.currentlyWorking && (
            <div>
              <label className="text-sm text-[#9ca3af]">End Date</label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
              />
            </div>
          )}

          {/* CURRENTLY WORKING */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="currentlyWorking"
              checked={formData.currentlyWorking}
              onChange={handleChange}
              className="mt-1 shrink-0"
            />

            <p className="text-sm text-[#d1d5db] leading-6">
              I currently work here
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-[#9ca3af]">Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your work..."
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none resize-none text-sm sm:text-base"
            />
          </div>

          {/* SKILLS */}
          <div>
            <label className="text-sm text-[#9ca3af]">Skills</label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Prisma"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        {/* ACTION */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-7 sm:mt-8">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto border border-white/10 hover:bg-white/5 px-6 py-3 rounded-2xl transition-all duration-300 text-sm sm:text-base"
          >
            Cancel
          </button>

          <button
            onClick={handleAddExperience}
            disabled={loading}
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-6 sm:px-7 py-3 sm:py-4 rounded-2xl transition-all duration-300 text-sm sm:text-base"
          >
            {loading ? "Saving..." : "Save Experience"}
          </button>
        </div>
      </div>
    </div>
  );
}
