import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight">
            AI ვიზუალის გენერატორი
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            შექმენით უნიკალური ვიზუალი ხელოვნური ინტელექტის მეშვეობით
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 text-lg"
            >
              დაწყება
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-700/50 transition-all text-lg"
            >
              ავტორიზაცია
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-white mb-3">მრავალფეროვანი სტილები</h3>
            <p className="text-gray-400">
              აირჩიეთ სხვადასხვა სტილიდან: რეალისტური, ანიმე, ციფრული ხელოვნება და სხვა.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 hover:border-pink-500/50 transition-all">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">მყისიერი გენერაცია</h3>
            <p className="text-gray-400">
              მიიღეთ შედეგი 10-20 წამში Stable Diffusion XL ტექნოლოგიით.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-white mb-3">სასტარტო კრედიტები</h3>
            <p className="text-gray-400">
              დაიწყეთ 5 უფასო კრედიტით და შექმენით თქვენი პირველი AI ვიზუალი.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

