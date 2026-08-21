"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";

export default function ReferPage() {
  const { user, refreshUser, isRefreshing } = useUser();

  const [stats, setStats] = useState({
    totalReferrals: 0,
    successReferrals: 0,
    pendingReferrals: 0,
    totalBonusEarned: 0,
    rewardPerReferral: 100,
  });
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Selected user to view 4-task detail modal
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const telegramId = user?.id || "demo_user";

  const botUsername = "qaearn_bot";
  const directBotRefLink = `https://t.me/${botUsername}?start=ref_${telegramId}`;

  const shareOnTelegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    directBotRefLink
  )}&text=${encodeURIComponent(
    "🎁 Join QEarn now to get 50 Free Coins & earn Mobile Recharge by uploading Diploma exam questions!"
  )}`;

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
    navigator.clipboard.writeText(directBotRefLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareOnTelegram = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareOnTelegramUrl);
    } else {
      window.open(shareOnTelegramUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full select-none">
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
                Earn <span className="text-amber-300 font-bold font-mono">100 Coins (৳10 TK)</span> when your friend completes all 4 tasks!
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

        {/* Dynamic 3-Stats Grid: Total Referrals, Success Referrals & Earned Coins */}
        <div className="grid grid-cols-3 gap-2">
          {/* 1. Total Referrals */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Refer
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-0.5">
              👥 {stats.totalReferrals || 0}
            </p>
            <span className="text-[9px] text-slate-500 block">Invited</span>
          </div>

          {/* 2. Success Referrals (All 4 Tasks Verified) */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3 text-center shadow-lg bg-emerald-950/20">
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
              Success Refer
            </span>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              ✓ {stats.successReferrals || 0}
            </p>
            <span className="text-[9px] text-emerald-400/80 block">4/4 Tasks</span>
          </div>

          {/* 3. Bonus Coins Earned (Only from Success Referrals) */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-center shadow-lg bg-amber-950/20">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
              Earned Coins
            </span>
            <p className="text-xl font-black text-amber-400 font-mono mt-0.5">
              🪙 {stats.totalBonusEarned || 0}
            </p>
            <span className="text-[9px] text-amber-400/80 block font-mono">
              ৳{((stats.totalBonusEarned || 0) * 0.1).toFixed(0)} TK
            </span>
          </div>
        </div>

        {/* 4-Task Rule Explanation Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <span>📋</span>
              <span>4 Required Tasks for Success Referral:</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold">
              +100 Coins
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-300">
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-1.5">
              <span className="text-purple-400">1.</span>
              <span>Official Channel</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-1.5">
              <span className="text-emerald-400">2.</span>
              <span>Payment Channel</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-1.5">
              <span className="text-amber-400">3.</span>
              <span>Activities Channel</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-1.5">
              <span className="text-sky-400">4.</span>
              <span>Approved Question</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-0.5 leading-relaxed">
            💡 Click on any referred user card below to view their live task progress!
          </p>
        </div>

        {/* Copyable Bot Referral Link Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Bot Referral Link:
          </span>
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 space-x-2">
            <span className="text-xs text-sky-300 font-mono truncate select-all">
              {directBotRefLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg active:scale-95 transition-all shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Referred Friends List (Interactive Cards with 4-Task Status) */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Referred Friends ({referredUsers.length})
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {stats.successReferrals} Success • {stats.pendingReferrals} Pending
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading referral list...</div>
          ) : referredUsers.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-3xl">👥</span>
              <p className="text-sm font-bold text-white">No referrals yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Share your bot referral link with your classmates and Telegram friends to start earning +100 Coins!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {referredUsers.map((friend, idx) => (
                <div
                  key={friend.id || idx}
                  onClick={() => setSelectedUserDetail(friend)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer active:scale-98 shadow-md space-y-2.5 ${
                    friend.isSuccess
                      ? "bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400"
                      : "bg-slate-900 border-slate-800 hover:border-sky-500/40"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md ${
                          friend.isSuccess
                            ? "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {friend.name[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{friend.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{friend.username}</p>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          friend.isSuccess
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30 font-mono"
                        }`}
                      >
                        {friend.isSuccess
                          ? "✓ Success (+100)"
                          : `⏳ ${friend.completedCount || 0}/4 Tasks`}
                      </span>
                      <span className="text-[9px] text-slate-500 block">{friend.joinedAt}</span>
                    </div>
                  </div>

                  {/* 4 Task Mini Progress Indicators */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {friend.tasks?.map((t, tIdx) => (
                      <div
                        key={t.id || tIdx}
                        className={`py-1.5 px-1 rounded-xl text-center text-[9px] font-bold border transition-all ${
                          t.isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-950 text-slate-500 border-slate-800"
                        }`}
                      >
                        <span className="block truncate">{t.isCompleted ? "✓" : "○"} T{tIdx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: 4-TASK BREAKDOWN DETAIL POPUP                          */}
      {/* ------------------------------------------------------------- */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                  {selectedUserDetail.name[0] || "U"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedUserDetail.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {selectedUserDetail.username} • ID: {selectedUserDetail.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Overall Status Banner */}
            <div
              className={`p-3 rounded-2xl border text-xs font-semibold flex justify-between items-center ${
                selectedUserDetail.isSuccess
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}
            >
              <span>Referral Status:</span>
              <span className="font-bold">
                {selectedUserDetail.isSuccess
                  ? "✅ Success (+100 Coins Claimed)"
                  : `⏳ Incomplete (${selectedUserDetail.completedCount}/4 Tasks)`}
              </span>
            </div>

            {/* Detailed 4-Task Checklist */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Task Completion Breakdown:
              </h4>

              {selectedUserDetail.tasks?.map((task, idx) => (
                <div
                  key={task.id || idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    task.isCompleted
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        task.isCompleted
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {task.isCompleted ? "✓" : idx + 1}
                    </span>
                    <span className="font-medium text-white">{task.name}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.isCompleted
                        ? "bg-emerald-500/20 text-emerald-300 font-mono"
                        : "bg-slate-800 text-slate-500 font-mono"
                    }`}
                  >
                    {task.isCompleted ? "Completed ✓" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            {/* Note Footer */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              {selectedUserDetail.isSuccess
                ? "🎉 All 4 requirements fulfilled! Referrer bonus has been awarded."
                : "⚠️ +100 Coins will be automatically credited when all 4 tasks are verified."}
            </p>

            <button
              onClick={() => setSelectedUserDetail(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Referral Hub
        </p>
      </footer>
    </div>
  );
}
