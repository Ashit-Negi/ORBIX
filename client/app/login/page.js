"use client";

import { useState } from "react";
import API from "../../lib/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
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

    try {
      const res = await API.post("/auth/login", formData);

      // save token
      localStorage.setItem("token", res.data.token);

      alert("Login successful");
      window.location.href = "/";

      console.log(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#ececeb] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-[#e5e7eb] rounded-[28px] p-10">
        <div className="mb-10">
          <h1 className="text-[36px] font-semibold tracking-[-1px] text-[#111111]">
            Welcome back
          </h1>

          <p className="text-[#6b7280] mt-2 text-sm">
            Login to continue to Orbix.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
