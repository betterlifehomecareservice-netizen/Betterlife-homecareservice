import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  KeyRound,
  LogOut,
  Save,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "./lib/supabase";

export default function AdminSettings() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [language, setLanguage] = useState("en");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const savedLanguage = localStorage.getItem("betterlife_admin_language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }

      setCheckingAuth(false);
    };

    init();
  }, [navigate]);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const handleSaveLanguage = async () => {
    clearAlerts();
    setSavingLanguage(true);

    try {
      localStorage.setItem("betterlife_admin_language", language);
      setMessage("Language setting saved.");
    } catch {
      setError("Failed to save language setting.");
    } finally {
      setSavingLanguage(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-[#061530]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3">
              <Settings className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-sm text-slate-400">
                Language, password and basic account controls
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Globe className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Language</h2>
                <p className="text-sm text-slate-400">
                  Choose your admin panel language
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              >
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </select>

              <button
                onClick={handleSaveLanguage}
                disabled={savingLanguage}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {savingLanguage ? "Saving..." : "Save Language"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Account</h2>
                <p className="text-sm text-slate-400">
                  Basic admin account security settings
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              Logged in via Supabase admin account
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3">
              <KeyRound className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="text-sm text-slate-400">
                Update your Supabase admin password
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
  }
