"use client";

export default function ActionCards({ onOpenModal }) {
  const actions = [
    {
      id: "tasks",
      title: "Tasks & Ads",
      subtitle: "Watch Monetag Ads & Earn Coins",
      icon: "🎯",
      gradient: "from-sky-500/20 via-sky-600/10 to-transparent",
      borderColor: "border-sky-500/40 hover:border-sky-400",
      accentBg: "bg-sky-500",
      badge: "HOT 🔥",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "withdraw",
      title: "Withdraw",
      subtitle: "Cashout to bKash / Nagad / TON",
      icon: "💳",
      gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      accentBg: "bg-emerald-500",
      badge: "Instant",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "balance",
      title: "Balance & History",
      subtitle: "View earnings, stats & transactions",
      icon: "📊",
      gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
      borderColor: "border-purple-500/40 hover:border-purple-400",
      accentBg: "bg-purple-500",
      badge: "Stats",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "support",
      title: "Support & Channel",
      subtitle: "24/7 Help Admin & Official Updates",
      icon: "💬",
      gradient: "from-amber-500/20 via-amber-600/10 to-transparent",
      borderColor: "border-amber-500/40 hover:border-amber-400",
      accentBg: "bg-amber-500",
      badge: "Online",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
  ];

  return (
    <div className="flex flex-col space-y-3.5 w-full">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onOpenModal(action.id)}
          className={`group relative overflow-hidden w-full text-left p-5 rounded-3xl bg-gradient-to-r ${action.gradient} bg-slate-900/90 border ${action.borderColor} shadow-xl active:scale-[0.98] transition-all duration-200 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                    {action.title}
                  </h3>
                  {action.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${action.badgeColor}`}
                    >
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                  {action.subtitle}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
