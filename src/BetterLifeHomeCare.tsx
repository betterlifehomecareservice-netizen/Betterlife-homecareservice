import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
};

const WHATSAPP_NUMBER = "8801618699125";
const PAYMENT_NUMBER = "01618699125";
const DELIVERY_CHARGE_DHAKA = 150;
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop";

const testimonials = [
  {
    name: "Farida B.",
    role: "ঢাকা",
    text: "আমার মা নিয়মিত হোম কেয়ার নিচ্ছেন। সার্ভিস খুব যত্নশীল এবং সময়মতো পাওয়া গেছে।",
  },
  {
    name: "Hasib A.",
    role: "বরিশাল",
    text: "অপারেশনের পরে বাসায় প্রয়োজনীয় কেয়ার দ্রুত পেয়েছি। আচরণ ও সাপোর্ট খুব ভালো।",
  },
  {
    name: "Nasrin K.",
    role: "মিরপুর",
    text: "স্টাফরা খুবই সহযোগী। প্রয়োজন অনুযায়ী সঠিক সেবা ও মেডিকেল সরঞ্জাম পেয়েছি।",
  },
];

const faqs = [
  {
    q: "অর্ডার কিভাবে করবো?",
    a: "প্রোডাক্টের নিচের অর্ডার বাটনে চাপ দিন, ফর্ম পূরণ করুন, তারপর WhatsApp-এ অর্ডার চলে যাবে।",
  },
  {
    q: "ডেলিভারি চার্জ কত?",
    a: "ঢাকার ভিতরে অগ্রিম ডেলিভারি চার্জ ৳১৫০।",
  },
  {
    q: "পেমেন্ট কিভাবে করবো?",
    a: "ডেলিভারি চার্জ আগে পাঠিয়ে ট্রানজেকশন নাম্বার ফর্মে দিন। বাকি টাকা ক্যাশ অন ডেলিভারি।",
  },
];

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBnNumber(value: number | string) {
  return String(value).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

function parsePrice(raw?: string | null) {
  if (!raw) return 0;
  const normalized = raw
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[^0-9.]/g, "");
  return Number(normalized || 0);
}

function formatPrice(raw?: string | null) {
  const num = parsePrice(raw);
  if (!num) return "৳০";
  return `৳${new Intl.NumberFormat("bn-BD").format(num)}`;
}

function waUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function OrderModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    quantity: 1,
    transactionId: "",
  });

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        phone: "",
        address: "",
        quantity: 1,
        transactionId: "",
      });
    }
  }, [open]);

  if (!open || !product) return null;

  const unitPrice = parsePrice(product.price);
  const subtotal = unitPrice * Number(form.quantity || 1);
  const total = subtotal + DELIVERY_CHARGE_DHAKA;

  const submit = () => {
    if (!form.name || !form.phone || !form.address || !form.transactionId) {
      alert("সব তথ্য পূরণ করুন");
      return;
    }

    const message = `🛒 নতুন অর্ডার
পণ্য: ${product.name}
একক দাম: ${formatPrice(product.price)}
পরিমাণ: ${toBnNumber(form.quantity)}
সাবটোটাল: ${formatPrice(String(subtotal))}
ঢাকা ডেলিভারি চার্জ: ${formatPrice(String(DELIVERY_CHARGE_DHAKA))}
মোট: ${formatPrice(String(total))}
নাম: ${form.name}
ফোন: ${form.phone}
ঠিকানা: ${form.address}
পেমেন্ট নাম্বার: ${PAYMENT_NUMBER}
ট্রানজেকশন নাম্বার: ${form.transactionId}
পেমেন্ট: Cash on Delivery + Delivery Charge Advance`;

    window.open(waUrl(message), "_blank");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>

        <div className="mb-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <ShoppingCart className="h-3.5 w-3.5" />
            অর্ডার ফর্ম
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{product.name}</h3>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="আপনার নাম *"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="মোবাইল নাম্বার *"
            type="tel"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="সম্পূর্ণ ঠিকানা *"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <input
            value={form.quantity}
            onChange={(e) =>
              setForm({
                ...form,
                quantity: Math.max(1, Number(e.target.value || 1)),
              })
            }
            type="number"
            min={1}
            placeholder="কয় পিস *"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
            <p className="font-bold">ঢাকা ডেলিভারি চার্জ অগ্রিম</p>
            <p className="mt-1">৳{toBnNumber(DELIVERY_CHARGE_DHAKA)} আগে পাঠাতে হবে</p>
            <p className="mt-1">
              পেমেন্ট নাম্বার: <span className="font-bold">{PAYMENT_NUMBER}</span>
            </p>
          </div>

          <input
            value={form.transactionId}
            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
            placeholder="ট্রানজেকশন নাম্বার *"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="mb-1 flex justify-between">
              <span>সাবটোটাল</span>
              <span className="font-semibold">{formatPrice(String(subtotal))}</span>
            </div>
            <div className="mb-1 flex justify-between">
              <span>ডেলিভারি</span>
              <span className="font-semibold">
                {formatPrice(String(DELIVERY_CHARGE_DHAKA))}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>মোট</span>
              <span>{formatPrice(String(total))}</span>
            </div>
          </div>

          <button
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}
          >
            <ShoppingCart className="h-4 w-4" />
            অর্ডার Submit করুন
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BetterLifeHomeCare() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [orderModal, setOrderModal] = useState<{
    open: boolean;
    product?: Product;
  }>({ open: false });

  useEffect(() => {
    document.title = "BetterLife HomeCare Service";
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .order("created_at", { ascending: false });

      setProducts((data as Product[]) || []);
      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#eefcf4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold sm:text-base">
                BetterLife HomeCare Service
              </h1>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <a href="#services">সেবাসমূহ</a>
            <a href="#products">পণ্য</a>
            <a href="#reviews">রিভিউ</a>
            <a href="#faq">FAQ</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
              যোগাযোগ
            </a>
          </nav>

          <div className="hidden lg:flex">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-sm font-bold text-white"
            >
              যোগাযোগ
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-xl border border-slate-200 p-2 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-emerald-100 bg-white px-4 py-3 lg:hidden">
            <div className="grid gap-2">
              <a href="#services" onClick={() => setMobileMenuOpen(false)}>
                সেবাসমূহ
              </a>
              <a href="#products" onClick={() => setMobileMenuOpen(false)}>
                পণ্য
              </a>
              <a href="#reviews" onClick={() => setMobileMenuOpen(false)}>
                রিভিউ
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </a>
            </div>
          </div>
        )}
      </header>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:py-16">
          <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            মেডিকেল সাপোর্ট
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight text-slate-900 sm:text-5xl">
            মেডিকেল সরঞ্জাম ভাড়া ও বিক্রয়
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
            সব ধরনের medical equipment পাওয়া যায়। Home delivery সুবিধা।
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Search className="ml-2 h-4 w-4 text-slate-400" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="w-full bg-transparent py-2 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loadingProducts ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              পণ্য লোড হচ্ছে...
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 h-44 overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={p.image_url || FALLBACK_PRODUCT_IMAGE}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </div>

                <h3 className="min-h-[48px] text-lg font-bold text-slate-900">
                  {p.name}
                </h3>

                <p className="mt-2 min-h-[44px] text-xs leading-relaxed text-slate-400">
                  {p.description || "No description"}
                </p>

                <div className="mt-4 text-xl font-black text-emerald-600">
                  {formatPrice(p.price)}
                </div>

                <button
                  onClick={() => setOrderModal({ open: true, product: p })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#10b981,#8b5cf6)" }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  অর্ডার করুন
                </button>
              </div>
            ))
          )}
        </div>

        {!loadingProducts && filteredProducts.length === 0 && (
          <div className="py-10 text-center text-slate-400">কোনো পণ্য পাওয়া যায়নি</div>
        )}
      </section>

      <section id="reviews" className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-bold text-amber-700">
              কাস্টমার রিভিউ
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              আমাদের ক্লায়েন্টরা কী বলেন
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-7 text-slate-600">{item.text}</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-400">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            FAQ
          </div>
          <h3 className="text-3xl font-black text-slate-900">সাধারণ প্রশ্নাবলী</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-bold text-slate-900">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition ${
                    faqOpen === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {faqOpen === i && (
                <div className="px-5 pb-5 text-sm leading-7 text-slate-600">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-xl"
      >
        <Phone className="h-4 w-4" />
        এখনই যোগাযোগ
      </a>

      <OrderModal
        open={orderModal.open}
        onClose={() => setOrderModal({ open: false })}
        product={orderModal.product}
      />
    </div>
  );
}
