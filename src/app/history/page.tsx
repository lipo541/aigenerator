"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Generation {
  id: string;
  prompt: string;
  style_chosen: string;
  image_url: string;
  created_at: string;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingGenerations, setLoadingGenerations] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchGenerations();
    }
  }, [user]);

  const fetchGenerations = async () => {
    if (!user) return;

    setLoadingGenerations(true);
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching generations:", error);
    } else {
      setGenerations(data || []);
    }
    setLoadingGenerations(false);
  };

  if (loading || loadingGenerations) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="text-2xl font-semibold text-purple-400 animate-pulse">მიმდინარეობს...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 pb-20">
      {/* Header */}
      <div className="bg-gray-800/30 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                📜 გენერირების ისტორია
              </h1>
              <p className="text-gray-400 mt-1">თქვენ მიერ შექმნილი ყველა ვიზუალი</p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl hover:bg-gray-700 text-white transition-all font-medium"
            >
              ← უკან
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ისტორია ცარიელია
            </h2>
            <p className="text-gray-400 mb-6">
              დაიწყეთ თქვენი პირველი ვიზუალის შექმნა
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              ვიზუალის შექმნა
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-400">
              სულ: <span className="text-white font-semibold">{generations.length}</span> ვიზუალი
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20 group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={gen.image_url}
                      alt={gen.prompt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white font-medium mb-2 line-clamp-2 text-sm">
                      {gen.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="bg-gray-700/50 px-2 py-1 rounded">
                        {gen.style_chosen}
                      </span>
                      <span>
                        {new Date(gen.created_at).toLocaleDateString("ka-GE")}
                      </span>
                    </div>
                    <a
                      href={gen.image_url}
                      download
                      className="mt-3 w-full block text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      ჩამოტვირთვა
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
