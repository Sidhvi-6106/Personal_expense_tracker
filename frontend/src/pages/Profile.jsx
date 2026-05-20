import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Shield,
  Trash2,
  Save,
  Settings,
  Lock,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useFinanceContext } from "../context/FinanceContext";

const Profile = () => {
  const { user, updateProfile, savingProfile } = useFinanceContext();

  const settings = useFinanceContext((state) => state.settings);

  const isDark = settings.theme === "dark";

  const [form, setForm] = useState({
    username: user?.username || "",
    number: user?.number || "",
    monthlyIncome: user?.monthlyIncome || 0,

    email: user?.email || "",
    occupation: user?.occupation || "",
    city: user?.city || "",
    currency: user?.currency || "INR",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        number: user.number || "",
        monthlyIncome: user.monthlyIncome || 0,

        email: user.email || "",
        occupation: user.occupation || "",
        city: user.city || "",
        currency: user.currency || "INR",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateProfile({
      ...form,
      monthlyIncome: Number(form.monthlyIncome),
    });
  };

  const handlePasswordChange = async (e) => {
  e.preventDefault();

  if (
    passwordForm.newPassword !==
    passwordForm.confirmPassword
  ) {
    alert("Passwords do not match");
    return;
  }

  try {
    setPasswordLoading(true);

    const res = await axios.put(
      "http://localhost:4000/auth-api/auth/change-password",
      {
        currentPassword:
          passwordForm.currentPassword,

        newPassword:
          passwordForm.newPassword,
      },
      {
        withCredentials: true,
      }
    );

    alert(res.data.message);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPasswordModal(false);

  } catch (err) {

    console.log(err.response?.data);
    console.log(err);

    alert(
      err?.response?.data?.message ||
      err.message ||
      "Failed to change password"
    );

  } finally {

    setPasswordLoading(false);

  }
};

  const pageBg = isDark ? "bg-slate-950" : "bg-slate-50";

  const cardBg = isDark
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-slate-100";

  const pageText = isDark
    ? "text-slate-100"
    : "text-slate-800";

  const subText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const inputClass = isDark
    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400";

  return (
    <div className={`min-h-screen space-y-6 ${pageBg}`}>
      <div>
        <h1 className={`text-3xl font-bold ${pageText}`}>
          Profile
        </h1>

        <p className={`mt-1 text-sm ${subText}`}>
          Keep your account and income details up to date.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* USER CARD */}
          <div className={`rounded-3xl border p-6 shadow-sm ${cardBg}`}>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 text-4xl font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>

              <h2 className={`mt-4 text-2xl font-bold ${pageText}`}>
                {user?.username || "User"}
              </h2>

              <p className={`mt-1 text-sm ${subText}`}>
                {user?.email || "No email"}
              </p>

              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  isDark
                    ? "bg-emerald-950 text-emerald-300"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                ₹ {form.monthlyIncome || 0} monthly income
              </div>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className={`rounded-3xl border p-6 shadow-sm ${cardBg}`}>
            <h3 className={`mb-4 text-lg font-bold ${pageText}`}>
              Account Security
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Shield size={18} />

                <span className="text-sm font-medium">
                  Change Password
                </span>
              </button>

              <Link
                to="/settings"
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Settings size={18} />

                <span className="text-sm font-medium">
                  Manage Settings
                </span>
              </Link>
            </div>
          </div>

          {/* DANGER */}
          <div
            className={`rounded-3xl border p-6 shadow-sm ${
              isDark
                ? "border-red-900 bg-red-950/30"
                : "border-red-100 bg-red-50"
            }`}
          >
            <h3
              className={`mb-2 text-lg font-bold ${
                isDark ? "text-red-300" : "text-red-600"
              }`}
            >
              Danger Zone
            </h3>

            <p
              className={`mb-4 text-sm ${
                isDark ? "text-red-300" : "text-red-500"
              }`}
            >
              These actions are sensitive.
            </p>

            <button
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                isDark
                  ? "bg-red-900 text-red-100 hover:bg-red-800"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="xl:col-span-2">
          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-6 shadow-sm ${cardBg}`}
          >
            <h2 className={`mb-6 text-xl font-bold ${pageText}`}>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                icon={User}
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                inputClass={inputClass}
                pageText={pageText}
              />

              <InputField
                icon={Mail}
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                inputClass={inputClass}
                pageText={pageText}
              />

              <InputField
                icon={Phone}
                label="Phone Number"
                name="number"
                value={form.number}
                onChange={handleChange}
                inputClass={inputClass}
                pageText={pageText}
              />

              <InputField
                icon={Briefcase}
                label="Occupation"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                inputClass={inputClass}
                pageText={pageText}
              />

              <InputField
                icon={MapPin}
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                inputClass={inputClass}
                pageText={pageText}
              />

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${pageText}`}
                >
                  Currency
                </label>

                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none ${inputClass}`}
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <h2 className={`mb-6 mt-8 text-xl font-bold ${pageText}`}>
              Financial Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
              <InputField
                icon={IndianRupee}
                label="Monthly Income"
                name="monthlyIncome"
                type="number"
                value={form.monthlyIncome}
                onChange={handleChange}
                inputClass={inputClass}
                pageText={pageText}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
              >
                <Save size={18} />

                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-xl ${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-600 p-3 text-white">
                <Lock size={20} />
              </div>

              <div>
                <h2 className={`text-xl font-bold ${pageText}`}>
                  Change Password
                </h2>

                <p className={`text-sm ${subText}`}>
                  Update your account password
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="space-y-4"
            >
              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${pageText}`}
                >
                  Current Password
                </label>

                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 outline-none ${inputClass}`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${pageText}`}
                >
                  New Password
                </label>

                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 outline-none ${inputClass}`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${pageText}`}
                >
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 outline-none ${inputClass}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={`rounded-2xl px-5 py-3 font-semibold ${
                    isDark
                      ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
                >
                  {passwordLoading
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  inputClass,
  pageText,
  type = "text",
}) => {
  return (
    <div>
      <label className={`mb-2 block text-sm font-semibold ${pageText}`}>
        {label}
      </label>

      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full rounded-2xl border py-3 pl-11 pr-4 outline-none ${inputClass}`}
        />
      </div>
    </div>
  );
};

export default Profile;