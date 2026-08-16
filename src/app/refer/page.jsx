"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";

export default function ReferPage() {
  const { user, refreshUser, isRefreshing } = useUser();

  const [stats, setStats] = useState({
    referralCount: 0,
    totalBonusEarned: 0,
    rewardPerReferral: 100,
  });
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const telegramId = user?.id || "demo_user";

  // Construct referral link for Telegram Mini App
  // Format: https://t.me/share/url or direct bot link
  const botUsername = "QEarn_Bot"; // Or generic share link
  const miniAppShareLink = `https://t.me/share/url?url=${encodeURIComponent(
    `https://t.me/${botUsername}?startapp=ref_${telegramId}`
  )}&text=${encodeURIComponent(
    "🎁 Join this Telegram Mini App now to get 50 Free Coins & earn mobile recharge by uploading exam questions!"
  )}`;

  const directRefLink = `https://t.me/${botUsername}?startapp=ref_${telegramId}`;

  const fetchReferralStats = async () => {
    if (!telegramId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referral/stats?telegramId=${encodeURIComponent(telegramId)}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats || {});
        setReferredUsers(data.referredUsers || []);
      }
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReferralStats();
    refreshUser();
  }, [telegramId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directRefLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareOnTelegram = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(miniAppShareLink);
    } else {
      window.open(miniAppShareLink, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="p-4 space-y-4 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm active:scale-95 transition-transform"
            >
              ←
            </Link>
            <h1 className="text-base font-bold text-white">Invite & Earn Program</h1>
          </div>

          <button
            onClick={() => {
              fetchReferralStats();
              refreshUser();
            }}
            className="flex items-center space-x-1 text-xs text-sky-400 font-semibold px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full active:scale-95 transition-all"
          >
            <span className={isRefreshing || loading ? "animate-spin" : ""}>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Hero Referral Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-purple-600/20 border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
              🎁
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white">Invite Friends</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  +100 Coins
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Earn <span className="text-amber-300 font-bold font-mono">100 Coins (৳10 TK)</span> for every active friend you invite!
              </p>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={handleShareOnTelegram}
              className="py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>🚀</span>
              <span>Share on Telegram</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-2xl active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{copied ? "✓ Copied" : "📋 Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Referral Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Successful Referrals
            </span>
            <p className="text-2xl font-black text-sky-400 font-mono mt-1">
              👥 {stats.referralCount || 0}
            </p>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Total Friends Joined</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Referral Bonus Earned
            </span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">
              🪙 {(stats.totalBonusEarned || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-400 font-bold mt-0.5 block font-mono">
              = ৳{((stats.totalBonusEarned || 0) * 0.1).toFixed(2)} TK
            </span>
          </div>
        </div>

        {/* Copyable Link Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Unique Referral Link:
          </span>
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 space-x-2">
            <span className="text-xs text-sky-300 font-mono truncate select-all">
              {directRefLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg active:scale-95 transition-all shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Referred Friends List */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Referred Friends ({referredUsers.length})
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              +100 Coins Each
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading referral list...</div>
          ) : referredUsers.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-3xl">👥</span>
              <p className="text-sm font-bold text-white">No referrals yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Share your referral link with your classmates and Telegram friends to start earning +100 Coins per join!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {referredUsers.map((friend, idx) => (
                <div
                  key={friend.id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                      {friend.name[0] || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{friend.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{friend.username}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono block">
                      +100 Coins
                    </span>
                    <span className="text-[10px] text-slate-500">{friend.joinedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Referral Hub
        </p>
      </footer>
    </div>
  );
}
