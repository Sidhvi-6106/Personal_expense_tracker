import React from "react";
import {
  Moon,
  Bell,
  Sparkles,
  Mail,
  CalendarDays,
  Sun,
} from "lucide-react";
import { useFinanceContext } from "../context/FinanceContext";

const Setting = () => {
  const { settings, updateSettings } = useFinanceContext();

  const isDark = settings.theme === "dark";

  const ToggleRow = ({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
  }) => (
    <div
      className={`flex items-start justify-between gap-4 rounded-2xl border p-5 shadow-sm transition-colors ${
        isDark
          ? "bg-slate-900 border-slate-700"
          : "bg-white border-slate-100"
      }`}
    >
      <div className="flex gap-4">
        <div
          className={`rounded-xl p-3 ${
            isDark
              ? "bg-slate-800 text-indigo-400"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          <Icon size={18} />
        </div>

        <div>
          <h3
            className={`font-semibold ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {title}
          </h3>

          <p
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked
            ? "bg-indigo-600"
            : isDark
            ? "bg-slate-700"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          Settings
        </h1>

        <p
          className={`text-sm ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Control the app experience with real preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* APPEARANCE */}
          <div
            className={`rounded-3xl border p-6 shadow-sm transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-slate-100"
            }`}
          >
            <h2
              className={`font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Appearance
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* LIGHT */}
              <button
                onClick={() => updateSettings({ theme: "light" })}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  settings.theme === "light"
                    ? "border-indigo-600 bg-indigo-50"
                    : isDark
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200"
                }`}
              >
                <Sun size={18} className="mb-2 text-amber-500" />

                <p
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  Light
                </p>

                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Clean daytime theme
                </p>
              </button>

              {/* DARK */}
              <button
                onClick={() => updateSettings({ theme: "dark" })}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  settings.theme === "dark"
                    ? "border-indigo-600 bg-indigo-600"
                    : isDark
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200"
                }`}
              >
                <Moon
                  size={18}
                  className={`mb-2 ${
                    isDark ? "text-white" : "text-slate-700"
                  }`}
                />

                <p className="font-semibold text-white">Dark</p>

                <p
                  className={`text-sm ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  Low-light dashboard mode
                </p>
              </button>
            </div>
          </div>

          {/* AI SUGGESTIONS */}
          <ToggleRow
            icon={Sparkles}
            title="AI Suggestions"
            description="Show expense-management recommendations inside analytics."
            checked={settings.showAIInsights}
            onChange={() =>
              updateSettings({
                showAIInsights: !settings.showAIInsights,
              })
            }
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {/* NOTIFICATIONS */}
          <ToggleRow
            icon={Bell}
            title="Push Notifications"
            description="Enable reminder and alert banners inside the app."
            checked={settings.notifications}
            onChange={() =>
              updateSettings({
                notifications: !settings.notifications,
              })
            }
          />

          {/* EMAIL */}
          <ToggleRow
            icon={Mail}
            title="Email Summaries"
            description="Keep this on if you want future weekly summary support."
            checked={settings.emailSummaries}
            onChange={() =>
              updateSettings({
                emailSummaries: !settings.emailSummaries,
              })
            }
          />

          {/* CALENDAR */}
          <div
            className={`rounded-3xl border p-6 shadow-sm transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`rounded-xl p-3 ${
                  isDark
                    ? "bg-slate-800 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <CalendarDays size={18} />
              </div>

              <div>
                <h2
                  className={`font-bold ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  Calendar Preference
                </h2>

                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Choose how planning views should start the week.
                </p>
              </div>
            </div>

            <select
              className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
              value={settings.startWeekOn}
              onChange={(e) =>
                updateSettings({
                  startWeekOn: e.target.value,
                })
              }
            >
              <option value="monday">Start week on Monday</option>
              <option value="sunday">Start week on Sunday</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;