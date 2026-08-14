"use client";

import { useState, useEffect } from "react";
import { showMonetagAd, MONETAG_CONFIG } from "@/lib/monetag";

export default function TasksModal({
  isOpen,
  onClose,
  telegramId,
  onRewardClaimed,
  userStats,
}) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const isDailyAlreadyClaimed = () => {
    if (!userStats?.lastDailyRewardDate) return false;
    const lastDate = new Date(userStats.lastDailyRewardDate);
    const today = new Date();
    return (
      today.getFullYear() === lastDate.getFullYear() &&
      today.getMonth() === lastDate.getMonth() &&
      today.getDate() === lastDate.getDate()
    );
  };

  const handleWatchAd = async () => {
    if (cooldown > 0 || loading) return;

    setIsError(false);
    setStatusMessage("Opening Monetag Ad...");
    setLoading(true);

    const res = await showMonetagAd();

    if (res.success) {
      // Call Backend to verify & credit coins in DB
      try {
        const response = await fetch("/api/tasks/reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegramId: telegramId || "demo_user",
            taskType: "monetag_ad",
          }),
        });

        const data = await response.json();
        if (data.success) {
          onRewardClaimed(data.balance, data.transaction, {
            adsWatchedCount: data.adsWatchedCount,
            totalEarned: data.totalEarned,
          });
          setCooldown(MONETAG_CONFIG.AD_COOLDOWN_SECONDS);
          setStatusMessage(`🎉 +${data.reward} Coins credited to your account!`);
        } else {
          setIsError(true);
          setStatusMessage(data.error || "Failed to reward coins");
        }
      } catch (err) {
        setIsError(true);
        setStatusMessage("Network error while claiming reward");
      }
    } else {
      setIsError(true);
      setStatusMessage("Failed to display Monetag ad");
    }

    setLoading(false);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const handleDailyCheckIn = async () => {
    if (isDailyAlreadyClaimed() || loading) return;

    setIsError(false);
    setLoading(true);
    try {
      const response = await fetch("/api/tasks/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: telegramId || "demo_user",
          taskType: "daily_checkin",
        }),
      });

      const data = await response.json();
      if (data.success) {
        onRewardClaimed(data.balance, data.transaction, {
          lastDailyRewardDate: new Date().toISOString(),
          totalEarned: data.totalEarned,
        });
        setStatusMessage(`🎁 +${data.reward} Daily Bonus Claimed!`);
      } else {
        setIsError(true);
        setStatusMessage(data.error || "Could not claim daily reward");
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage("Network error");
    }
    setLoading(false);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-white">Earning Tasks</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 border text-xs font-semibold rounded-xl text-center animate-pulse ${
              isError
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Task 1: Monetag Rewarded Ads */}
        <div className="bg-slate-800/70 border border-sky-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white text-base">Watch Monetag Ad</h4>
              <p className="text-xs text-slate-400">
                Earn{" "}
                <span className="text-amber-400 font-bold">
                  +{MONETAG_CONFIG.REWARD_PER_AD} Coins
                </span>{" "}
                per ad
              </p>
            </div>
            <span className="text-xs font-mono bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-lg border border-sky-500/20">
              Watched: {userStats?.adsWatchedCount || 0}
            </span>
          </div>

          <button
            onClick={handleWatchAd}
            disabled={cooldown > 0 || loading}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
              cooldown > 0 || loading
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 active:scale-95"
            }`}
          >
            <span>📺</span>
            <span>
              {loading
                ? "Processing..."
                : cooldown > 0
                ? `Wait ${cooldown}s for next ad`
                : "Watch Ad & Earn Coins"}
            </span>
          </button>
        </div>

        {/* Task 2: Daily Check-in */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-white text-sm">Daily Check-in</h4>
            <p className="text-xs text-amber-400 font-semibold">
              +{MONETAG_CONFIG.DAILY_REWARD} Coins Today
            </p>
          </div>
          <button
            onClick={handleDailyCheckIn}
            disabled={isDailyAlreadyClaimed() || loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isDailyAlreadyClaimed()
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
            }`}
          >
            {isDailyAlreadyClaimed() ? "Claimed Today ✓" : "Claim Reward"}
          </button>
        </div>

        {/* Task 3: Join Telegram Channel */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-white text-sm">Official Community</h4>
            <p className="text-xs text-amber-400 font-semibold">Stay Updated</p>
          </div>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
          >
            Join
          </a>
        </div>
      </div>
    </div>
  );
}
