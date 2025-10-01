"use client";

import { useState } from "react";

interface GenerateFormProps {
  remainingCredits: number;
  onGenerate: (prompt: string, style: string, image?: File) => Promise<void>;
}

const STYLES = [
  { id: "realistic", name: "რეალისტური", emoji: "📷" },
  { id: "anime", name: "ანიმე", emoji: "🎌" },
  { id: "digital-art", name: "ციფრული ხელოვნება", emoji: "🎨" },
  { id: "oil-painting", name: "ზეთის საღებავი", emoji: "🖼️" },
  { id: "watercolor", name: "აკვარელი", emoji: "🌊" },
  { id: "3d-render", name: "3D რენდერი", emoji: "🎲" },
];

export default function GenerateForm({ remainingCredits, onGenerate }: GenerateFormProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || remainingCredits < 1 || loading) return;

    setLoading(true);
    try {
      await onGenerate(prompt, selectedStyle);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Input */}
      <div>
        <label htmlFor="prompt" className="block text-sm font-semibold text-gray-200 mb-2">
          აღწერეთ სასურველი ვიზუალი
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          disabled={loading}
          rows={4}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500 resize-none"
          placeholder="მაგ: ფოტურეალისტური პეიზაჟი მთებითა და მზის ჩასვლით, დეტალური, მაღალი ხარისხის"
        />
        <p className="mt-2 text-xs text-gray-400">
          რაც უფრო დეტალურია აღწერა, მით უკეთესია შედეგი.
        </p>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-200 mb-3">
          აირჩიეთ სტილი
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.id)}
              disabled={loading}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${
                  selectedStyle === style.id
                    ? "border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20"
                    : "border-gray-600 bg-gray-900/30 hover:border-purple-400 hover:bg-gray-800/50"
                }
                ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="text-3xl mb-2">{style.emoji}</div>
              <div className="text-sm font-medium text-white">
                {style.name}
              </div>
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || remainingCredits < 1}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-white text-lg
            transition-all transform
            ${
              loading || remainingCredits < 1
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              იგენერირება...
            </span>
          ) : remainingCredits < 1 ? (
            "კრედიტები ამოწურულია"
          ) : (
            `🎨 ვიზუალის გენერაცია (1 კრედიტი)`
          )}
        </button>
      </div>
    </form>
  );
}
