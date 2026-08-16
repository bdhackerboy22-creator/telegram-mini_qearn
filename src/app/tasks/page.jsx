"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";

export default function TasksPage() {
  const { user, updateBalance } = useUser();

  const [verifyingChannel, setVerifyingChannel] = useState(false);
  const [channelStatusMsg, setChannelStatusMsg] = useState("");
  const [channelStatusType, setChannelStatusType] = useState(""); // 'success' | 'error'

  const channelLink = "https://t.me/QearnOfficial";

  const handleJoinChannelClick = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(channelLink);
    } else {
      window.open(channelLink, "_blank");
    }
  };

  const handleVerifyChannelJoin = async () => {
    if (user?.hasJoinedChannel) return;

    setVerifyingChannel(true);
    setChannelStatusMsg("");
    setChannelStatusType("");

    try {
      const res = await fetch("/api/tasks/channel-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: user?.id || "demo_user",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setChannelStatusType("success");
        setChannelStatusMsg(data.message || "🎉 Verified! +50 Coins added to your balance!");
        updateBalance(data.balance, data.transaction, {
          totalEarned: data.totalEarned,
          hasJoinedChannel: true,
        });
        if (user) {
          user.hasJoinedChannel = true;
        }
      } else {
        setChannelStatusType("error");
        setChannelStatusMsg(data.error || "Verification failed! Please make sure you joined the channel.");
      }
    } catch (err) {
      setChannelStatusType("error");
      setChannelStatusMsg("Network error while verifying channel membership.");
    }

    setVerifyingChannel(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full">
      {/* 1. Global Navbar with Profile & Balance */}
      <Navbar />

      {/* Main Content Area */}
      <main className="p-4 space-y-4 flex-1">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm active:scale-95 transition-transform"
            >
              ←
            </Link>
            <h1 className="text-base font-bold text-white">Available Tasks</h1>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            2 Active Tasks
          </span>
        </div>

        {/* Channel Task Status Alert */}
        {channelStatusMsg && (
          <div
            className={`p-3.5 border text-xs font-semibold rounded-2xl text-center leading-relaxed ${
              channelStatusType === "success"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 animate-pulse"
                : "bg-rose-500/20 border-rose-500/30 text-rose-300"
            }`}
          >
            {channelStatusMsg}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3.5">
          {/* TASK 1: Join Official Telegram Channel (Verified via Bot API) */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                  📢
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Join Telegram Channel</h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      +50 Coins
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Join our official channel & verify membership
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleJoinChannelClick}
                className="py-3 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center space-x-1.5 shadow-md"
              >
                <span>🔗</span>
                <span>1. Join Channel</span>
              </button>

              <button
                onClick={handleVerifyChannelJoin}
                disabled={user?.hasJoinedChannel || verifyingChannel}
                className={`py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-lg ${
                  user?.hasJoinedChannel
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                    : verifyingChannel
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20 active:scale-98"
                }`}
              >
                <span>{user?.hasJoinedChannel ? "✓" : "⚡"}</span>
                <span>
                  {user?.hasJoinedChannel
                    ? "Completed"
                    : verifyingChannel
                    ? "Checking..."
                    : "2. Check & Claim"}
                </span>
              </button>
            </div>
          </div>

          {/* TASK 2: Question Upload Task */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/20">
                  📝
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Question Upload</h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      +50 Coins
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Watch 15s ad, pick available subject & upload photo
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/tasks/upload-question"
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-center"
              >
                <span>⚡</span>
                <span>Start Upload Task</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Task Hub
        </p>
      </footer>
    </div>
  );
}
