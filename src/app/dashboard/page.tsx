"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import GenerateForm from "@/components/dashboard/GenerateForm";
import PricingModal from "@/components/dashboard/PricingModal";

interface UserProfile {
  id: string;
  username: string | null;
  remaining_credits: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Auto-show pricing modal when credits = 0
  useEffect(() => {
    if (profile && profile.remaining_credits === 0 && !showPricingModal) {
      setShowPricingModal(true);
    }
  }, [profile, showPricingModal]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoadingProfile(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    setLoadingProfile(false);
  };

  const fetchStats = async () => {
    if (!user) return;

    // Fetch total generations
    const { count: totalCount } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Fetch today's generations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayCount } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    setStats({
      total: totalCount || 0,
      today: todayCount || 0,
    });
  };

  if (loading || loadingProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center px-4">
        <div className="text-2xl font-semibold text-purple-400 animate-pulse">მიმდინარეობს...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handlePurchase = async (priceId: string, credits: number) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error("No auth token");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId, credits }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Purchase failed");
      }

      // TODO: Stripe-ის შემთხვევაში redirect to checkout
      // if (data.url) {
      //   window.location.href = data.url;
      // }

      // ტესტ რეჟიმში - პირდაპირ განახლება
      alert(data.message);
      setShowPricingModal(false);
      fetchProfile(); // Refresh credits
    } catch (error: any) {
      console.error("Purchase error:", error);
      alert(`❌ შეცდომა: ${error.message}`);
    }
  };

  const handleGenerate = async (prompt: string, style: string, image?: File) => {
    if (!user) return;

    setGenerating(true);
    setGeneratedImage(null);

    try {
      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please login again");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("style", style);
      if (image) {
        formData.append("image", image);
      }

      // Call API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Success!
      setGeneratedImage(data.imageUrl);
      
      // Update credits in UI
      setProfile((prev) =>
        prev
          ? { ...prev, remaining_credits: data.remainingCredits }
          : null
      );

      alert("✅ სურათი წარმატებით გენერირდა!");
    } catch (error: any) {
      console.error("Generation error:", error);
      alert(`❌ შეცდომა: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 pb-20">
      {/* Header - Responsive */}
      <div className="bg-gray-800/30 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                მართვის პანელი
              </h1>
              <p className="text-sm text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-none">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Buy Credits Button */}
              <button
                onClick={() => setShowPricingModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-green-500/50"
              >
                💎 კრედიტების ყიდვა
              </button>
              
              {/* Credits Badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-purple-500/50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-bold text-lg">
                  {profile?.remaining_credits ?? 0}
                </span>
              </div>
              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="px-5 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl hover:bg-gray-700 text-white transition-all text-sm sm:text-base font-medium"
              >
                გასვლა
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Generation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generation Form */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎨 AI ვიზუალის გენერაცია
              </h2>
              <GenerateForm
                remainingCredits={profile?.remaining_credits ?? 0}
                onGenerate={handleGenerate}
              />
              
              {generating && (
                <div className="mt-6 p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border-2 border-purple-500/50 backdrop-blur-xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl">🎨</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-300">
                        AI ქმნის თქვენს ვიზუალს...
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        პროცესი 10-20 წამს წაგართმევთ
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Image Result */}
            {generatedImage && !generating && (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                  <span>✨</span> თქვენი ვიზუალი
                </h3>
                <div className="relative group">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-xl shadow-2xl border border-gray-700"
                    onLoad={() => console.log("Image loaded successfully:", generatedImage)}
                    onError={(e) => {
                      console.error("Image failed to load:", generatedImage);
                      console.error("Error details:", e);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-xl" />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={generatedImage}
                    download
                    className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold text-center"
                  >
                    ⬇️ ჩამოტვირთვა
                  </a>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="flex-1 sm:flex-none px-8 py-3 bg-gray-700/50 border border-gray-600 rounded-xl hover:bg-gray-700 text-white transition-all font-semibold"
                  >
                    სხვა ვიზუალის შექმნა
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - User Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <span>👤</span> პროფილი
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">მომხმარებელი</p>
                  <p className="font-semibold text-white break-words">
                    {profile?.username || "User"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">ელ. ფოსტა</p>
                  <p className="font-semibold text-white break-words">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">რეგისტრაციის თარიღი</p>
                  <p className="font-semibold text-white">
                    {new Date(user.created_at || "").toLocaleDateString("ka-GE")}
                  </p>
                </div>
              </div>
            </div>

            {/* Credits Info */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-500/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <span>💎</span> კრედიტები
              </h3>
              <div className="text-center py-6">
                <div className="text-5xl sm:text-6xl font-bold text-white">
                  {profile?.remaining_credits ?? 0}
                </div>
                <p className="text-sm text-purple-300 mt-3">
                  დარჩენილი კრედიტები
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-purple-500/30">
                <p className="text-sm text-purple-200 text-center">
                  1 გენერაცია = 1 კრედიტი
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <span>📊</span> სტატისტიკა
                </h3>
                <Link
                  href="/history"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ისტორია →
                </Link>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">სულ გენერირებული</span>
                  <span className="font-bold text-white text-lg">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">დღეს</span>
                  <span className="font-bold text-white text-lg">{stats.today}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handlePurchase}
      />
    </main>
  );
}

