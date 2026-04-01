import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  X,
  Star,
  Phone,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Lang = "bn" | "en";

type SiteProduct = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
};

const WA_NUMBER = "8801618699125";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const DELIVERY_CHARGE = 150;
const PAYMENT_NUMBER = "01618699125";
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80";

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

function formatPrice(raw?: string | null, isBn = true) {
  const num = parsePrice(raw);
  if (!num) return isBn ? "৳০" : "BDT 0";

  const formatted = new Intl.NumberFormat(isBn ? "bn-BD" : "en-US").format(num);
  return isBn ? `৳${formatted}` : `BDT ${formatted}`;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      style={{
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-slate-800 text-sm sm:text-base">
          {q}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

function OrderModal({
  open,
  onClose,
  product,
  isBn,
}: {
  open: boolean;
  onClose: () => void;
  isBn: boolean;
  product?: { id?: string; name: string; price: string };
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

  const unitPrice = parsePrice(product?.price || "0");
  const subtotal = unitPrice * Number(form.quantity || 1);
  const total = subtotal + DELIVERY_CHARGE;

  const submit = () => {
    if (!form.name || !form.phone || !form.address || !form.transactionId) {
      alert(isBn ? "সব তথ্য পূরণ করুন" : "Please fill all fields");
      return;
    }

    const txt = isBn
      ? `🛒 নতুন অর্ডার
পণ্য: ${product?.name}
দাম: ${formatPrice(product?.price, true)}
পরিমাণ: ${toBnNumber(form.quantity)}
সাবটোটাল: ${formatPrice(String(subtotal), true)}
ঢাকা ডেলিভারি চার্জ: ৳${toBnNumber(DELIVERY_CHARGE)}
মোট: ${formatPrice(String(total), true)}
নাম: ${form.name}
ফোন: ${form.phone}
ঠিকানা: ${form.address}
অগ্রিম পেমেন্ট নম্বর: ${PAYMENT_NUMBER}
ট্রানজেকশন নাম্বার: ${form.transactionId}`
      : `🛒 New Order
Product: ${product?.name}
Unit Price: ${formatPrice(product?.price, false)}
Quantity: ${form.quantity}
Subtotal: BDT ${subtotal}
Dhaka Delivery Charge: BDT ${DELIVERY_CHARGE}
Total: BDT ${total}
Name: ${form.name}
Phone: ${form.phone}
Address: ${form.address}
Advance Payment Number: ${PAYMENT_NUMBER}
Transaction Number: ${form.transactionId}`;

    window.open(`${WA_BASE}?text=${encodeURIComponent(txt)}`, "_blank");
    onClose();
  };

  if (!open || !product) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 bg-green-50 border border-green-200">
            <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700">
              {isBn ? "অর্ডার ফর্ম" : "Order Form"}
            </span>
          </div>

          <h3 className="font-extrabold text-slate-900 text-lg">{product.name}</h3>
          <p className="text-green-600 font-bold text-xl mt-1">
            {formatPrice(product.price, isBn)}
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={isBn ? "আপনার নাম *" : "Your Name *"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />

          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder={isBn ? "মোবাইল নম্বর *" : "Phone Number *"}
            type="tel"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />

          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder={isBn ? "সম্পূর্ণ ঠিকানা *" : "Full Address *"}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none"
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
            placeholder={isBn ? "কয় পিস *" : "Quantity *"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
            <p className="font-bold mb-1">
              {isBn ? "ঢাকা ডেলিভারি চার্জ অগ্রিম" : "Dhaka Delivery Advance"}
            </p>
            <p>
              {isBn
                ? `৳${toBnNumber(DELIVERY_CHARGE)} আগে পাঠাতে হবে`
                : `BDT ${DELIVERY_CHARGE} advance required`}
            </p>
            <p className="mt-1">
              {isBn ? "পেমেন্ট নাম্বার:" : "Payment Number:"}{" "}
              <span className="font-bold">{PAYMENT_NUMBER}</span>
            </p>
          </div>

          <input
            value={form.transactionId}
            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
            placeholder={isBn ? "ট্রানজেকশন নাম্বার *" : "Transaction Number *"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span>{isBn ? "সাবটোটাল" : "Subtotal"}</span>
              <span className="font-semibold">
                {formatPrice(String(subtotal), isBn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{isBn ? "ডেলিভারি" : "Delivery"}</span>
              <span className="font-semibold">
                {formatPrice(String(DELIVERY_CHARGE), isBn)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>{isBn ? "মোট" : "Total"}</span>
              <span>{formatPrice(String(total), isBn)}</span>
            </div>
          </div>

          <button
            onClick={submit}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}
          >
            <ShoppingCart className="h-4 w-4" />
            {isBn ? "অর্ডার Submit করুন" : "Submit Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BetterLifeHomeCare() {
  const [lang, setLang] = useState<Lang>("bn");
  const isBn = lang === "bn";

  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [orderModal, setOrderModal] = useState<{
    open: boolean;
    product?: { id?: string; name: string; price: string };
  }>({ open: false });

  useEffect(() => {
    document.title = isBn
      ? "BetterLife HomeCare Service"
      : "BetterLife HomeCare Service";
  }, [isBn]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .order("created_at", { ascending: false });

      if (!error) {
        setProducts((data as SiteProduct[]) || []);
      }

      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearch.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const faqs = isBn
    ? [
        [
          "অর্ডার কিভাবে করবো?",
          "প্রোডাক্টের নিচের অর্ডার বাটন চাপুন, ফর্ম পূরণ করুন, তারপর WhatsApp-এ অর্ডার চলে যাবে।",
        ],
        [
          "ডেলিভারি চার্জ কত?",
          "ঢাকার ভিতরে ডেলিভারি চার্জ ৳১৫০ অগ্রিম দিতে হবে।",
        ],
        [
          "পেমেন্ট কিভাবে করবো?",
          "দেওয়া নাম্বারে অগ্রিম পাঠিয়ে ট্রানজেকশন নাম্বার ফর্মে লিখে দিন।",
        ],
      ]
    : [
        [
          "How do I place an order?",
          "Click the order button under a product, fill the form, then the order will go to WhatsApp.",
        ],
        [
          "What is the delivery charge?",
          "Inside Dhaka, delivery charge is BDT 150 in advance.",
        ],
        [
          "How do I pay?",
          "Send the advance to the given number and provide the transaction number in the form.",
        ],
      ];

  const reviews = isBn
    ? [
        {
          name: "Farida B.",
          place: "ঢাকা",
          text: "আমার মা নিয়মিত এমন কেয়ার চেয়েছিলেন। সার্ভিস খুব সহজলভ্য এবং সময়মতো পাওয়া গেছে।",
        },
        {
          name: "Hasib A.",
          place: "বরিশাল",
          text: "অপারেশনের পর বাসায় প্রয়োজনীয় কেয়ার দ্রুত পেয়েছি। আচরণ ও সার্ভিস খুব ভালো।",
        },
        {
          name: "Nasrin K.",
          place: "মিরপুর",
          text: "টাকার মূল্য অনুযায়ী সঠিক সেবা ও মেডিকেল সরঞ্জাম পেয়েছি।",
        },
      ]
    : [
        {
          name: "Farida B.",
          place: "Dhaka",
          text: "We needed regular home care support and got timely service.",
        },
        {
          name: "Hasib A.",
          place: "Barishal",
          text: "After surgery, we quickly got the required support at home.",
        },
        {
          name: "Nasrin K.",
          place: "Mirpur",
          text: "Good service and proper medical equipment for the price.",
        },
      ];

  const navItems = isBn
    ? [
        ["services", "সেবাসমূহ"],
        ["products", "পণ্য"],
        ["reviews", "রিভিউ"],
        ["faq", "FAQ"],
      ]
    : [
        ["services", "Services"],
        ["products", "Products"],
        ["reviews", "Reviews"],
        ["faq", "FAQ"],
      ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(15,23,42,.08); }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none">
                BetterLife HomeCare Service
              </div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            {navItems.map(([href, label]) => (
              <a
                key={href}
                href={`#${href}`}
                className="hover:text-emerald-600 transition"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((s) => (s === "bn" ? "en" : "bn"))}
              className="hidden sm:inline-flex h-9 px-3 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {isBn ? "EN" : "BN"}
            </button>

            <a
              href={WA_BASE}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 h-10 text-white text-sm font-semibold shadow-sm"
              style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}
            >
              <Phone className="h-4 w-4" />
              {isBn ? "যোগাযোগ" : "Contact"}
            </a>

            <button
              className="md:hidden h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center"
              onClick={() => setMenuOpen((s) => !s)}
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-slate-600" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-4 flex flex-col gap-3">
              {navItems.map(([href, label]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-slate-700"
                >
                  {label}
                </a>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setLang((s) => (s === "bn" ? "en" : "bn"))}
                  className="h-10 px-4 rounded-full border border-slate-200 text-xs font-semibold"
                >
                  {isBn ? "EN" : "BN"}
                </button>

                <a
                  href={WA_BASE}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 h-10 text-white text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg,#10b981,#3b82f6)",
                  }}
                >
                  <Phone className="h-4 w-4" />
                  {isBn ? "যোগাযোগ" : "Contact"}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="home">
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
            <Reveal>
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold mb-5 border border-emerald-200 bg-emerald-50 text-emerald-700">
                {isBn ? "মেডিকেল সাপোর্ট" : "Medical Support"}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
                {isBn
                  ? "মেডিকেল সরঞ্জাম ভাড়া ও বিক্রয়"
                  : "Medical Equipment Rental & Sales"}
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-4 max-w-3xl mx-auto text-slate-500 text-sm sm:text-lg leading-relaxed">
                {isBn
                  ? "সব ধরনের medical equipment পাওয়া যায়। Home delivery সুবিধা।"
                  : "Get essential medical equipment with easy home delivery support."}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-6 max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={isBn ? "পণ্য খুঁজুন..." : "Search products..."}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section id="products" className="bg-slate-50 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {loadingProducts ? (
                <div className="col-span-full text-center py-10 text-slate-400">
                  <p>{isBn ? "পণ্য লোড হচ্ছে..." : "Loading products..."}</p>
                </div>
              ) : (
                filteredProducts.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.04}>
                    <div className="card-hover rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col h-full overflow-hidden">
                      <div className="h-44 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                        <img
                          src={p.image_url || FALLBACK_PRODUCT_IMAGE}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mb-1 leading-tight min-h-[48px]">
                        {p.name}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-4">
                        {p.description || (isBn ? "কোনো বিবরণ নেই" : "No description")}
                      </p>

                      <div className="font-extrabold text-xl mb-4 text-emerald-600">
                        {formatPrice(p.price, isBn)}
                      </div>

                      <button
                        onClick={() =>
                          setOrderModal({
                            open: true,
                            product: {
                              id: p.id,
                              name: p.name,
                              price: p.price || "0",
                            },
                          })
                        }
                        className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
                        style={{
                          background: "linear-gradient(135deg,#10b981,#8b5cf6)",
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {isBn ? "অর্ডার করুন" : "Order Now"}
                      </button>
                    </div>
                  </Reveal>
                ))
              )}
            </div>

            {!loadingProducts && filteredProducts.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>{isBn ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}</p>
                <button
                  onClick={() => setProductSearch("")}
                  className="mt-2 text-sm text-green-500 hover:underline"
                >
                  {isBn ? "সব দেখুন" : "Show all"}
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="reviews" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center mb-10">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold mb-4 border border-amber-200 bg-amber-50 text-amber-700">
                {isBn ? "কাস্টমার রিভিউ" : "Customer Reviews"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {isBn ? "আমাদের কাস্টমাররা কী বলেন" : "What Our Customers Say"}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {reviews.map((r, i) => (
                <Reveal key={r.name} delay={i * 0.06}>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex gap-1 text-amber-400 mb-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-current" />
                      ))}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-5 min-h-[96px]">
                      {r.text}
                    </p>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.place}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center mb-10">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold mb-4 border border-emerald-200 bg-emerald-50 text-emerald-700">
                FAQ
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {isBn ? "সাধারণ প্রশ্নাবলী" : "Frequently Asked Questions"}
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map(([q, a], i) => (
                <FAQItem
                  key={q}
                  q={q}
                  a={a}
                  defaultOpen={faqOpen === i}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <a
        href={WA_BASE}
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 bottom-5 z-40 inline-flex items-center gap-2 rounded-full px-5 h-12 text-white font-semibold shadow-xl shadow-green-500/20"
        style={{ background: "linear-gradient(135deg,#22c55e,#10b981)" }}
      >
        <Phone className="h-4 w-4" />
        <span className="text-sm">{isBn ? "এখনই যোগাযোগ" : "Contact Now"}</span>
      </a>

      <OrderModal
        open={orderModal.open}
        onClose={() => setOrderModal({ open: false })}
        product={orderModal.product}
        isBn={isBn}
      />
    </div>
  );
}
