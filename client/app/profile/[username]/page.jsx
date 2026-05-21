"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import API from "@/lib/api";

import socket from "@/lib/socket";

import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfilePosts from "@/components/profile/ProfilePosts";
import ProfileExperience from "@/components/profile/ProfileExperience";
import EmptyState from "@/components/profile/EmptyState";
import EditProfileModal from "@/components/profile/EditProfileModal";
import AddExperienceModal from "@/components/profile/AddExperienceModal";

export default function ProfilePage() {
  const params = useParams();

  const username = params.username;

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isExperienceOpen, setIsExperienceOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("Posts");

  const [loggedInUsername, setLoggedInUsername] = useState(null);

  // FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const res = await API.get(`/profile/${username}`);

      setProfile(res.data.user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  // GET LOGGED IN USER
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));

      setLoggedInUsername(payload.username);
    }
  }, []);

  // REALTIME CONNECTION COUNT
  useEffect(() => {
    socket.on("connection-updated", (data) => {
      setProfile((prev) => {
        if (!prev) return prev;

        if (data.userId !== prev.id) {
          return prev;
        }

        if (data.status === "ACCEPTED") {
          return {
            ...prev,

            counts: {
              ...prev.counts,

              connections: prev.counts.connections + 1,
            },
          };
        }

        if (data.status === "NONE") {
          return {
            ...prev,

            counts: {
              ...prev.counts,

              connections: Math.max(0, prev.counts.connections - 1),
            },
          };
        }

        return prev;
      });
    });

    return () => {
      socket.off("connection-updated");
    };
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[700px] rounded-[32px] bg-white/5" />

            <div className="lg:col-span-2 space-y-6">
              <div className="h-52 rounded-[32px] bg-white/5" />

              <div className="h-24 rounded-[32px] bg-white/5" />

              <div className="h-96 rounded-[32px] bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER NOT FOUND
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-[#22c55e]/10 blur-3xl rounded-full" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-[#3b82f6]/10 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div>
            <ProfileSidebar
              profile={profile}
              setIsEditOpen={setIsEditOpen}
              isOwner={loggedInUsername === profile.username}
            />
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            {/* ABOUT */}
            <ProfileAbout profile={profile} />

            {/* TABS */}
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* POSTS */}
            {activeTab === "Posts" && <ProfilePosts posts={profile.posts} />}

            {/* EXPERIENCE */}
            {activeTab === "Experience" && (
              <ProfileExperience
                experiences={profile.experiences}
                isOwner={loggedInUsername === profile.username}
                setIsExperienceOpen={setIsExperienceOpen}
              />
            )}

            {/* COMMUNITIES */}
            {activeTab === "Communities" && (
              <EmptyState
                title="No Communities Yet"
                description="Joined and created communities will appear here."
              />
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditProfileModal
        profile={profile}
        setProfile={setProfile}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
      />

      {/* EXPERIENCE MODAL */}
      <AddExperienceModal
        isOpen={isExperienceOpen}
        setIsOpen={setIsExperienceOpen}
        setProfile={setProfile}
      />
    </div>
  );
}
