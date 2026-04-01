import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import ImageUpload from "./components/ImageUpload";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  created_at?: string;
};

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  created_at?: string;
};

type Language = "en" | "bn";

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
};

const emptyBannerForm = {
  title: "",
  subtitle: "",
  image_url: "",
};

const textMap = {
  en: {
    title: "BetterLife Admin",
    subtitle: "Professional admin panel for products, banners and uploads",
    totalProducts: "Total Products",
    totalBanners: "Total Banners",
    quickOverview: "Quick Overview",
    contentManager: "Content Manager",
    contentDesc: "Add products, upload images and manage homepage banners.",
    products: "Products",
    banners: "Banners",
    settings: "Settings",
    logout: "Logout",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    cancel: "Cancel",
    productName: "Product Name",
    description: "Description",
    price: "Price",
    productImage: "Product Image",
    updateProduct: "Update Product",
    productsList: "Products List",
    noProducts: "No products found.",
    addBanner: "Add Banner",
    editBanner: "Edit Banner",
    bannerTitle: "Banner Title",
    subtitleLabel: "Subtitle",
    bannerImage: "Banner Image",
    updateBanner: "Update Banner",
    bannersList: "Banners List",
    noBanners: "No banners found.",
    checking: "Checking admin session...",
    loading: "Loading...",
    saving: "Saving...",
    productRequired: "Product name is required.",
    bannerRequired: "Banner title is required.",
    productAdded: "Product added successfully.",
    productUpdated: "Product updated successfully.",
    bannerAdded: "Banner added successfully.",
    bannerUpdated: "Banner updated successfully.",
    productDeleted: "Product deleted successfully.",
    bannerDeleted: "Banner deleted successfully.",
    deleteProductConfirm: "Are you sure you want to delete this product?",
    deleteBannerConfirm: "Are you sure you want to delete this banner?",
  },
  bn: {
    title: "বেটারলাইফ অ্যাডমিন",
    subtitle: "প্রোডাক্ট, ব্যানার এবং আপলোড ম্যানেজ করার প্যানেল",
    totalProducts: "মোট প্রোডাক্ট",
    totalBanners: "মোট ব্যানার",
    quickOverview: "দ্রুত সারাংশ",
    contentManager: "কনটেন্ট ম্যানেজার",
    contentDesc: "প্রোডাক্ট যোগ করুন, ছবি আপলোড করুন এবং হোমপেজ ব্যানার ম্যানেজ করুন।",
    products: "প্রোডাক্ট",
    banners: "ব্যানার",
    settings: "সেটিংস",
    logout: "লগআউট",
    addProduct: "প্রোডাক্ট যোগ করুন",
    editProduct: "প্রোডাক্ট এডিট করুন",
    cancel: "বাতিল",
    productName: "প্রোডাক্টের নাম",
    description: "বিবরণ",
    price: "দাম",
    productImage: "প্রোডাক্টের ছবি",
    updateProduct: "প্রোডাক্ট আপডেট করুন",
    productsList: "প্রোডাক্ট লিস্ট",
    noProducts: "কোনো প্রোডাক্ট পাওয়া যায়নি।",
    addBanner: "ব্যানার যোগ করুন",
    editBanner: "ব্যানার এডিট করুন",
    bannerTitle: "ব্যানারের শিরোনাম",
    subtitleLabel: "সাবটাইটেল",
    bannerImage: "ব্যানারের ছবি",
    updateBanner: "ব্যানার আপডেট করুন",
    bannersList: "ব্যানার লিস্ট",
    noBanners: "কোনো ব্যানার পাওয়া যায়নি।",
    checking: "অ্যাডমিন সেশন চেক করা হচ্ছে...",
    loading: "লোড হচ্ছে...",
    saving: "সেভ হচ্ছে...",
    productRequired: "প্রোডাক্টের নাম দিতে হবে।",
    bannerRequired: "ব্যানারের শিরোনাম দিতে হবে।",
    productAdded: "প্রোডাক্ট সফলভাবে যোগ হয়েছে।",
    productUpdated: "প্রোডাক্ট সফলভাবে আপডেট হয়েছে।",
    bannerAdded: "ব্যানার সফলভাবে যোগ হয়েছে।",
    bannerUpdated: "ব্যানার সফলভাবে আপডেট হয়েছে।",
    productDeleted: "প্রোডাক্ট সফলভাবে ডিলিট হয়েছে।",
    bannerDeleted: "ব্যানার সফলভাবে ডিলিট হয়েছে।",
    deleteProductConfirm: "আপনি কি এই প্রোডাক্ট ডিলিট করতে চান?",
    deleteBannerConfirm: "আপনি কি এই ব্যানার ডিলিট করতে চান?",
  },
} as const;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "banners">("products");
  const [language, setLanguage] = useState<Language>("en");

  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [saving, setSaving] = useState(false);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

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
      await Promise.all([fetchProducts(), fetchBanners()]);
    };

    init();
  }, [navigate]);

  const totalProducts = useMemo(() => products.length, [products]);
  const totalBanners = useMemo(() => banners.length, [banners]);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setProducts((data as Product[]) || []);

    setLoadingProducts(false);
  };

  const fetchBanners = async () => {
    setLoadingBanners(true);

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setBanners((data as Banner[]) || []);

    setLoadingBanners(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setSaving(true);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      price: productForm.price.trim() || null,
      image_url: productForm.image_url.trim() || null,
    };

    if (!payload.name) {
      setError(t.productRequired);
      setSaving(false);
      return;
    }

    let result;

    if (editingProductId) {
      result = await supabase.from("products").update(payload).eq("id", editingProductId);
    } else {
      result = await supabase.from("products").insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(editingProductId ? t.productUpdated : t.productAdded);
      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await fetchProducts();
    }

    setSaving(false);
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setSaving(true);

    const payload = {
      title: bannerForm.title.trim(),
      subtitle: bannerForm.subtitle.trim() || null,
      image_url: bannerForm.image_url.trim() || null,
    };

    if (!payload.title) {
      setError(t.bannerRequired);
      setSaving(false);
      return;
    }

    let result;

    if (editingBannerId) {
      result = await supabase.from("banners").update(payload).eq("id", editingBannerId);
    } else {
      result = await supabase.from("banners").insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(editingBannerId ? t.bannerUpdated : t.bannerAdded);
      setBannerForm(emptyBannerForm);
      setEditingBannerId(null);
      await fetchBanners();
    }

    setSaving(false);
  };

  const handleEditProduct = (product: Product) => {
    clearAlerts();
    setActiveTab("products");
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      image_url: product.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditBanner = (banner: Banner) => {
    clearAlerts();
    setActiveTab("banners");
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image_url: banner.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: string) => {
    const ok = window.confirm(t.deleteProductConfirm);
    if (!ok) return;

    clearAlerts();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) setError(error.message);
    else {
      setMessage(t.productDeleted);
      if (editingProductId === id) {
        setEditingProductId(null);
        setProductForm(emptyProductForm);
      }
      await fetchProducts();
    }
  };

  const handleDeleteBanner = async (id: string) => {
    const ok = window.confirm(t.deleteBannerConfirm);
    if (!ok) return;

    clearAlerts();
    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) setError(error.message);
    else {
      setMessage(t.bannerDeleted);
      if (editingBannerId === id) {
        setEditingBannerId(null);
        setBannerForm(emptyBannerForm);
      }
      await fetchBanners();
    }
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
                <LayoutDashboard className="h-6 w-6 text-cyan-400" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">{t.title}</h1>
                <p className="mt-1 hidden text-sm text-slate-300 sm:block">{t.subtitle}</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "products"
                    ? "bg-cyan-500 text-white"
                    : "border border-slate-700 bg-slate-900/70 text-white"
                }`}
              >
                {t.products}
              </button>

              <button
                onClick={() => setActiveTab("banners")}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "banners"
                    ? "bg-emerald-500 text-white"
                    : "border border-slate-700 bg-slate-900/70 text-white"
                }`}
              >
                {t.banners}
              </button>

              <button
                onClick={() => navigate("/admin/settings")}
                className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {t.settings}
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
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
                  setActiveTab("products");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                  activeTab === "products" ? "bg-cyan-500 text-white" : "bg-slate-900 text-white"
                }`}
              >
                <Package className="h-4 w-4" />
                {t.products}
              </button>

              <button
                onClick={() => {
                  setActiveTab("banners");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                  activeTab === "banners" ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                {t.banners}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/admin/settings");
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white"
              >
                <Settings className="h-4 w-4" />
                {t.settings}
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t.totalProducts}</p>
                <h2 className="mt-3 text-4xl font-bold">{totalProducts}</h2>
              </div>
              <div className="rounded-2xl bg-cyan-500/10 p-4">
                <Package className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t.totalBanners}</p>
                <h2 className="mt-3 text-4xl font-bold">{totalBanners}</h2>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-4">
                <ImageIcon className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10 md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t.quickOverview}</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-200">{t.contentManager}</h3>
                <p className="mt-2 text-sm text-slate-400">{t.contentDesc}</p>
              </div>
              <div className="rounded-2xl bg-violet-500/10 p-4">
                <BarChart3 className="h-8 w-8 text-violet-400" />
              </div>
            </div>
          </div>
        </div>

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

        {activeTab === "products" ? (
          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {editingProductId ? t.editProduct : t.addProduct}
                </h3>

                {editingProductId && (
                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm(emptyProductForm);
                      clearAlerts();
                    }}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">{t.productName}</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">{t.description}</label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">{t.price}</label>
                  <input
                    type="text"
                    value={productForm.price}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="$99"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                  />
                </div>

                <ImageUpload
                  label={t.productImage}
                  value={productForm.image_url}
                  onChange={(url) => setProductForm((prev) => ({ ...prev, image_url: url }))}
                  language={language}
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3.5 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      {editingProductId ? t.updateProduct : t.addProduct}
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{t.productsList}</h3>
                {loadingProducts && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.loading}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {products.length === 0 && !loadingProducts ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-slate-400">
                    {t.noProducts}
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="rounded-3xl border border-slate-800 bg-[#040d20] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-800">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-500">
                                <Package className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                            {product.price && <p className="mt-1 text-sm font-medium text-cyan-400">{product.price}</p>}
                            {product.description && (
                              <p className="mt-2 max-w-xl text-sm text-slate-400">{product.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                            {language === "bn" ? "এডিট" : "Edit"}
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            {language === "bn" ? "ডিলিট" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {editingBannerId ? t.editBanner : t.addBanner}
                </h3>

                {editingBannerId && (
                  <button
                    onClick={() => {
                      setEditingBannerId(null);
                      setBannerForm(emptyBannerForm);
                      clearAlerts();
                    }}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>

              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">{t.bannerTitle}</label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">{t.subtitleLabel}</label>
                  <textarea
                    rows={4}
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                  />
                </div>

                <ImageUpload
                  label={t.bannerImage}
                  value={bannerForm.image_url}
                  onChange={(url) => setBannerForm((prev) => ({ ...prev, image_url: url }))}
                  language={language}
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      {editingBannerId ? t.updateBanner : t.addBanner}
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{t.bannersList}</h3>
                {loadingBanners && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.loading}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {banners.length === 0 && !loadingBanners ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-slate-400">
                    {t.noBanners}
                  </div>
                ) : (
                  banners.map((banner) => (
                    <div key={banner.id} className="rounded-3xl border border-slate-800 bg-[#040d20] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                          <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-800">
                            {banner.image_url ? (
                              <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-500">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-lg font-semibold text-white">{banner.title}</h4>
                            {banner.subtitle && (
                              <p className="mt-2 max-w-xl text-sm text-slate-400">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEditBanner(banner)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                            {language === "bn" ? "এডিট" : "Edit"}
                          </button>

                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            {language === "bn" ? "ডিলিট" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
      }
