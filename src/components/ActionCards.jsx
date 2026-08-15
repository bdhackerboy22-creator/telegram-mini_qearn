"use client";

import Link from "next/link";

export default function ActionCards({ onOpenModal }) {
  const actions = [
    {
      id: "tasks",
      title: "Tasks & Earn",
      subtitle: "Browse available earning tasks",
      icon: "🎯",
      isRoute: true,
      href: "/tasks",
      gradient: "from-sky-500/20 via-sky-600/10 to-transparent",
      borderColor: "border-sky-500/40 hover:border-sky-400",
      badge: "HOT 🔥",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "withdraw",
      title: "Recharge",
      subtitle: "Mobile Recharge (GP, BL, Robi)",
      icon: "💳",
      isRoute: false,
      gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      badge: "Instant",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "balance",
      title: "History & Stats",
      subtitle: "View earnings, uploads & logs",
      icon: "📊",
      isRoute: false,
      gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
      borderColor: "border-purple-500/40 hover:border-purple-400",
      badge: "Stats",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "support",
      title: "Support & Help",
      subtitle: "24/7 Admin & Official Community",
      icon: "💬",
      isRoute: false,
      gradient: "from-amber-500/20 via-amber-600/10 to-transparent",
      borderColor: "border-amber-500/40 hover:border-amber-400",
      badge: "Online",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {actions.map((action) => {
        const content = (
          <div className="flex flex-col justify-between h-full w-full">
            <div className="flex justify-between items-start w-full">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              {action.badge && (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${action.badgeColor}`}
                >
                  {action.badge}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                {action.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium line-clamp-1">
                {action.subtitle}
              </p>
            </div>
          </div>
        );

        if (action.isRoute) {
          return (
            <Link
              key={action.id}
              href={action.href}
              className={`group relative overflow-hidden text-left p-4 rounded-3xl bg-gradient-to-b ${action.gradient} bg-slate-900/90 border ${action.borderColor} shadow-xl active:scale-[0.98] transition-all duration-200 backdrop-blur-sm h-36 flex flex-col justify-between`}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={action.id}
            onClick={() => onOpenModal(action.id)}
            className={`group relative overflow-hidden text-left p-4 rounded-3xl bg-gradient-to-b ${action.gradient} bg-slate-900/90 border ${action.borderColor} shadow-xl active:scale-[0.98] transition-all duration-200 backdrop-blur-sm h-36 flex flex-col justify-between`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
