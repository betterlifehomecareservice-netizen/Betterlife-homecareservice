import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Language = "en" | "bn";

const textMap = {
  en: {
    title: "Admin Settings",
    subtitle: "Language, password and account controls",
    products: "Products",
    banners: "Banners",
    settings: "Settings",
    logout: "Logout",
    language: "Language",
    languageDesc: "Choose your admin panel language",
    saveLanguage: "Save Language",
    account: "Account",
    accountDesc: "Basic admin account security settings",
    loggedIn: "Logged in via Supabase admin account",
    changePassword: "Change Password",
    changePasswordDesc: "Update your Supabase admin password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    savedLanguage: "Language setting saved.",
    passwordUpdated: "Password updated successfully.",
    passwordShort: "Password must be at least 6 characters.",
    passwordMismatch: "Passwords do not match.",
    checking: "Checking settings...",
    updating: "Updating...",
    saving: "Saving...",
    english: "English",
    bangla: "Bangla",
  },
  bn: {
    title: "অ্যাডমিন সেটিংস",
    subtitle: "ভাষা, পাসওয়ার্ড এবং অ্যাকাউন্ট কন্ট্রোল",
    products: "প্রোডাক্ট",
    banners: "ব্যানার",
    settings: "সেটিংস",
    logout: "লগআউট",
    language: "ভাষা",
    languageDesc: "অ্যাডমিন প্যানেলের ভাষা বেছে নিন",
    saveLanguage: "ভাষা সেভ করুন",
    account: "অ্যাকাউন্ট",
    accountDesc: "অ্যাডমিন অ্যাকাউন্টের বেসিক সিকিউরিটি সেটিংস",
    loggedIn: "Supabase অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করা আছে",
    changePassword: "পাসওয়ার্ড পরিবর্তন",
    changePasswordDesc: "আপনার Supabase অ্যাডমিন পাসওয়ার্ড আপডেট করুন",
    newPassword: "নতুন পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    updatePassword: "পাসওয়ার্ড আপডেট করুন",
    savedLanguage: "ভাষা সেটিংস সেভ হয়েছে।",
    passwordUpdated: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।",
    passwordShort: "পাসওয়ার্ড কমপক্ষে 6 অক্ষরের হতে হবে।",
    passwordMismatch: "দুইটি পাসওয়ার্ড মিলছে না।",
    checking: "সেটিংস চেক করা হচ্ছে...",
    updating: "আপডেট হচ্ছে...",
    saving: "সেভ হচ্ছে...",
    english: "English",
    bangla: "বাংলা",
  },
} as const;

export default function AdminSettings() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = textMap[language];

  useEffect(() => {
    const savedLanguage = localStorage.getItem("betterlife_admin_language");
    if (savedLanguage === "bn" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
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
      setMessage(t.savedLanguage);
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
      setError(t.passwordShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t.passwordUpdated);
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t.checking}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-gradient-to-r from-[#071224] via-[#0b2a5b] to-[#071224] shadow-lg shadow-black/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3 shadow-lg shadow-cyan-500/10">
                <Settings className="h-6 w-6 text-cyan-400" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">{t.title}</h1>
                <p className="mt-1 hidden text-sm text-slate-300 sm:block">{t.subtitle}</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-white"
              >
                {t.products}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-white"
              >
                {t.logout}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 grid gap-2 rounded-2xl border border-slate-800 bg-[#081327] p-3 md:hidden">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/admin/dashboard");
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white"
              >
                <Package className="h-4 w-4" />
                {t.products}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/admin/dashboard");
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white"
              >
                <ImageIcon className="h-4 w-4" />
                {t.banners}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white"
              >
                <LogOut className="h-4 w-4" />
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-black/10">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3">
                <Globe className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t.language}</h2>
                <p className="text-sm text-slate-400">{t.languageDesc}</p>
              </div>
            </div>

            <div className="space-y-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              >
                <option value="en">{t.english}</option>
                <option value="bn">{t.bangla}</option>
              </select>

              <button
                onClick={handleSaveLanguage}
                disabled={savingLanguage}
                className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {savingLanguage ? t.saving : t.saveLanguage}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-black/10">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t.account}</h2>
                <p className="text-sm text-slate-400">{t.accountDesc}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#040d20] p-4 text-sm text-slate-300">
              {t.loggedIn}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-3">
              <KeyRound className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t.changePassword}</h2>
              <p className="text-sm text-slate-400">{t.changePasswordDesc}</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">{t.newPassword}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {savingPassword ? t.updating : t.updatePassword}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
    }
