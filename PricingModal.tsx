"use client";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (priceId: string, credits: number) => void;
}

const PRICING_PLANS = [
  {
    id: "small",
    name: "მცირე პაკეტი",
    credits: 30,
    price: 5,
    priceId: "price_small_30", // Stripe Price ID
    features: [
      "30 AI ვიზუალი",
      "ყველა სტილი",
      "HD ხარისხი",
      "უვადო მოქმედება",
    ],
    popular: false,
    emoji: "🌱",
  },
  {
    id: "medium",
    name: "საშუალო პაკეტი",
    credits: 100,
    price: 20,
    priceId: "price_medium_100",
    features: [
      "100 AI ვიზუალი",
      "ყველა სტილი",
      "HD ხარისხი",
      "უვადო მოქმედება",
      "პრიორიტეტული მხარდაჭერა",
    ],
    popular: true,
    emoji: "⚡",
  },
  {
    id: "premium",
    name: "პრემიუმ პაკეტი",
    credits: 1000,
    price: 35,
    priceId: "price_premium_1000",
    features: [
      "1000 AI ვიზუალი",
      "ყველა სტილი",
      "4K ხარისხი",
      "უვადო მოქმედება",
      "პრიორიტეტული მხარდაჭერა",
      "30% ფასდაკლება",
    ],
    popular: false,
    emoji: "💎",
  },
];

export default function PricingModal({ isOpen, onClose, onSelectPlan }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-5 px-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            აირჩიეთ თქვენი პაკეტი
          </h2>
          <p className="text-gray-400 text-sm">
            კრედიტებს ვადა არასდროს ეწურება
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 transition-all ${
                plan.popular
                  ? "bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500 shadow-xl shadow-purple-500/20 scale-105"
                  : "bg-gray-800/50 border border-gray-700 hover:border-gray-600"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    პოპულარული
                  </span>
                </div>
              )}

              {/* Emoji */}
              <div className="text-3xl mb-3">{plan.emoji}</div>

              {/* Plan Name */}
              <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <p className="text-gray-400 text-sm mt-1">{plan.credits} კრედიტი</p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <svg
                      className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Buy Button */}
              <button
                onClick={() => onSelectPlan(plan.priceId, plan.credits)}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/50"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                შეძენა
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="bg-gray-800/50 border-t border-gray-700 px-4 py-3 text-center">
          <p className="text-gray-400 text-xs">
            💳 უსაფრთხო გადახდა Stripe-ის საშუალებით
          </p>
        </div>
      </div>
    </div>
  );
}
