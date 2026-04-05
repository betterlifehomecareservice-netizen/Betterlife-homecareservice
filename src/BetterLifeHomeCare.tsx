import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, Award, BadgeCheck, ChevronDown,
  ClipboardCheck, Clock, FileSearch, Heart, HeartPulse,
  Home, MapPin, Menu, MessageCircle, Phone, RefreshCw, Search,
  Shield, ShoppingCart, Star, Stethoscope, Users, UserCheck,
  X, Zap,
} from "lucide-react";
import { supabase } from "./lib/supabase";

/* ── Types ───────────────────────────────────────── */
type SiteProduct = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
};

/* ── Scroll reveal ───────────────────────────────── */
function useInView(t = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [t]);
  return { ref, inView: v };
}
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `all 700ms cubic-bezier(0.22,1,0.36,1) ${delay}s`
      }}
    >
      {children}
    </div>
  );
}

/* ── Logo SVG ────────────────────────────────────── */
function BetterLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M20 4L4 16V36H15V26H25V36H36V16L20 4Z" fill="url(#lg1)" />
      <path d="M20 4L4 16H36L20 4Z" fill="#059669" opacity="0.4" />
      <rect x="17" y="19" width="6" height="1.8" rx="0.9" fill="white" />
      <rect x="19.1" y="17" width="1.8" height="6" rx="0.9" fill="white" />
      <path d="M10 30 L13 30 L14.5 27 L16 33 L17.5 29 L19 30 L21 30" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Constants ───────────────────────────────────── */
const WA_NUM = "8801618699125";
const WA_BASE = `https://wa.me/${WA_NUM}`;
const WA_MSG = `${WA_BASE}?text=BetterLife+HomeCare+সম্পর্কে+জানতে+চাই`;
const DELIVERY_CHARGE = 150;
const PAYMENT_NUMBER = "01618699125";
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80";

/* ── Price helpers ───────────────────────────────── */
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

/* ── Consultation Form Modal ─────────────────────── */
function ConsultationModal({
  open, onClose, prefill = "",
}: { open: boolean; onClose: () => void; prefill?: string }) {
  const [form, setForm] = useState({ name: "", phone: "", service: prefill, msg: "" });

  useEffect(() => { if (open) setForm(f => ({ ...f, service: prefill })); }, [open, prefill]);

  const submit = () => {
    if (!form.name || !form.phone) { alert("নাম ও ফোন নম্বর দিন"); return; }
    const txt = `নতুন consultation request:\nনাম: ${form.name}\nফোন: ${form.phone}\nসেবা: ${form.service}\nবার্তা: ${form.msg || "—"}`;
    window.open(`${WA_BASE}?text=${encodeURIComponent(txt)}`, "_blank");
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <X className="h-4 w-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900">ফ্রি Consultation</h3>
            <p className="text-xs text-slate-400">আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="আপনার নাম *" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="ফোন নম্বর *" type="tel" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-slate-700">
            <option value="">সেবার ধরন বেছে নিন</option>
            <option>কেয়ারগিভার ৮ ঘণ্টা</option>
            <option>কেয়ারগিভার ১২ ঘণ্টা</option>
            <option>কেয়ারগিভার ২৪ ঘণ্টা (Live-in)</option>
            <option>নার্স ৮ ঘণ্টা</option>
            <option>নার্স ১২ ঘণ্টা</option>
            <option>নার্স ২৪ ঘণ্টা (Live-in)</option>
            <option>নানি ৮ ঘণ্টা</option>
            <option>নানি ১২ ঘণ্টা</option>
            <option>নানি Live-in</option>
            <option>ফিজিওথেরাপি</option>
            <option>ডাক্তার হোম ভিজিট</option>
            <option>অন্যান্য</option>
          </select>
          <textarea value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })}
            placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)" rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none" />
          <button onClick={submit}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
            Submit করুন
          </button>
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">অথবা</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <a href={WA_MSG} target="_blank" rel="noreferrer">
            <button className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: "#25D366" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.851L.057 23.571l5.908-1.437A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.713.903.952-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
              সরাসরি WhatsApp করুন
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Product Order Modal (improved from new version) ─ */
function OrderModal({
  open, onClose, isBn, product,
}: {
  open: boolean; onClose: () => void; isBn: boolean;
  product?: { id?: string; name: string; price: string };
}) {
  const [form, setForm] = useState({
    name: "", phone: "", address: "", quantity: 1, transactionId: "",
  });

  useEffect(() => {
    if (!open) setForm({ name: "", phone: "", address: "", quantity: 1, transactionId: "" });
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
      ? `🛒 নতুন অর্ডার\nপণ্য: ${product?.name}\nদাম: ${formatPrice(product?.price, true)}\nপরিমাণ: ${toBnNumber(form.quantity)}\nসাবটোটাল: ${formatPrice(String(subtotal), true)}\nঢাকা ডেলিভারি চার্জ: ৳${toBnNumber(DELIVERY_CHARGE)}\nমোট: ${formatPrice(String(total), true)}\nনাম: ${form.name}\nফোন: ${form.phone}\nঠিকানা: ${form.address}\nঅগ্রিম পেমেন্ট নম্বর: ${PAYMENT_NUMBER}\nট্রানজেকশন নাম্বার: ${form.transactionId}`
      : `🛒 New Order\nProduct: ${product?.name}\nUnit Price: ${formatPrice(product?.price, false)}\nQuantity: ${form.quantity}\nSubtotal: BDT ${subtotal}\nDhaka Delivery Charge: BDT ${DELIVERY_CHARGE}\nTotal: BDT ${total}\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}\nAdvance Payment Number: ${PAYMENT_NUMBER}\nTransaction Number: ${form.transactionId}`;
    window.open(`${WA_BASE}?text=${encodeURIComponent(txt)}`, "_blank");
    onClose();
  };

  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <X className="h-4 w-4 text-slate-600" />
        </button>
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 bg-green-50 border border-green-200">
            <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700">{isBn ? "অর্ডার ফর্ম" : "Order Form"}</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">{product.name}</h3>
          <p className="text-green-600 font-bold text-xl mt-1">{formatPrice(product.price, isBn)}</p>
        </div>
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder={isBn ? "আপনার নাম *" : "Your Name *"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder={isBn ? "মোবাইল নম্বর *" : "Phone Number *"} type="tel"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder={isBn ? "সম্পূর্ণ ঠিকানা *" : "Full Address *"} rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none" />
          <input value={form.quantity}
            onChange={e => setForm({ ...form, quantity: Math.max(1, Number(e.target.value || 1)) })}
            type="number" min={1}
            placeholder={isBn ? "কয় পিস *" : "Quantity *"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
            <p className="font-bold mb-1">{isBn ? "ঢাকা ডেলিভারি চার্জ অগ্রিম" : "Dhaka Delivery Advance"}</p>
            <p>{isBn ? `৳${toBnNumber(DELIVERY_CHARGE)} আগে পাঠাতে হবে` : `BDT ${DELIVERY_CHARGE} advance required`}</p>
            <p className="mt-1">{isBn ? "পেমেন্ট নাম্বার:" : "Payment Number:"} <span className="font-bold">{PAYMENT_NUMBER}</span></p>
          </div>
          <input value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })}
            placeholder={isBn ? "ট্রানজেকশন নাম্বার *" : "Transaction Number *"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span>{isBn ? "সাবটোটাল" : "Subtotal"}</span>
              <span className="font-semibold">{formatPrice(String(subtotal), isBn)}</span>
            </div>
            <div className="flex justify-between">
              <span>{isBn ? "ডেলিভারি" : "Delivery"}</span>
              <span className="font-semibold">{formatPrice(String(DELIVERY_CHARGE), isBn)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>{isBn ? "মোট" : "Total"}</span>
              <span>{formatPrice(String(total), isBn)}</span>
            </div>
          </div>
          <button onClick={submit}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mt-1 transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
            <ShoppingCart className="h-4 w-4" /> {isBn ? "অর্ডার Submit করুন" : "Submit Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Static Data ─────────────────────────────────── */
const CAREGIVER_PKGS = [
  { id: "cg8", nameEn: "Caregiver 8 Hours", nameBn: "কেয়ারগিভার ৮ ঘণ্টা", hoursEn: "8 hrs/day", hoursBn: "দিনে ৮ ঘণ্টা", priceEn: "৳18,000", priceBn: "৳১৮,০০০", perBn: "/মাস", perEn: "/month", color: "#3b82f6",
    featuresEn: ["Personal care & feeding","Health monitoring","Medication reminder","Companionship","Light housekeeping","Doctor visit support"],
    featuresBn: ["ব্যক্তিগত যত্ন ও খাওয়ানো","স্বাস্থ্য পর্যবেক্ষণ","ওষুধ reminder","সঙ্গ ও মানসিক সহায়তা","হালকা গৃহস্থালি","ডাক্তার ভিজিট সমন্বয়"] },
  { id: "cg12", nameEn: "Caregiver 12 Hours", nameBn: "কেয়ারগিভার ১২ ঘণ্টা", hoursEn: "12 hrs/day", hoursBn: "দিনে ১২ ঘণ্টা", priceEn: "৳25,000", priceBn: "৳২৫,০০০", perBn: "/মাস", perEn: "/month", color: "#8b5cf6", featured: true,
    featuresEn: ["All 8-hour services","Post-hospital care","Chronic disease management","Physical exercises","Dementia/Parkinson's care","Monthly health report"],
    featuresBn: ["৮ ঘণ্টার সব সেবা","হাসপাতাল পরবর্তী যত্ন","দীর্ঘমেয়াদি রোগ ব্যবস্থাপনা","শারীরিক ব্যায়াম","Dementia/Parkinson's যত্ন","মাসিক স্বাস্থ্য রিপোর্ট"] },
  { id: "cg24", nameEn: "Caregiver 24H Live-in", nameBn: "কেয়ারগিভার ২৪ ঘণ্টা (Live-in)", hoursEn: "24 hrs live-in", hoursBn: "২৪ ঘণ্টা বাড়িতে থেকে", priceEn: "৳35,000", priceBn: "৳৩৫,০০০", perBn: "/মাস", perEn: "/month", color: "#10b981",
    featuresEn: ["All 12-hour services","24/7 supervision","Night duty & emergency","Doctor visit accompaniment","Monthly telemedicine","Daily family updates"],
    featuresBn: ["১২ ঘণ্টার সব সেবা","২৪/৭ তত্ত্বাবধান","রাতের ডিউটি ও জরুরি সাড়া","ডাক্তার ভিজিটে সঙ্গী","মাসিক telemedicine","পরিবারকে দৈনিক আপডেট"] },
];

const NURSE_PKGS = [
  { id: "n8", nameEn: "Nurse 8 Hours", nameBn: "নার্স ৮ ঘণ্টা", hoursEn: "8 hrs/day", hoursBn: "দিনে ৮ ঘণ্টা", priceEn: "৳24,000", priceBn: "৳২৪,০০০", perBn: "/মাস", perEn: "/month", color: "#10b981",
    featuresEn: ["Vital signs monitoring","IV/IM medication","Wound dressing & care","NG tube feeding","Physiotherapy guidance","Patient observation"],
    featuresBn: ["Vital signs পর্যবেক্ষণ","IV/IM injection প্রদান","ক্ষত পরিষ্কার ও ড্রেসিং","NG tube feeding","Physiotherapy নির্দেশনা","রোগী পর্যবেক্ষণ"] },
  { id: "n12", nameEn: "Nurse 12 Hours", nameBn: "নার্স ১২ ঘণ্টা", hoursEn: "12 hrs/day", hoursBn: "দিনে ১২ ঘণ্টা", priceEn: "৳30,000", priceBn: "৳৩০,০০০", perBn: "/মাস", perEn: "/month", color: "#10b981", featured: true,
    featuresEn: ["All 8-hour nursing","Tracheostomy/colostomy care","Oxygenation support","Critical care","Post-operative care","Emergency response"],
    featuresBn: ["৮ ঘণ্টার সব সেবা","Tracheostomy/Colostomy যত্ন","Oxygenation সহায়তা","Critical care","অপারেশন পরবর্তী যত্ন","জরুরি সাড়া"] },
  { id: "n24", nameEn: "Nurse 24H Live-in", nameBn: "নার্স ২৪ ঘণ্টা (Live-in)", hoursEn: "24 hrs live-in", hoursBn: "২৪ ঘণ্টা বাড়িতে থেকে", priceEn: "৳60,000", priceBn: "৳৬০,০০০", perBn: "/মাস", perEn: "/month", color: "#8b5cf6",
    featuresEn: ["All 12-hour nursing","ICU-level monitoring","CPR & emergency","Specialist coordination","Daily family briefing","Hospital admission support"],
    featuresBn: ["১২ ঘণ্টার সব সেবা","ICU-level পর্যবেক্ষণ","CPR ও জরুরি পদ্ধতি","Specialist সমন্বয়","দৈনিক family briefing","হাসপাতাল ভর্তি সহায়তা"] },
];

const NANNY_PKGS = [
  { id: "nn8", nameEn: "Nanny 8 Hours", nameBn: "নানি ৮ ঘণ্টা", hoursEn: "8 hrs/day", hoursBn: "দিনে ৮ ঘণ্টা", priceEn: "৳15,000", priceBn: "৳১৫,০০০", perBn: "/মাস", perEn: "/month", color: "#f59e0b",
    featuresEn: ["Personal care & feeding","Hygiene maintenance","Educational activities","Tidying children's space","Parent collaboration"],
    featuresBn: ["ব্যক্তিগত যত্ন ও খাওয়ানো","পরিচ্ছন্নতা রক্ষা","শিক্ষামূলক কার্যকলাপ","শিশুর ঘর গোছানো","অভিভাবক সমন্বয়"] },
  { id: "nn12", nameEn: "Nanny 12 Hours", nameBn: "নানি ১২ ঘণ্টা", hoursEn: "12 hrs/day", hoursBn: "দিনে ১২ ঘণ্টা", priceEn: "৳20,000", priceBn: "৳২০,০০০", perBn: "/মাস", perEn: "/month", color: "#ec4899", featured: true,
    featuresEn: ["All 8-hour services","New mom support","Early childhood development","Emotional support","Weekly progress report"],
    featuresBn: ["৮ ঘণ্টার সব সেবা","নতুন মায়ের সহায়তা","প্রাথমিক শিশু বিকাশ","মানসিক সহায়তা","সাপ্তাহিক বিকাশ রিপোর্ট"] },
  { id: "nnl", nameEn: "Nanny Live-in", nameBn: "নানি Live-in", hoursEn: "24 hrs live-in", hoursBn: "২৪ ঘণ্টা বাড়িতে থেকে", priceEn: "৳28,000", priceBn: "৳২৮,০০০", perBn: "/মাস", perEn: "/month", color: "#f97316",
    featuresEn: ["All 12-hour services","Night duty included","Newborn specialist","Breastfeeding support","Daily video updates"],
    featuresBn: ["১২ ঘণ্টার সব সেবা","রাতের ডিউটি","নবজাতক specialist যত্ন","Breastfeeding সহায়তা","দৈনিক ভিডিও আপডেট"] },
];

const SERVICES = [
  { icon: HeartPulse, titleBn: "হোম নার্সিং কেয়ার", titleEn: "Home Nursing Care", descBn: "BSc/Diploma নার্স দ্বারা বাড়িতে hospital-quality চিকিৎসা সেবা।", descEn: "Hospital-quality nursing by BSc/Diploma certified nurses at home.", color: "#3b82f6", bg: "#eff6ff", anchor: "#packages-nurse" },
  { icon: Users, titleBn: "কেয়ারগিভার সার্ভিস", titleEn: "Caregiver Service", descBn: "Certified caregiver — বয়স্ক ও রোগীদের দৈনন্দিন সহায়তায়।", descEn: "Certified caregivers for elderly & patient daily living support.", color: "#8b5cf6", bg: "#f5f3ff", anchor: "#packages-caregiver" },
  { icon: Heart, titleBn: "বয়স্ক সেবা", titleEn: "Elderly Care", descBn: "বয়স্কদের দৈনন্দিন কাজে সহায়তা ও বিশেষ যত্ন।", descEn: "Compassionate elderly care — daily activities & wellbeing.", color: "#ec4899", bg: "#fdf2f8", anchor: "#packages-caregiver" },
  { icon: Home, titleBn: "শিশু ও Nanny সেবা", titleEn: "Baby & Nanny Care", descBn: "Trained nanny — নবজাতক থেকে শিশুর সার্বিক যত্ন।", descEn: "Trained nannies for newborn to toddler care & development.", color: "#f59e0b", bg: "#fffbeb", anchor: "#packages-nanny" },
  { icon: Activity, titleBn: "ফিজিওথেরাপি", titleEn: "Physiotherapy", descBn: "Certified physiotherapist বাড়িতে এসে treatment করবেন।", descEn: "Certified physiotherapist home visits for treatment.", color: "#10b981", bg: "#f0fdf4", anchor: "#contact" },
  { icon: Stethoscope, titleBn: "ডাক্তার হোম ভিজিট", titleEn: "Doctor Home Visit", descBn: "MBBS ডাক্তার সরাসরি বাড়িতে এসে diagnosis দেবেন।", descEn: "MBBS doctor visits your home for diagnosis & prescription.", color: "#10b981", bg: "#ecfeff", anchor: "#contact" },
];

const WHY_STEPS = [
  { icon: FileSearch, titleBn: "আবেদন যাচাই", titleEn: "Application Screening", color: "#3b82f6" },
  { icon: Users, titleBn: "সরাসরি সাক্ষাৎকার", titleEn: "Face-to-face Interview", color: "#8b5cf6" },
  { icon: ClipboardCheck, titleBn: "Background Check", titleEn: "Background Check", color: "#ec4899" },
  { icon: Award, titleBn: "৩ মাস Training", titleEn: "Intensive Training", color: "#10b981" },
  { icon: UserCheck, titleBn: "Onboarding", titleEn: "Onboarding", color: "#f59e0b" },
  { icon: RefreshCw, titleBn: "Reviews & Audits", titleEn: "Reviews & Audits", color: "#10b981" },
];

const REVIEWS = [
  { initial: "F", nameEn: "Farida B.", roleBn: "রোগীর মেয়ে", roleEn: "Daughter of Patient", color: "#3b82f6",
    bodyBn: "আমার মা দীর্ঘদিন ধরে অসুস্থ। BetterLife HomeCare-এর caregiver তাঁকে সত্যিই পরিবারের মতো দেখেছে। রাতেও যখন দরকার হয়েছে, পাশে ছিল।",
    bodyEn: "My mother has been unwell for a long time. BetterLife HomeCare's caregiver looked after her just like family. Even at night they were always there." },
  { initial: "H", nameEn: "Hasib A.", roleBn: "রোগীর ছেলে", roleEn: "Son of Patient", color: "#8b5cf6",
    bodyBn: "বাবার হার্টের অপারেশনের পর বাড়িতে professional নার্স দরকার ছিল। BetterLife HomeCare মাত্র ২৪ ঘণ্টায় nurse পাঠিয়ে দিয়েছে। সেবার মান অত্যন্ত উচ্চ।",
    bodyEn: "After my father's heart surgery, we needed a nurse at home. BetterLife HomeCare sent one within 24 hours. Excellent quality and very reasonable pricing." },
  { initial: "N", nameEn: "Nasrin K.", roleBn: "নতুন মা", roleEn: "New Mother", color: "#ec4899",
    bodyBn: "প্রথম সন্তান — অনেক ভয় ছিল। BetterLife HomeCare-এর nanny এতটাই skilled যে আমার শিশুকে দেখে নিজেও অনেক শিখলাম।",
    bodyEn: "First child — I was very nervous. BetterLife HomeCare's nanny was so skilled that watching her I learned a lot myself." },
];

const FAQS = [
  { qBn: "Caregiver ও Nurse-এর মধ্যে পার্থক্য কী?", qEn: "Difference between Caregiver and Nurse?",
    aBn: "Caregiver দৈনন্দিন সহায়তা করে — খাওয়ানো, পরিষ্কার, সঙ্গ দেওয়া। Nurse হলো medical professional — injection, wound care, vital monitoring, ICU-level care দেয়।",
    aEn: "Caregiver assists with daily living. Nurse is a medical professional providing injections, wound care, vital monitoring & ICU-level care." },
  { qBn: "Live-in মানে কী?", qEn: "What does Live-in mean?",
    aBn: "Caregiver বা Nurse আপনার বাড়িতে থেকে ২৪ ঘণ্টা সেবা দেবে। রাতেও পাশে থাকবে।",
    aEn: "The caregiver or nurse stays at your home providing 24-hour care including overnight." },
  { qBn: "Caregiver পছন্দ না হলে?", qEn: "What if caregiver is unsatisfactory?",
    aBn: "২৪ ঘণ্টার মধ্যে replace করা হবে — কোনো প্রশ্ন ছাড়াই।",
    aEn: "We replace within 24 hours — no questions asked." },
  { qBn: "আপনাদের caregiver কি verified?", qEn: "Are caregivers trained & verified?",
    aBn: "হ্যাঁ। ৬টি ধাপ: Screening → Interview → Background Check → ৩ মাস Training → Onboarding → Audit।",
    aEn: "Yes. 6 stages: Screening → Interview → Background Check → 3-month Training → Onboarding → Audit." },
  { qBn: "ঢাকার বাইরে সেবা পাওয়া যাবে?", qEn: "Do you serve outside Dhaka?",
    aBn: "বর্তমানে Dhaka ও Gazipur এ সেবা দেওয়া হচ্ছে। শীঘ্রই Chattogram ও Sylhet এ আসছি।",
    aEn: "Currently serving Dhaka and Gazipur. Coming soon to Chattogram and Sylhet." },
  { qBn: "একদিনের জন্য book করা যাবে?", qEn: "Can I book for a single day?",
    aBn: "হ্যাঁ — দিনভিত্তিক, সাপ্তাহিক এবং মাসিক প্যাকেজ সব পাওয়া যায়।",
    aEn: "Yes — daily, weekly, and monthly packages all available." },
];

/* ── Package Card ────────────────────────────────── */
function PkgCard({ pkg, isBn, onOrder }: { pkg: typeof CAREGIVER_PKGS[0] & { featured?: boolean }; isBn: boolean; onOrder: (s: string) => void }) {
  return (
    <div className={`relative flex flex-col h-full rounded-2xl p-5 transition-all hover:-translate-y-1 ${(pkg as any).featured ? "border-2 shadow-lg" : "border border-slate-200 bg-white shadow-sm"}`}
      style={(pkg as any).featured ? { borderColor: pkg.color, background: `linear-gradient(145deg,white,${pkg.color}08)`, boxShadow: `0 20px 60px ${pkg.color}20` } : {}}>
      {(pkg as any).featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg,${pkg.color},${pkg.color}cc)` }}>
            <Star className="h-2.5 w-2.5 fill-white" /> {isBn ? "সবচেয়ে জনপ্রিয়" : "Most Popular"}
          </span>
        </div>
      )}
      <div className="mb-3">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-2" style={{ background: `${pkg.color}12`, border: `1px solid ${pkg.color}25` }}>
          <Clock className="h-3 w-3" style={{ color: pkg.color }} />
          <span className="text-xs font-bold" style={{ color: pkg.color }}>{isBn ? pkg.hoursBn : pkg.hoursEn}</span>
        </div>
        <h3 className="font-extrabold text-slate-900 text-base">{isBn ? pkg.nameBn : pkg.nameEn}</h3>
        <div className="flex items-end gap-1 mt-1.5">
          <span className="text-3xl font-extrabold text-slate-900">{isBn ? pkg.priceBn : pkg.priceEn}</span>
          <span className="text-sm text-slate-400 mb-1">{isBn ? pkg.perBn : pkg.perEn}</span>
        </div>
      </div>
      <div className="h-px bg-slate-100 mb-3" />
      <ul className="flex flex-col gap-2 flex-1 mb-4">
        {(isBn ? pkg.featuresBn : pkg.featuresEn).map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <BadgeCheck className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: pkg.color }} />{f}
          </li>
        ))}
      </ul>
      <button onClick={() => onOrder(isBn ? pkg.nameBn : pkg.nameEn)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90"
        style={(pkg as any).featured
          ? { background: `linear-gradient(135deg,${pkg.color},${pkg.color}cc)`, color: "white" }
          : { background: `${pkg.color}10`, border: `1px solid ${pkg.color}28`, color: pkg.color }}>
        <MessageCircle className="h-4 w-4" />
        {isBn ? "এই প্যাকেজ নিন" : "Get This Package"}
      </button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function BetterLifeHomeCarePage() {
  const [isBn, setIsBn] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [consultModal, setConsultModal] = useState({ open: false, prefill: "" });
  const [orderModal, setOrderModal] = useState<{ open: boolean; product?: { id?: string; name: string; price: string } }>({ open: false });
  const [productSearch, setProductSearch] = useState("");

  // Supabase products
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    document.title = "BetterLife HomeCare - Trusted Nursing & Home Care Solutions in Bangladesh";
    return () => { document.title = "Insaf Web Service"; };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .order("created_at", { ascending: false });
      if (!error) setProducts((data as SiteProduct[]) || []);
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const navLinks = [
    { href: "#top", bn: "হোম", en: "Home" },
    { href: "#services", bn: "সেবাসমূহ", en: "Services" },
    { href: "#packages-caregiver", bn: "প্যাকেজ", en: "Packages" },
    { href: "#why-us", bn: "কেন আমরা", en: "Why Us" },
    { href: "#products", bn: "পণ্য", en: "Products" },
    { href: "#reviews", bn: "রিভিউ", en: "Reviews" },
    { href: "#contact", bn: "যোগাযোগ", en: "Contact" },
  ];

  return (
    <div id="top" className="min-h-screen bg-white">
      <style>{`
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .better-shimmer{background:linear-gradient(135deg,#0f9f81,#2563eb);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .card-hover{transition:all .3s cubic-bezier(.22,1,.36,1)}.card-hover:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(15,23,42,.08)}
        .wa-btn{position:fixed;bottom:18px;right:18px;z-index:999;display:flex;align-items:center;gap:8px;background:#22c55e;color:white;padding:11px 18px;border-radius:50px;font-weight:700;font-size:14px;box-shadow:0 12px 30px rgba(34,197,94,.28);text-decoration:none;animation:float 3s ease-in-out infinite}
        .hero-medical-bg{position:absolute;inset:0;background-image:linear-gradient(90deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,.84) 34%, rgba(241,248,245,.78) 55%, rgba(237,245,243,.8) 100%),url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=80');background-size:cover;background-position:center right}
        .soft-grid{background-image:linear-gradient(rgba(15,118,110,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(15,118,110,.05) 1px,transparent 1px);background-size:38px 38px}
      `}</style>

      <a href={WA_MSG} target="_blank" rel="noreferrer" className="wa-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.851L.057 23.571l5.908-1.437A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.713.903.952-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
        {isBn ? "এখনই যোগাযোগ" : "Get Care Now"}
      </a>

      <ConsultationModal open={consultModal.open} onClose={() => setConsultModal({ open: false, prefill: "" })} prefill={consultModal.prefill} />
      <OrderModal open={orderModal.open} onClose={() => setOrderModal({ open: false })} product={orderModal.product} isBn={isBn} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
        <div className="max-w-6xl mx-auto px-4 h-[72px] flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-2.5 min-w-0">
            <BetterLogo size={40} />
            <div>
              <div className="font-extrabold text-slate-900 text-sm leading-tight">BetterLife HomeCare</div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-[0.16em]">Service</div>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-600">
            {navLinks.map(l => <a key={l.href} href={l.href} className="hover:text-emerald-700 transition-colors">{isBn ? l.bn : l.en}</a>)}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsBn(!isBn)} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors">
              {isBn ? "English" : "বাংলা"}
            </button>
            <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="hidden md:flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#0f9f81,#2563eb)" }}>
              <Phone className="h-3.5 w-3.5" />{isBn ? "যোগাযোগ" : "Contact"}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-200 bg-white">
              {menuOpen ? <X className="h-4 w-4 text-slate-700" /> : <Menu className="h-4 w-4 text-slate-700" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 px-4 py-3 flex flex-col gap-1 bg-white">
            {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-3 px-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 border-b border-slate-100 last:border-0">{isBn ? l.bn : l.en}</a>)}
            <button onClick={() => { setConsultModal({ open: true, prefill: "" }); setMenuOpen(false); }} className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white text-sm" style={{ background: "linear-gradient(135deg,#0f9f81,#2563eb)" }}>
              <Phone className="h-4 w-4" />{isBn ? "যোগাযোগ করুন" : "Contact Now"}
            </button>
          </div>
        )}
      </nav>

     {/* ── Hero ── */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28 bg-slate-50">
        
        {/* ── Premium Faceless Background ── */}
        <div className="absolute inset-0 z-0">
          {/* এই ছবিটি Unsplash এর একটি ফেসলেস ছবি (হাত ধরে থাকার দৃশ্য) যা খুব ইমোশনাল এবং প্রফেশনাল */}
          <img 
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1920&q=80" 
            alt="Compassionate home care" 
            className="w-full h-full object-cover object-center"
          />
          {/* একটি সফট গ্রেডিয়েন্ট ওভারলে যা টেক্সটকে ক্লিয়ার করবে এবং প্রিমিয়াম লুক দেবে */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40" />
          <div className="absolute inset-0 soft-grid pointer-events-none opacity-40" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center mx-auto lg:mx-0 lg:text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/90 backdrop-blur-sm px-4 py-2 shadow-sm mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {isBn ? "বিশ্বস্ত হোমকেয়ার" : "Trusted HomeCare"}
              </span>
            </div>

            {/* Main Headline - Copy 1 (No dashes, no gradient text) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.18] mb-6">
              {isBn ? (
                <>
                  নিজের বাড়িতেই আপনজনদের মাঝে<br />
                  <span className="text-emerald-600">নিরাপদে সুস্থ</span> হয়ে উঠুন
                </>
              ) : (
                <>
                  Recover <span className="text-emerald-600">safely</span> at home surrounded by the ones you love
                </>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-medium">
              {isBn 
                ? "আমরা নিশ্চিত করি আপনার প্রিয়জনের জন্য হাসপাতালাইজড কোয়ালিটির নার্সিং এবং প্রশিক্ষিত কেয়ারগিভার সাপোর্ট। এখন আর চিকিৎসার জন্য ঘর ছাড়তে হবে না।"
                : "We ensure hospitalized quality nursing and trained caregiver support for your loved ones. No need to leave home for treatment anymore."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setConsultModal({ open: true, prefill: "" })} 
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-sm w-full sm:w-auto transition-transform hover:-translate-y-1 shadow-lg shadow-emerald-600/20" 
                style={{ background: "#059669" }}
              >
                <MessageCircle className="h-5 w-5" />
                {isBn ? "ফ্রি কনসালটেশন নিন" : "Get Free Consultation"}
              </button>
              <a href="#packages-caregiver" className="w-full sm:w-auto">
                <button className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-slate-700 text-sm w-full transition-all hover:-translate-y-1 border border-slate-200 bg-white/90 backdrop-blur hover:border-emerald-300 hover:text-emerald-700 shadow-sm">
                  {isBn ? "প্যাকেজ দেখুন" : "Explore Packages"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </a>
            </div>

            {/* Feature Badges - Minimalist */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start mt-10">
              {[
                { icon: BadgeCheck, label: isBn ? "ভেরিফায়েড কর্মী" : "Verified Staff" }, 
                { icon: Clock, label: isBn ? "২৪/৭ সার্ভিস" : "24/7 Service" }, 
                { icon: Shield, label: isBn ? "ব্যাকগ্রাউন্ড চেকড" : "Background Checked" }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-md border border-slate-100 px-3.5 py-2 shadow-sm">
                  <div className="bg-emerald-100 p-1 rounded-md">
                    <Icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-1.5 mb-4"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="text-xs font-bold uppercase tracking-widest text-green-700">{isBn ? "আমাদের সেবাসমূহ" : "Our Services"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "আমরা যে সেবা প্রদান করি" : "Services We Provide"}</h2>
            <p className="mt-3 max-w-xl mx-auto text-sm text-slate-500">{isBn ? "বাড়িতে বসেই পান hospital-quality সেবা।" : "Hospital-quality care at your home."}</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.titleEn} delay={i * 0.07}>
                  <div className="card-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                      <Icon className="h-7 w-7" style={{ color: s.color }} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{isBn ? s.titleBn : s.titleEn}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">{isBn ? s.descBn : s.descEn}</p>
                    <a href={s.anchor} className="inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:gap-3 self-start" style={{ color: s.color }}>
                      {isBn ? "প্যাকেজ দেখুন" : "See Packages"} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why-us" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-4"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-xs font-bold uppercase tracking-widest text-blue-700">{isBn ? "কেন আমাদের বেছে নেবেন" : "Why Choose Us"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "আমরা কিভাবে Caregiver বাছাই করি?" : "How Do We Choose Our Providers?"}</h2>
            <p className="mt-3 max-w-xl mx-auto text-sm text-slate-500">{isBn ? "প্রতিটি caregiver ৬টি কঠোর ধাপ পার করে আপনার বাড়িতে আসে।" : "Every caregiver passes 6 rigorous stages before coming to your home."}</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {WHY_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.titleEn} delay={i * 0.08}>
                  <div className="text-center p-4 rounded-2xl border border-slate-100 bg-slate-50 card-hover">
                    <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${s.color}15`, border: `2px solid ${s.color}30` }}>
                      <Icon className="h-7 w-7" style={{ color: s.color }} />
                    </div>
                    <div className="text-xs font-bold text-slate-700">{isBn ? s.titleBn : s.titleEn}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ val: "3 Month+", lBn: "Training সময়কাল", lEn: "Training Duration", color: "#3b82f6" }, { val: "0 Extra Fee", lBn: "Hidden Charge নেই", lEn: "No Hidden Charges", color: "#10b981" }, { val: "24 Houres ", lBn: "Replacement গ্যারান্টি", lEn: "Replacement Guarantee", color: "#8b5cf6" }, { val: "100%", lBn: "Satisfaction গ্যারান্টি", lEn: "Satisfaction Guarantee", color: "#ec4899" }]
              .map(s => <Reveal key={s.lEn}><div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm card-hover"><div className="text-2xl font-extrabold mb-1" style={{ color: s.color }}>{s.val}</div><div className="text-[11px] text-slate-400 font-medium">{isBn ? s.lBn : s.lEn}</div></div></Reveal>)}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section id="packages-caregiver" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-3"><Users className="h-3.5 w-3.5 text-blue-500" /><span className="text-xs font-bold uppercase tracking-widest text-blue-700">{isBn ? "কেয়ারগিভার প্যাকেজ" : "Caregiver Packages"}</span></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isBn ? "বয়স্ক ও রোগীর যত্নে Caregiver" : "Caregiver For Elderly & Patient Care"}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {CAREGIVER_PKGS.map((p, i) => <Reveal key={p.id} delay={i * 0.1}><PkgCard pkg={p} isBn={isBn} onOrder={s => setConsultModal({ open: true, prefill: s })} /></Reveal>)}
          </div>

          <div id="packages-nurse" className="scroll-mt-20" />
          <Reveal className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 mb-3"><HeartPulse className="h-3.5 w-3.5 text-emerald-500" /><span className="text-xs font-bold uppercase tracking-widest text-emerald-700">{isBn ? "নার্সিং প্যাকেজ" : "Nursing Packages"}</span></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isBn ? "Medical সেবার জন্য Certified Nurse" : "Certified Nurse For Medical Care"}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {NURSE_PKGS.map((p, i) => <Reveal key={p.id} delay={i * 0.1}><PkgCard pkg={p} isBn={isBn} onOrder={s => setConsultModal({ open: true, prefill: s })} /></Reveal>)}
          </div>

          <div id="packages-nanny" className="scroll-mt-20" />
          <Reveal className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 mb-3"><Home className="h-3.5 w-3.5 text-amber-500" /><span className="text-xs font-bold uppercase tracking-widest text-amber-700">{isBn ? "নানি / শিশু যত্ন প্যাকেজ" : "Nanny / Baby Care Packages"}</span></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isBn ? "শিশু ও নবজাতকের জন্য Trained Nanny" : "Trained Nanny For Baby & Newborn Care"}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {NANNY_PKGS.map((p, i) => <Reveal key={p.id} delay={i * 0.1}><PkgCard pkg={p} isBn={isBn} onOrder={s => setConsultModal({ open: true, prefill: s })} /></Reveal>)}
          </div>
          <Reveal className="text-center mt-4">
            <p className="text-xs text-slate-400 mb-2">{isBn ? "* সব caregiver মাসে ২ দিন ছুটি পাবেন। Meal ও accommodation client-এর দায়িত্বে।" : "* All caregivers entitled to 2 days off/month. Meals & accommodation are client's responsibility."}</p>
            <p className="text-sm text-slate-500">{isBn ? "Custom package এর জন্য " : "For custom packages "}<button onClick={() => setConsultModal({ open: true, prefill: "Custom Package" })} className="text-green-600 font-bold hover:underline">{isBn ? "এখানে ক্লিক করুন →" : "click here →"}</button></p>
          </Reveal>
        </div>
      </section>

      {/* ── Products (Supabase) ── */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-1.5 mb-4"><ShoppingCart className="h-3.5 w-3.5 text-green-600" /><span className="text-xs font-bold uppercase tracking-widest text-green-700">{isBn ? "মেডিকেল পণ্য" : "Medical Products"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "মেডিকেল সরঞ্জাম ভাড়া ও বিক্রয়" : "Medical Equipment Rent & Sale"}</h2>
            <p className="mt-3 max-w-xl mx-auto text-sm text-slate-500">{isBn ? "সব ধরনের medical equipment পাওয়া যায়। Home delivery সুবিধা।" : "All types of medical equipment available with home delivery."}</p>
            <div className="mx-auto mt-5 max-w-sm relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder={isBn ? "পণ্য খুঁজুন..." : "Search products..."} value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 shadow-sm" />
            </div>
          </Reveal>

          {loadingProducts ? (
            <div className="text-center py-10 text-slate-400">
              <p>{isBn ? "পণ্য লোড হচ্ছে..." : "Loading products..."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.04}>
                  <div className="card-hover rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="h-36 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                      <img
                        src={p.image_url || FALLBACK_PRODUCT_IMAGE}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
                      />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1 leading-tight min-h-[40px]">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed flex-1 mb-3">
                      {p.description || (isBn ? "কোনো বিবরণ নেই" : "No description")}
                    </p>
                    <div className="font-extrabold text-base mb-3 text-emerald-600">
                      {formatPrice(p.price, isBn)}
                    </div>
                    <button
                      onClick={() => setOrderModal({
                        open: true,
                        product: { id: p.id, name: p.name, price: p.price || "0" },
                      })}
                      className="w-full py-2 rounded-xl font-bold text-white text-xs transition hover:opacity-90 flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(135deg,#10b981,#8b5cf6)" }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {isBn ? "অর্ডার করুন" : "Order Now"}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p>{isBn ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}</p>
              <button onClick={() => setProductSearch("")} className="mt-2 text-sm text-green-500 hover:underline">{isBn ? "সব দেখুন" : "Show all"}</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 mb-4"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /><span className="text-xs font-bold uppercase tracking-widest text-amber-700">{isBn ? "ক্লায়েন্ট রিভিউ" : "Client Reviews"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "আমাদের ক্লায়েন্টরা কী বলেন" : "What Our Clients Say About Us"}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.initial} delay={i * 0.1}>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 h-full card-hover">
                  <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, idx) => <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-base text-slate-700 leading-relaxed mb-5">"{isBn ? r.bodyBn : r.bodyEn}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="h-11 w-11 rounded-full flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0" style={{ background: `linear-gradient(135deg,${r.color},${r.color}99)` }}>{r.initial}</div>
                    <div><div className="font-bold text-sm text-slate-900">{r.nameEn}</div><div className="text-xs text-slate-400">{isBn ? r.roleBn : r.roleEn}</div></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-1.5 mb-4"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="text-xs font-bold uppercase tracking-widest text-green-700">FAQ</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "সাধারণ প্রশ্নাবলী" : "Frequently Asked Questions"}</h2>
          </Reveal>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl overflow-hidden border transition-all" style={{ background: openFaq === i ? "#f0fdf4" : "white", borderColor: openFaq === i ? "#bbf7d0" : "#e2e8f0" }}>
                  <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="font-semibold text-sm text-slate-900">{isBn ? f.qBn : f.qEn}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  <div style={{ maxHeight: openFaq === i ? "300px" : "0", overflow: "hidden", transition: "max-height .3s ease" }}>
                    <div className="px-5 pb-5"><p className="text-sm leading-relaxed text-slate-600">{isBn ? f.aBn : f.aEn}</p></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-4"><MapPin className="h-3.5 w-3.5 text-blue-500" /><span className="text-xs font-bold uppercase tracking-widest text-blue-700">{isBn ? "আমাদের অফিস ও লোকেশন" : "Office & Location"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "যোগাযোগ করুন" : "Get In Touch"}</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">{isBn ? "গাজীপুর থেকে পরিবারগুলোর জন্য আমরা বিশ্বস্ত কেয়ারগিভার, নার্সিং কেয়ার ও হোম সাপোর্ট সেবা প্রদান করি। ফোন, WhatsApp বা ম্যাপের মাধ্যমে সহজেই আমাদের সাথে যুক্ত হতে পারেন।" : "From Gazipur, we provide dependable caregiver, nursing, and home support services for families who need trusted care. Reach us by phone, WhatsApp, or map."}</p>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <Reveal>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-7 shadow-sm h-full">
                <h3 className="font-bold text-slate-900 mb-2">{isBn ? "আমাদের তথ্য" : "Contact Information"}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{isBn ? "দ্রুত রেসপন্স, পরিষ্কার লোকেশন ও সহজ যোগাযোগ—সবকিছু এক জায়গায়।" : "Everything you need to contact us quickly, clearly, and confidently."}</p>
                <div className="flex flex-col gap-4 mb-6">
                  {[{ icon: MapPin, title: isBn ? "ঠিকানা" : "Address", text: "Bagdad Tanzia Tower, Cawrasta, Gazipur, Dhaka", color: "#2563eb" }, { icon: Clock, title: isBn ? "অফিস সময়" : "Working Hours", text: isBn ? "শনিবার – বৃহস্পতিবার: সকাল ৮টা – রাত ৮টা" : "Saturday to Thursday: 8am – 8pm", color: "#059669" }, { icon: Phone, title: isBn ? "মোবাইল" : "Phone", text: "+880 1618-699125", color: "#7c3aed" }]
                    .map(({ icon: Icon, title, text, color }) => <div key={title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5"><div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}><Icon className="h-4 w-4" style={{ color }} /></div><div><div className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</div><span className="text-sm text-slate-700 leading-relaxed">{text}</span></div></div>)}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <a href={WA_MSG} target="_blank" rel="noreferrer" className="sm:col-span-2">
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm hover:opacity-90 transition" style={{ background: "#25D366" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.851L.057 23.571l5.908-1.437A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.713.903.952-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
                      WhatsApp: +880 1618-699125
                    </button>
                  </a>
                  <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#0f9f81,#2563eb)" }}>
                    <MessageCircle className="h-4 w-4" />{isBn ? "ফ্রি কনসালটেশন" : "Free Consultation"}
                  </button>
                  <a href="tel:+8801618699125"><button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-slate-800 text-sm border border-slate-200 bg-white hover:scale-[1.01] transition"><Phone className="h-4 w-4 text-blue-500" />{isBn ? "সরাসরি কল" : "Call Directly"}</button></a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[28px] overflow-hidden border border-slate-200 shadow-sm h-full min-h-[340px] bg-white">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{isBn ? "ম্যাপে লোকেশন" : "Find Us on Map"}</h3>
                    <p className="text-xs text-slate-500">{isBn ? "নেভিগেশনের জন্য Google Maps ব্যবহার করুন" : "Use Google Maps for direct navigation"}</p>
                  </div>
                  <a href="https://maps.google.com/?q=Bagdad+Tanzia+Tower,+Cawrasta,+Gazipur,+Dhaka" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">{isBn ? "গুগল ম্যাপে খুলুন" : "Open in Google Maps"}</a>
                </div>
                <iframe src="https://www.google.com/maps?q=Bagdad%20Tanzia%20Tower%2C%20Cawrasta%2C%20Gazipur%2C%20Dhaka&z=15&output=embed"
                  width="100%" height="100%" style={{ border: 0, minHeight: "300px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="BetterLife HomeCare Location" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-[32px] relative overflow-hidden border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.08)]" style={{ background: "linear-gradient(135deg,#0f9f81 0%,#2f7df4 100%)" }}>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 text-center relative z-10">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-4 py-1.5 mb-6"><Heart className="h-3.5 w-3.5 text-white fill-white" /><span className="text-xs font-bold uppercase tracking-widest text-white">{isBn ? "আজই যোগাযোগ করুন" : "Contact Us Today"}</span></div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{isBn ? <>আপনার প্রিয়জনের জন্য<br />নিরাপদ ও বিশ্বস্ত সেবা</> : <>Safe, Trusted Care For<br />Your Loved One</>}</h2>
                <p className="text-white/85 max-w-2xl mx-auto mb-8">{isBn ? "ফ্রি কনসালটেশন, দ্রুত কলব্যাক এবং গাজীপুর ভিত্তিক সাপোর্ট—আপনার প্রয়োজন বুঝে উপযুক্ত কেয়ারগিভার বা নার্সিং সেবা সাজিয়ে দিই।" : "Get a free consultation, quick callback, and dependable support from our Gazipur-based team. We help you choose the right caregiver or nursing care with confidence."}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-slate-900 bg-white transition hover:scale-[1.02] shadow-lg">
                    <MessageCircle className="h-5 w-5 text-emerald-500" />{isBn ? "ফ্রি কনসালটেশন নিন" : "Get Free Consultation"}
                  </button>
                  <a href="tel:+8801618699125"><button className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white border border-white/40 bg-white/12 transition hover:scale-[1.02]"><Phone className="h-5 w-5" />{isBn ? "এখনই কল করুন" : "Call Us Now"}</button></a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <BetterLogo size={36} />
                <div>
                  <div className="font-extrabold text-white text-sm">BetterLife HomeCare</div>
                  <div className="text-[10px] text-emerald-400 font-semibold tracking-[0.14em] uppercase">Better Life. Better Care.</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">{isBn ? "গাজীপুর ভিত্তিক BetterLife HomeCare পরিবারগুলোর জন্য বিশ্বস্ত কেয়ারগিভার, নার্সিং কেয়ার, ফিজিওথেরাপি ও হোম সাপোর্ট সেবা পৌঁছে দেয়—নিরাপদ, সম্মানজনক ও দায়িত্বশীল যত্নের প্রতিশ্রুতি নিয়ে।" : "BetterLife HomeCare provides trusted caregiver, nursing care, physiotherapy, and home support services for families in and around Gazipur with a focus on safe, respectful, and dependable care."}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-3">{isBn ? "দ্রুত লিংক" : "Quick Links"}</h4>
              <div className="flex flex-col gap-2">
                {navLinks.map(l => <a key={l.href} href={l.href} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">{isBn ? l.bn : l.en}</a>)}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-3">{isBn ? "যোগাযোগ" : "Contact"}</h4>
              <div className="flex flex-col gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-400" />+880 1618-699125</div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />Bagdad Tanzia Tower, Cawrasta, Gazipur, Dhaka</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-400" />{isBn ? "শনিবার–বৃহস্পতিবার: সকাল ৮টা – রাত ৮টা" : "Sat–Thu: 8am – 8pm"}</div>
                <a href="https://maps.google.com/?q=Bagdad+Tanzia+Tower,+Cawrasta,+Gazipur,+Dhaka" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold">{isBn ? "গুগল ম্যাপে দেখুন" : "View on Google Maps"}</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">© ২০২৫ BetterLife HomeCare। {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Powered by</span>
              <Link to="/" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Insaf Web Service</Link>
              <span className="text-slate-700">•</span>
              <span className="text-slate-500">Professional Web Agency</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
