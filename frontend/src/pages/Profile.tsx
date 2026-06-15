import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { updateProfile, changePassword } from "../api";

const Profile = () => {
  const { user, logout, updateToken } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const startEdit = () => {
    setForm({ username: user?.username || "", email: user?.email || "" });
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setError("Username and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
      });
      if (updateToken) {
        updateToken(res.token);
      }
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update profile.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const startChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const cancelChangePassword = () => {
    setChangingPassword(false);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSave = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setChangingPassword(false);
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to change password.";
      setPasswordError(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 bg-blue-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-blue-300 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(editing ? form.username : user?.username)
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left pb-1">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, username: e.target.value }))
                    }
                    className="w-full bg-stone-100 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full bg-stone-100 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user?.username || "User"}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {editing ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 dark:bg-red-600 border border-gray-500 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-red-400 dark:hover:bg-red-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-500 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-blue-500 dark:hover:bg-blue-700 transition bg-blue-600 dark:bg-blue-600"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 rounded-lg px-4 py-2">
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-6 bg-blue-300 dark:bg-gray-800 rounded-2xl border border-stone-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Account Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
              👤
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Username
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {user?.username || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
              ✉
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {user?.email || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="mt-6 bg-blue-300 dark:bg-gray-800 rounded-2xl border border-stone-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Change Password
        </h2>
        {passwordSuccess && (
          <div className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 rounded-lg px-4 py-2">
            {passwordSuccess}
          </div>
        )}
        {changingPassword ? (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({
                  ...f,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full bg-stone-100 border border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              className="w-full bg-stone-100 border border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({
                  ...f,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full bg-stone-100 border border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg px-4 py-2">
                {passwordError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={cancelChangePassword}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 dark:bg-red-600 border border-gray-500 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-red-400 dark:hover:bg-red-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={passwordSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-60"
              >
                {passwordSaving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startChangePassword}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-500 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-blue-500 dark:hover:bg-blue-700 transition bg-blue-600 dark:bg-blue-600"
          >
            🔑 Change Password
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-500 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-300 hover:text-gray-700 dark:hover:bg-blue-700 transition bg-blue-200 dark:bg-blue-600"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-400 dark:border-red-800 hover:bg-red-400 hover:text-red-800 dark:hover:bg-red-900/50 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
