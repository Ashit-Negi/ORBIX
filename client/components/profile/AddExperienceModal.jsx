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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl dark-card rounded-[32px] p-7 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Add Experience</h2>

          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
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
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
              />
            </div>
          )}

          {/* CURRENTLY WORKING */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="currentlyWorking"
              checked={formData.currentlyWorking}
              onChange={handleChange}
            />

            <p className="text-sm text-[#d1d5db]">I currently work here</p>
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none resize-none"
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
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            />
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleAddExperience}
            disabled={loading}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-7 py-4 rounded-2xl transition-all duration-300"
          >
            {loading ? "Saving..." : "Save Experience"}
          </button>
        </div>
      </div>
    </div>
  );
}
