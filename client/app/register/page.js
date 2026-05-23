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

      window.location.href = "/login";
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#ececec] flex items-center justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-md bg-white border border-[#e5e7eb] rounded-3xl sm:rounded-[28px] p-5 sm:p-10">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-[30px] sm:text-[36px] leading-tight font-semibold tracking-[-1px] text-[#111111]">
            Create account
          </h1>

          <p className="text-[#6b7280] mt-2 text-sm leading-6">
            Welcome to Orbix.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#d1d5db] transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#d1d5db] transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full text-sm sm:text-base bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#d1d5db] transition"
          />

          <button className="w-full bg-[#111111] text-white py-3 rounded-2xl mt-2 text-sm sm:text-base hover:opacity-90 transition">
            Create Account
          </button>
        </form>

        <p className="text-sm text-[#6b7280] text-center mt-5 leading-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#111111] font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
