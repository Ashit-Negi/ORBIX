"use client";

import { useState } from "react";
import API from "../../lib/api";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NO SPACES IN USERNAME
    if (formData.username.includes(" ")) {
      alert("Username cannot contain spaces");

      return;
    }

    try {
      const res = await API.post("/auth/register", formData);

      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#ececec] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-[#e5e7eb] rounded-[28px] p-10">
        <div className="mb-10">
          <h1 className="text-[36px] font-semibold tracking-[-1px] text-[#111111]">
            Create account
          </h1>

          <p className="text-[#6b7280] mt-2 text-sm">Welcome to Orbix.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#d1d5db] transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#d1d5db] transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#d1d5db] transition"
          />

          <button className="w-full bg-[#111111] text-white py-3 rounded-2xl mt-2 hover:opacity-90 transition">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
