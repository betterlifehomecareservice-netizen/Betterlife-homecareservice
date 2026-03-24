import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, Award, BadgeCheck, ChevronDown,
  ClipboardCheck, Clock, FileSearch, Heart, HeartPulse,
  Home, MapPin, MessageCircle, Phone, RefreshCw, Search,
  Shield, ShoppingCart, Star, Stethoscope, Users, UserCheck,
  X, Zap,
} from "lucide-react";

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
      <path d="M20 4L4 16V36H15V26H25V36H36V16L20 4Z" fill="url(#lg1)" rx="2" />
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
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80";

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

/* ── Product Order Modal ─────────────────────────── */
function OrderModal({ open, onClose, product }: { open: boolean; onClose: () => void; product?: { name: string; price: string } }) {
  const [form, setForm] = useState({ name: "", phone: "" });

  const submit = () => {
    if (!form.name || !form.phone) { alert("নাম ও ফোন নম্বর দিন"); return; }
    const txt = `🛒 পণ্যের অর্ডার:\nপণ্য: ${product?.name}\nদাম: ${product?.price}\nনাম: ${form.name}\nফোন: ${form.phone}`;
    window.open(`${WA_BASE}?text=${encodeURIComponent(txt)}`, "_blank");
    onClose();
  };

  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <X className="h-4 w-4 text-slate-600" />
        </button>
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 bg-green-50 border border-green-200">
            <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700">অর্ডার করুন</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">{product.name}</h3>
          <p className="text-green-600 font-bold text-xl mt-1">{product.price}</p>
        </div>
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="আপনার নাম *" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="মোবাইল নম্বর *" type="tel" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <button onClick={submit}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mt-1 transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
            <ShoppingCart className="h-4 w-4" /> অর্ডার Confirm করুন
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Data ────────────────────────────────────────── */
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

const PRODUCTS = [
  {
    id: 1,
    nameBn: "হাসপাতাল বেড (স্ট্যান্ডার্ড)",
    nameEn: "Hospital Bed (Standard)",
    priceBn: "৳২২,০০০",
    priceEn: "৳22,000",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Hospital%20bed%20for%20patients.jpg",
    bg: "#f0fdf4",
    color: "#10b981",
    descBn: "Manual adjustable, sturdy frame, mattress included",
    descEn: "Manual adjustable, sturdy frame, mattress included"
  },
  {
    id: 2,
    nameBn: "নেবুলাইজার মেশিন",
    nameEn: "Nebulizer Machine",
    priceBn: "৳৩,৫০০",
    priceEn: "৳3,500",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Medical%20Nebulizer%20%28cropped%29.jpg",
    bg: "#ecfdf5",
    color: "#059669",
    descBn: "Compressor nebulizer, quiet operation, mask set included",
    descEn: "Compressor nebulizer, quiet operation, mask set included"
  },
  {
    id: 3,
    nameBn: "অক্সিজেন সিলিন্ডার",
    nameEn: "Oxygen Cylinder",
    priceBn: "৳৮,০০০",
    priceEn: "৳8,000",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Oxygen%20cylinder.jpg",
    bg: "#f5f3ff",
    color: "#8b5cf6",
    descBn: "Medical grade, regulator & mask included",
    descEn: "Medical grade, regulator & mask included"
  },
  {
    id: 4,
    nameBn: "BP মনিটর (ডিজিটাল)",
    nameEn: "BP Monitor (Digital)",
    priceBn: "৳২,৮০০",
    priceEn: "৳2,800",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Blood%20Pressure%20Monitor.jpg",
    bg: "#fdf2f8",
    color: "#ec4899",
    descBn: "Upper arm auto BP & pulse monitor, 90 reading memory",
    descEn: "Upper arm auto BP & pulse monitor, 90 reading memory"
  },
  {
    id: 5,
    nameBn: "হুইলচেয়ার (ফোল্ডেবল)",
    nameEn: "Wheelchair (Foldable)",
    priceBn: "৳১২,০০০",
    priceEn: "৳12,000",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    bg: "#fef9c3",
    color: "#ca8a04",
    descBn: "Foldable lightweight wheelchair, footrest & armrest included",
    descEn: "Foldable lightweight wheelchair, footrest & armrest included"
  },
];

const REVIEWS = [
  { initial: "F", nameEn: "Farida B.", roleBn: "রোগীর মেয়ে", roleEn: "Daughter of Patient", color: "#3b82f6",
    bodyBn: "আমার মা দীর্ঘদিন ধরে অসুস্থ। BetterLife HomeCare-এর caregiver তাঁকে সত্যিই পরিবারের মতো দেখেছে। রাতেও যখন দরকার হয়েছে, পাশে ছিল। এই সেবা না থাকলে আমি কীভাবে চলতাম জানি না।",
    bodyEn: "My mother has been unwell for a long time. BetterLife HomeCare's caregiver looked after her just like family. Even at night they were always there." },
  { initial: "H", nameEn: "Hasib A.", roleBn: "রোগীর ছেলে", roleEn: "Son of Patient", color: "#8b5cf6",
    bodyBn: "বাবার হার্টের অপারেশনের পর বাড়িতে professional নার্স দরকার ছিল। BetterLife HomeCare মাত্র ২৪ ঘণ্টায় nurse পাঠিয়ে দিয়েছে। সেবার মান অত্যন্ত উচ্চ এবং দাম সাশ্রয়ী।",
    bodyEn: "After my father's heart surgery, we needed a nurse at home. BetterLife HomeCare sent one within 24 hours. Excellent quality and very reasonable pricing." },
  { initial: "N", nameEn: "Nasrin K.", roleBn: "নতুন মা", roleEn: "New Mother", color: "#ec4899",
    bodyBn: "প্রথম সন্তান — অনেক ভয় ছিল। BetterLife HomeCare-এর nanny এতটাই skilled যে আমার শিশুকে দেখে নিজেও অনেক শিখলাম। সত্যিই বিশ্বস্ত সেবা।",
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
  const [orderModal, setOrderModal] = useState<{ open: boolean; product?: { name: string; price: string } }>({ open: false });
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    document.title = "BetterLife HomeCare - Trusted Nursing & Home Care Solutions in Bangladesh";
    return () => { document.title = "Insaf Web Service"; };
  }, []);

  const filteredProducts = PRODUCTS.filter(p =>
    p.nameBn.includes(productSearch) ||
    p.nameEn.toLowerCase().includes(productSearch.toLowerCase())
  );

  const navLinks = [
    { href: "#services", bn: "সেবাসমূহ", en: "Services" },
    { href: "#packages-caregiver", bn: "প্যাকেজ", en: "Packages" },
    { href: "#why-us", bn: "কেন আমরা", en: "Why Us" },
    { href: "#products", bn: "পণ্য", en: "Products" },
    { href: "#reviews", bn: "রিভিউ", en: "Reviews" },
    { href: "#contact", bn: "যোগাযোগ", en: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .better-shimmer{background:linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
        .card-hover{transition:all .3s cubic-bezier(.22,1,.36,1)}.card-hover:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.08)}
        .wa-btn{position:fixed;bottom:24px;right:20px;z-index:999;display:flex;align-items:center;gap:8px;background:#25D366;color:white;padding:12px 20px;border-radius:50px;font-weight:700;font-size:14px;box-shadow:0 8px 32px rgba(37,211,102,.4);text-decoration:none;animation:float 3s ease-in-out infinite}
      `}</style>

      <a href={WA_MSG} target="_blank" rel="noreferrer" className="wa-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.851L.057 23.571l5.908-1.437A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.713.903.952-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
        {isBn ? "এখনই যোগাযোগ" : "Get Care Now"}
      </a>

      <ConsultationModal open={consultModal.open} onClose={() => setConsultModal({ open: false, prefill: "" })} prefill={consultModal.prefill} />
      <OrderModal open={orderModal.open} onClose={() => setOrderModal({ open: false })} product={orderModal.product} />

      <nav className="sticky top-0 z-50 border-b border-green-100 shadow-sm" style={{ background: "linear-gradient(135deg,#dcfce7,#f0fdf4)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BetterLogo size={40} />
            <div>
              <div className="font-extrabold text-slate-900 text-sm leading-tight">BetterLife HomeCare</div>
              <div className="text-[10px] text-green-700 font-bold uppercase tracking-wide">Service</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-slate-600">
            {navLinks.map(l => <a key={l.href} href={l.href} className="hover:text-green-700 transition-colors">{isBn ? l.bn : l.en}</a>)}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsBn(!isBn)} className="rounded-xl border border-green-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-green-400 transition-colors">
              {isBn ? "EN" : "বাং"}
            </button>
            <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="hidden md:flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
              <Phone className="h-3.5 w-3.5" />{isBn ? "যোগাযোগ" : "Contact"}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl border border-green-200 bg-white/70 gap-1.5">
              <div className="w-4 h-0.5 bg-slate-700 rounded" /><div className="w-4 h-0.5 bg-slate-700 rounded" /><div className="w-4 h-0.5 bg-slate-700 rounded" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-green-100 px-4 py-3 flex flex-col gap-1" style={{ background: "linear-gradient(135deg,#dcfce7,#f0fdf4)" }}>
            {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2.5 px-2 text-sm font-semibold text-slate-700 hover:text-green-700 border-b border-green-100 last:border-0">{isBn ? l.bn : l.en}</a>)}
            <button onClick={() => { setConsultModal({ open: true, prefill: "" }); setMenuOpen(false); }} className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
              <Phone className="h-4 w-4" />{isBn ? "যোগাযোগ করুন" : "Contact Now"}
            </button>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden py-16 sm:py-20 text-center" style={{ background: "linear-gradient(145deg,#f0fdf4 0%,#dcfce7 40%,#f5f3ff 100%)" }}>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#10b981,transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#059669 1px,transparent 1px),linear-gradient(90deg,#059669 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 backdrop-blur px-4 py-2 shadow-sm mb-6">
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-green-500 opacity-70" style={{ animation: "pulse-ring 1.8s ease-out infinite" }} /><span className="relative h-2 w-2 rounded-full bg-green-500" /></span>
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-widest">{isBn ? "সেরা হোমকেয়ার — বাংলাদেশ" : "Trusted HomeCare — Bangladesh"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-5">
            {isBn ? <><span className="better-shimmer">বিশ্বস্ত কেয়ারগিভার</span> এবং<br />অভিজ্ঞ নার্সিং সেবা—<br />এখন আপনার হাতের নাগালে</>
              : <><span className="better-shimmer">Trusted Caregivers</span> &<br />Expert Nursing Care—<br />Now At Your Doorstep</>}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto mb-8">
            {isBn ? "অভিজ্ঞ নার্স, ভেরিফাইড কেয়ারগিভার ও দক্ষ ফিজিওথেরাপিস্টের মাধ্যমে ২৪/৭ হোম কেয়ার সাপোর্ট — বাড়ির নিরাপদ পরিবেশে।"
              : "Experienced nurses, verified caregivers & skilled physiotherapists — 24/7 home care support in the safety of your home."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white text-sm w-full sm:w-auto transition-all hover:scale-[1.03]" style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)", boxShadow: "0 12px 32px rgba(6,182,212,.25)" }}>
              <MessageCircle className="h-4 w-4" />{isBn ? "ফ্রি Consultation নিন" : "Get Free Consultation"}<ArrowRight className="h-4 w-4" />
            </button>
            <a href="#packages-caregiver"><button className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-slate-700 text-sm w-full sm:w-auto transition-all hover:scale-[1.03] border border-slate-200 bg-white shadow-sm">{isBn ? "আমাদের প্যাকেজ দেখুন" : "Explore Packages"}</button></a>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {[{ icon: BadgeCheck, label: "Verified Caregiver", color: "#3b82f6" }, { icon: Clock, label: isBn ? "২৪/৭ সার্ভিস" : "24/7 Service", color: "#10b981" }, { icon: Shield, label: "Background Checked", color: "#8b5cf6" }, { icon: Zap, label: isBn ? "২৪ঘণ্টায় Replacement" : "24hr Replacement", color: "#10b981" }]
              .map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-full border border-white bg-white/80 backdrop-blur px-3 py-1.5 shadow-sm">
                  <Icon className="h-3 w-3" style={{ color }} /><span className="text-[11px] font-semibold text-slate-600">{label}</span>
                </div>
              ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[{ val: "৫০০+", label: isBn ? "রোগী সেবা" : "Patients Served", color: "#3b82f6" }, { val: "৫০+", label: isBn ? "Verified Caregiver" : "Verified Caregivers", color: "#8b5cf6" }, { val: "২৪/৭", label: isBn ? "সার্ভিস" : "Service Hours", color: "#ec4899" }, { val: "১০০%", label: isBn ? "Satisfaction গ্যারান্টি" : "Satisfaction Rate", color: "#f59e0b" }]
              .map(s => <div key={s.label} className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur px-3 py-4 text-center shadow-sm"><div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.val}</div><div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div></div>)}
          </div>
        </div>
      </section>

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
            {[{ val: "৩ মাস+", lBn: "Training সময়কাল", lEn: "Training Duration", color: "#3b82f6" }, { val: "০ টাকা", lBn: "Hidden Charge নেই", lEn: "No Hidden Charges", color: "#10b981" }, { val: "২৪ ঘণ্টা", lBn: "Replacement গ্যারান্টি", lEn: "Replacement Guarantee", color: "#8b5cf6" }, { val: "১০০%", lBn: "Satisfaction গ্যারান্টি", lEn: "Satisfaction Guarantee", color: "#ec4899" }]
              .map(s => <Reveal key={s.lEn}><div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm card-hover"><div className="text-2xl font-extrabold mb-1" style={{ color: s.color }}>{s.val}</div><div className="text-[11px] text-slate-400 font-medium">{isBn ? s.lBn : s.lEn}</div></div></Reveal>)}
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredProducts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.04}>
                <div className="card-hover rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col h-full overflow-hidden">
                  <div
                    className="h-32 rounded-xl overflow-hidden mb-3 border border-slate-100"
                    style={{ background: p.bg }}
                  >
                    <img
                      src={p.image}
                      alt={isBn ? p.nameBn : p.nameEn}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-1 leading-tight min-h-[40px]">
                    {isBn ? p.nameBn : p.nameEn}
                  </h3>

                  <p className="text-[11px] text-slate-400 leading-relaxed flex-1 mb-3">
                    {isBn ? p.descBn : p.descEn}
                  </p>

                  <div className="font-extrabold text-base mb-3" style={{ color: p.color }}>
                    {isBn ? p.priceBn : p.priceEn}
                  </div>

                  <button
                    onClick={() => setOrderModal({
                      open: true,
                      product: {
                        name: isBn ? p.nameBn : p.nameEn,
                        price: isBn ? p.priceBn : p.priceEn
                      }
                    })}
                    className="w-full py-2 rounded-xl font-bold text-white text-xs transition hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)` }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {isBn ? "অর্ডার করুন" : "Order Now"}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p>{isBn ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}</p>
              <button onClick={() => setProductSearch("")} className="mt-2 text-sm text-green-500 hover:underline">{isBn ? "সব দেখুন" : "Show all"}</button>
            </div>
          )}
        </div>
      </section>

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
                  <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
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

      <section id="contact" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-4"><MapPin className="h-3.5 w-3.5 text-blue-500" /><span className="text-xs font-bold uppercase tracking-widest text-blue-700">{isBn ? "আমাদের অফিস" : "Our Location"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{isBn ? "যোগাযোগ করুন" : "Get In Touch"}</h2>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Reveal>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">{isBn ? "আমাদের তথ্য" : "Contact Information"}</h3>
                <div className="flex flex-col gap-3 mb-5">
                  {[{ icon: MapPin, text: "Bagdad Tanzia Tower, Cawrasta, Gazipur, Dhaka", color: "#3b82f6" }, { icon: Clock, text: isBn ? "শনিবার – বৃহস্পতিবার: সকাল ৮টা – রাত ৮টা" : "Saturday to Thursday: 8am – 8pm", color: "#10b981" }, { icon: Phone, text: "+880 1618-699125", color: "#8b5cf6" }]
                    .map(({ icon: Icon, text, color }) => <div key={text} className="flex items-start gap-3"><div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}><Icon className="h-4 w-4" style={{ color }} /></div><span className="text-sm text-slate-600 leading-relaxed">{text}</span></div>)}
                </div>
                <div className="flex flex-col gap-2.5">
                  <a href={WA_MSG} target="_blank" rel="noreferrer">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition" style={{ background: "#25D366" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.851L.057 23.571l5.908-1.437A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.713.903.952-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
                      WhatsApp: +880 1618-699125
                    </button>
                  </a>
                  <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
                    <MessageCircle className="h-4 w-4" />{isBn ? "ফ্রি Consultation নিন" : "Get Free Consultation"}
                  </button>
                  <a href="tel:+8801618699125"><button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-800 text-sm border border-slate-200 bg-white hover:scale-[1.02] transition"><Phone className="h-4 w-4 text-blue-500" />{isBn ? "সরাসরি কল করুন" : "Call Directly"}</button></a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-full min-h-[300px]">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.5!2d90.4125!3d23.9925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c19ac0f90b51%3A0x0!2sCawrasta%2C+Gazipur!5e0!3m2!1sen!2sbd!4v1"
                  width="100%" height="100%" style={{ border: 0, minHeight: "300px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="BetterLife HomeCare Location" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#059669 0%,#3b82f6 50%,#8b5cf6 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur px-4 py-1.5 mb-6"><Heart className="h-3.5 w-3.5 text-white fill-white" /><span className="text-xs font-bold uppercase tracking-widest text-white">{isBn ? "আজই যোগাযোগ করুন" : "Contact Us Today"}</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">{isBn ? <>আপনার প্রিয়জন deserve করেন<br />সেরা সেবা</> : <>Your Loved One Deserves<br />The Best Care</>}</h2>
            <p className="text-white/80 mb-8">{isBn ? "বিনামূল্যে consultation-এর জন্য এখনই যোগাযোগ করুন। আমরা ২৪ ঘণ্টা ready।" : "Contact us now for a free consultation. We're available 24/7."}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setConsultModal({ open: true, prefill: "" })} className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-slate-900 bg-white transition hover:scale-[1.03] shadow-lg">
                <MessageCircle className="h-5 w-5 text-green-500" />{isBn ? "ফ্রি Consultation নিন" : "Get Free Consultation"}
              </button>
              <a href="tel:+8801618699125"><button className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white border border-white/40 bg-white/15 backdrop-blur transition hover:scale-[1.03]"><Phone className="h-5 w-5" />{isBn ? "কল করুন" : "Call Us"}</button></a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <BetterLogo size={36} />
                <div>
                  <div className="font-extrabold text-white text-sm">BetterLife HomeCare</div>
                  <div className="text-[10px] text-green-400 font-semibold">Better Life. Better Care.</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{isBn ? "বাড়িতে বসেই পান hospital-quality সেবা।" : "Hospital-quality care delivered at your home."}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-300 text-sm mb-3">{isBn ? "দ্রুত লিংক" : "Quick Links"}</h4>
              <div className="flex flex-col gap-2">
                {navLinks.map(l => <a key={l.href} href={l.href} className="text-xs text-slate-400 hover:text-green-400 transition-colors">{isBn ? l.bn : l.en}</a>)}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-300 text-sm mb-3">{isBn ? "যোগাযোগ" : "Contact"}</h4>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-green-400" />+880 1618-699125</div>
                <div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />Bagdad Tanzia Tower, Cawrasta, Gazipur, Dhaka</div>
                <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-green-400" />{isBn ? "শনিবার–বৃহস্পতিবার: ৮টা–৮টা" : "Sat–Thu: 8am–8pm"}</div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">© ২০২৫ BetterLife HomeCare। সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{isBn ? "Powered by" : "Powered by"}</span>
              <Link to="/" className="font-bold text-green-400 hover:text-green-300 transition-colors">Insaf Web Service</Link>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{isBn ? "Professional Web Agency" : "Professional Web Agency"}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
        }
