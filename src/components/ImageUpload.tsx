import { useRef, useState } from "react";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { uploadImageToCloudinary } from "../lib/cloudinary";

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  language?: "en" | "bn";
};

export default function ImageUpload({
  label,
  value,
  onChange,
  language = "en",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isBn = language === "bn";

  const handlePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const result = await uploadImageToCloudinary(file);
      onChange(result.url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : isBn ? "ছবি আপলোড ব্যর্থ হয়েছে" : "Image upload failed";
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
        {value ? (
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <img
              src={value}
              alt="Uploaded preview"
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-600 bg-slate-900 text-slate-500">
            {isBn ? "কোনো ছবি নির্বাচন করা হয়নি" : "No image selected"}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isBn ? "আপলোড হচ্ছে..." : "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {isBn ? "ছবি বাছাই করুন" : "Choose Image"}
              </>
            )}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
              {isBn ? "সরান" : "Remove"}
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          {isBn
            ? "ক্যামেরা, গ্যালারি বা ফাইল থেকে ছবি বেছে নিতে পারবেন"
            : "You can choose from camera, gallery, or files"}
        </p>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
