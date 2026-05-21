"use client";

export default function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = ["Posts", "Experience", "Communities"];

  return (
    <div className="dark-card rounded-[28px] p-2 flex items-center gap-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            activeTab === tab
              ? "bg-[#22c55e] text-black"
              : "text-[#9ca3af] hover:bg-white/5"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
