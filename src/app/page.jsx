"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ActionCards from "@/components/ActionCards";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { user, userStats } = useUser();

  const referralCount = userStats?.referralCount || 0;
  const referralBonusEarned = userStats?.referralBonusEarned || referralCount * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full select-none">
      {/* 1. Global Navbar with Live Balance */}
      <Navbar />

      {/* 2. Main Content Body */}
      <main className="p-4 space-y-4 flex-1 flex flex-col justify-center">
        {/* Welcome Status Card */}
        <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/30 rounded-3xl p-5 shadow-xl text-center space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Telegram Account Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Welcome, {user?.first_name || "Earner"}! 👋
          </h2>
          <p className="text-xs text-slate-400">
            Upload exam question photos, invite friends and get mobile recharge!
          </p>
        </div>

        {/* 3. Main Menu Action Grid (Direct Routes: /tasks, /recharge, /history, /support) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Dashboard Menu
          </h3>
          <ActionCards />
        </div>

        {/* 4. Referral Program Banner Card (Below Dashboard Buttons) */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Invite & Earn
          </h3>
          <Link
            href="/refer"
            className="group relative overflow-hidden block bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-600/15 border border-amber-500/40 hover:border-amber-400 rounded-3xl p-4.5 p-4 shadow-xl active:scale-[0.98] transition-all backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  🎁
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">
                      Refer Friends & Earn
                    </h4>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                      +100 Coins
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Invited: <span className="text-sky-400 font-bold font-mono">{referralCount} Friends</span> • Earned: <span className="text-amber-300 font-bold font-mono">+{referralBonusEarned} Coins</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all shrink-0">
                Invite →
              </span>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Full Routing Architecture
        </p>
      </footer>
    </div>
  );
}
