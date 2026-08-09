import React, { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "../../services/api";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, label, disabled = false }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPG/WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setLoading(true);
    try {
      const data = await uploadImage(file);
      const url = data.data?.secure_url || data.secure_url || "";
      if (url) {
        onChange(url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative size-16 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0 group">
            <img src={value} alt="Preview" className="size-full object-cover" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} className="text-white" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`size-16 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 transition-colors shrink-0 ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-blue-500 hover:text-zinc-300 cursor-pointer"}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <ImageIcon size={16} />}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left"
          >
            {loading ? "Uploading image..." : value ? (disabled ? "Portrait Saved" : "Change Image") : "Upload Image"}
          </button>
          <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP formats up to 5MB</span>
        </div>
      </div>
      <input
        type="file"
        disabled={disabled}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
