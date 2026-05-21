"use client";

import { useState } from "react";

import API from "@/lib/api";

import { X } from "lucide-react";

import Select from "react-select";

import { Country, State } from "country-state-city";

export default function EditProfileModal({
  profile,
  setProfile,
  isOpen,
  setIsOpen,
}) {
  const [formData, setFormData] = useState({
    name: profile.name || "",

    bio: profile.bio || "",

    role: profile.role || "",

    website: profile.website || "",

    github: profile.github || "",

    location: profile.location || "",
  });

  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [preview, setPreview] = useState(profile.image || "");

  const [selectedCountry, setSelectedCountry] = useState(null);

  const [selectedState, setSelectedState] = useState(null);

  // COUNTRY OPTIONS
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,

    label: country.name,
  }));

  // STATE OPTIONS
  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.value).map((state) => ({
        value: state.name,

        label: state.name,
      }))
    : [];

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // HANDLE IMAGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    setPreview(URL.createObjectURL(file));
  };

  // HANDLE UPDATE
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const form = new FormData();

      form.append("name", formData.name);

      form.append("bio", formData.bio);

      form.append("role", formData.role);

      form.append("website", formData.website);

      form.append("github", formData.github);

      form.append("location", formData.location);

      if (selectedImage) {
        form.append("image", selectedImage);
      }

      console.log(selectedImage);

      const res = await API.put("/profile/update/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((prev) => ({
        ...prev,

        ...res.data.user,
      }));

      setIsOpen(false);
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
          <h2 className="text-3xl font-bold">Edit Profile</h2>

          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          {/* PROFILE IMAGE */}
          <div>
            <label className="text-sm text-[#9ca3af]">Profile Image</label>

            <div className="mt-3 flex items-center gap-5">
              {/* PREVIEW */}
              <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 bg-white/5">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                    {profile.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* INPUT */}
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 transition border border-white/10 rounded-2xl px-5 py-3">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="text-sm text-[#9ca3af]">Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#22c55e]/40"
            />
          </div>

          {/* BIO */}
          <div>
            <label className="text-sm text-[#9ca3af]">Bio</label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell people about yourself..."
              rows={4}
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none resize-none focus:border-[#22c55e]/40"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm text-[#9ca3af]">Role</label>

            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Frontend Developer"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#22c55e]/40"
            />
          </div>

          {/* WEBSITE */}
          <div>
            <label className="text-sm text-[#9ca3af]">Website</label>

            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#22c55e]/40"
            />
          </div>

          {/* GITHUB */}
          <div>
            <label className="text-sm text-[#9ca3af]">Github</label>

            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="github.com/username"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#22c55e]/40"
            />
          </div>

          {/* COUNTRY */}
          <div>
            <label className="text-sm text-[#9ca3af]">Country</label>

            <div className="mt-2">
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(value) => {
                  setSelectedCountry(value);

                  setSelectedState(null);

                  setFormData((prev) => ({
                    ...prev,

                    location: String(value.label),
                  }));
                }}
                placeholder="Select country"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* STATE */}
          <div>
            <label className="text-sm text-[#9ca3af]">State</label>

            <div className="mt-2">
              <Select
                options={stateOptions}
                value={selectedState}
                onChange={(value) => {
                  setSelectedState(value);

                  setFormData((prev) => ({
                    ...prev,

                    location: String(
                      `${value.label}, ${selectedCountry.label}`,
                    ),
                  }));
                }}
                placeholder="Select state"
                isDisabled={!selectedCountry}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-7 py-4 rounded-2xl transition-all duration-300"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
