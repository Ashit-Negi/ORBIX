import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// ADD TOKEN AUTOMATICALLY
API.interceptors.request.use(
  (req) => {
    // CHECK WINDOW
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
