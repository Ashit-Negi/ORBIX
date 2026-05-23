"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import API from "../../../lib/api";

export default function CreateCommunityPage() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreateCommunity = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        return;
      }

      if (!name.trim()) {
        alert("Community name is required");

        return;
      }

      setLoading(true);

      const res = await API.post(
        "/communities/create",
        {
          name,
          description,
          image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // CLEAR INPUTS
      setName("");

      setDescription("");

      setImage("");

      // REDIRECT TO COMMUNITY PAGE
      router.push(`/communities/${res.data.community.slug}`);
    } catch (error) {
      console.log(error);

      alert(error?.response?.data?.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f1] px-3 sm:px-4 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-[#6b7280] mb-2">
            Create a new space for developers
          </p>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] break-words">
            Create Community
          </h1>
        </div>

        {/* FORM CARD */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl sm:rounded-3xl p-4 sm:p-8">
          {/* COMMUNITY NAME */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Community Name
            </label>

            <input
              type="text"
              placeholder="React Developers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none text-sm"
            />

            <p className="text-xs text-[#6b7280] mt-2 leading-5">
              This will generate a unique community slug.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Description
            </label>

            <textarea
              placeholder="Describe your community..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none resize-none h-28 sm:h-32 text-sm"
            />
          </div>

          {/* IMAGE URL */}
          <div className="mb-6 sm:mb-7">
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Community Image URL (Optional)
            </label>

            <input
              type="text"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none text-sm"
            />
          </div>

          {/* ACTION */}
          <div className="flex justify-stretch sm:justify-end">
            <button
              onClick={handleCreateCommunity}
              disabled={loading}
              className="w-full sm:w-auto bg-[#111111] text-white px-6 py-3 rounded-full text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
