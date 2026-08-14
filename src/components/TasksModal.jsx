"use client";

import { useState, useEffect } from "react";
import { triggerMonetagAdMobile, MONETAG_CONFIG } from "@/lib/monetag";

export default function TasksModal({
  isOpen,
  onClose,
  telegramId,
  onRewardClaimed,
  userStats,
}) {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [timer, setTimer] = useState(MONETAG_CONFIG.AD_WATCH_SECONDS);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Countdown timer when ad is running
  useEffect(() => {
    let interval;
    if (isAdPlaying && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isAdPlaying && timer === 0) {
      // Timer finished -> Give coins automatically
      completeAdReward();
    }
    return () => clearInterval(interval);
  }, [isAdPlaying, timer]);

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

  const handleStartAd = async () => {
    if (isAdPlaying || loading) return;

    setIsError(false);
    setStatusMessage("");
    setIsAdPlaying(true);
    setTimer(MONETAG_CONFIG.AD_WATCH_SECONDS);

    // Trigger Monetag Ad popup/link
    await triggerMonetagAdMobile();
  };

  const completeAdReward = async () => {
    setIsAdPlaying(false);
    setLoading(true);

    try {
      // Credit reward in MongoDB
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
        setStatusMessage(`🎉 Ad Completed! +${data.reward} Coins added.`);
      } else {
        setIsError(true);
        setStatusMessage(data.error || "Failed to reward coins");
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage("Network error while claiming reward");
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
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Full-Screen Ad Overlay for In-App Mobile view */}
        {isAdPlaying && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-sky-500/20 border-t-amber-400 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {timer}s
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Watching Monetag Sponsored Ad
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Ad is active. Please stay on this screen until the timer finishes to receive your coins.
              </p>
            </div>

            <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-300 font-semibold font-mono">
              Reward: +{MONETAG_CONFIG.REWARD_PER_AD} Coins 🪙
            </div>
          </div>
        )}

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
            className={`p-3 border text-xs font-semibold rounded-xl text-center ${
              isError
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Task 1: Monetag Rewarded Ads with auto-timer & mobile compatibility */}
        <div className="bg-slate-800/70 border border-sky-500/40 rounded-2xl p-4 space-y-3.5 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-white text-base">Watch Sponsored Ad</h4>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  +{MONETAG_CONFIG.REWARD_PER_AD} Coins
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Watch Monetag ad ({MONETAG_CONFIG.AD_WATCH_SECONDS}s) & claim coins
              </p>
            </div>
            <span className="text-xs font-mono bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-lg border border-sky-500/20">
              Watched: {userStats?.adsWatchedCount || 0}
            </span>
          </div>

          <button
            onClick={handleStartAd}
            disabled={isAdPlaying || loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
              loading
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-xl shadow-sky-500/20 active:scale-95"
            }`}
          >
            <span className="text-lg">📺</span>
            <span>{loading ? "Crediting Coins..." : "Watch Ad & Earn Coins"}</span>
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
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95"
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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white active:scale-95"
          >
            Join
          </a>
        </div>
      </div>
    </div>
  );
}
