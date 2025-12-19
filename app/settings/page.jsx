"use client";
import { FaLanguage, FaBell, FaMoon, FaCog, FaUser, FaChevronRight } from "react-icons/fa";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-6 shadow-soft border border-white/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-saffron-400 to-saffron-500 flex items-center justify-center text-white shadow-lg">
            <FaUser size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-saffron-600 to-indigo-600 bg-clip-text text-transparent">
              Profile & Settings
            </h1>
            <p className="text-sm text-indigo-500">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-3">
        <SettingCard
          icon={<FaLanguage className="text-saffron-500" size={20} />}
          title="Language"
          value="English"
          onClick={() => {}}
        />
        <SettingCard
          icon={<FaBell className="text-indigo-500" size={20} />}
          title="Notifications"
          value="Enabled"
          onClick={() => {}}
        />
        <SettingCard
          icon={<FaMoon className="text-indigo-600" size={20} />}
          title="Dark Mode"
          value="System Default"
          onClick={() => {}}
        />
        <SettingCard
          icon={<FaCog className="text-gray-500" size={20} />}
          title="App Version"
          value="1.0.0"
          onClick={() => {}}
        />
      </div>

      {/* About Section */}
      <div className="glass rounded-2xl p-6 shadow-soft border border-white/50">
        <h3 className="text-lg font-semibold text-indigo-700 mb-3">About Panchangam</h3>
        <p className="text-sm text-indigo-600 leading-relaxed">
          Panchangam is a traditional Hindu calendar system that provides detailed information about auspicious times, festivals, and celestial events.
        </p>
      </div>
    </div>
  );
}

function SettingCard({ icon, title, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass w-full rounded-xl p-4 shadow-soft border border-white/50 hover:shadow-md transition-all duration-200 active:scale-98 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 rounded-lg bg-gradient-to-br from-saffron-50 to-indigo-50 group-hover:from-saffron-100 group-hover:to-indigo-100 transition-colors duration-200">
          {icon}
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold text-indigo-700">{title}</div>
          <div className="text-sm text-indigo-500">{value}</div>
        </div>
      </div>
      <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
        <FaChevronRight size={14} />
      </div>
    </button>
  );
}
