"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";

export default function TasksPage() {
  const { user, updateBalance } = useUser();

  // Track which channels user has clicked "Join" for
  const [clickedJoin, setClickedJoin] = useState({});
  const [verifyingKey, setVerifyingKey] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState(""); // 'success' | 'error'

  const channels = [
    {
      id: "main",
      field: "hasJoinedMainChannel",
      title: "Join Official Channel",
      username: "@qearnofficial",
      link: "https://t.me/qearnofficial",
      icon: "📢",
      color: "from-purple-500 to-indigo-600",
      borderColor: "border-purple-500/40",
      description: "Official updates, news & announcements",
    },
    {
      id: "payment",
      field: "hasJoinedPaymentChannel",
      title: "Join QEarn Payment",
      username: "@Qearn_Payment",
      link: "https://t.me/Qearn_Payment",
      icon: "💳",
      color: "from-emerald-500 to-teal-600",
      borderColor: "border-emerald-500/40",
      description: "Live automated payment & recharge proofs",
    },
    {
      id: "activities",
      field: "hasJoinedActivitiesChannel",
      title: "Join QEarn Activities",
      username: "@Qearn_Activities",
      link: "https://t.me/Qearn_Activities",
      icon: "⚡",
      color: "from-amber-500 to-orange-600",
      borderColor: "border-amber-500/40",
      description: "Community live activity feed & approvals",
    },
  ];

  const handleButtonClick = async (ch) => {
    const isCompleted = Boolean(user?.[ch.field]);
    if (isCompleted) return;

    const hasClicked = Boolean(clickedJoin[ch.id]);

    // Step 1: If user hasn't clicked "Join" yet -> Open Telegram Channel & change button to "Claim"
    if (!hasClicked) {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(ch.link);
      } else {
        window.open(ch.link, "_blank");
      }

      setClickedJoin((prev) => ({ ...prev, [ch.id]: true }));
      return;
    }

    // Step 2: If user already clicked "Join" -> Verify membership & Claim 50 coins
    setVerifyingKey(ch.id);
    setStatusMsg("");
    setStatusType("");

    try {
      const res = await fetch("/api/tasks/channel-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: user?.id || "demo_user",
          channelType: ch.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusType("success");
        setStatusMsg(data.message || "🎉 Verified! +50 Coins credited to your balance!");
        updateBalance(data.balance, data.transaction, {
          totalEarned: data.totalEarned,
          [ch.field]: true,
        });
        if (user) {
          user[ch.field] = true;
        }
      } else {
        setStatusType("error");
        setStatusMsg(data.error || "Verification failed! Please join the channel first.");
        // If verification failed because user didn't actually join, keep or reopen channel link
      }
    } catch (err) {
      setStatusType("error");
      setStatusMsg("Network error while verifying channel membership.");
    }

    setVerifyingKey(null);
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
            4 Active Tasks
          </span>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`p-3.5 border text-xs font-semibold rounded-2xl text-center leading-relaxed ${
              statusType === "success"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 animate-pulse"
                : "bg-rose-500/20 border-rose-500/30 text-rose-300"
            }`}
          >
            {statusMsg}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {/* TASK GROUP 1: 3 Telegram Channel Joining Tasks (Single Right-Side Button) */}
          {channels.map((ch) => {
            const isCompleted = Boolean(user?.[ch.field]);
            const isChecking = verifyingKey === ch.id;
            const hasClicked = Boolean(clickedJoin[ch.id]);

            return (
              <div
                key={ch.id}
                className={`bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border ${ch.borderColor} rounded-3xl p-4 shadow-xl flex items-center justify-between gap-3`}
              >
                {/* Left Side: Icon & Details */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${ch.color} flex items-center justify-center text-xl shadow-md shrink-0`}
                  >
                    {ch.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white truncate">{ch.title}</h3>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0">
                        +50
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{ch.username}</p>
                  </div>
                </div>

                {/* Right Side: Single Dynamic Action Button (Join -> Claim -> Completed) */}
                <button
                  onClick={() => handleButtonClick(ch)}
                  disabled={isCompleted || isChecking}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shrink-0 shadow-lg min-w-[90px] ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                      : isChecking
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : hasClicked
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/20 active:scale-95 animate-pulse"
                      : `bg-gradient-to-r ${ch.color} hover:brightness-110 text-white active:scale-95`
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <span>✓</span>
                      <span>Done</span>
                    </>
                  ) : isChecking ? (
                    <span>Checking...</span>
                  ) : hasClicked ? (
                    <>
                      <span>⚡</span>
                      <span>Claim</span>
                    </>
                  ) : (
                    <>
                      <span>🔗</span>
                      <span>Join</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {/* TASK GROUP 2: Question Upload Task */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/40 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20 shrink-0">
                📝
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white truncate">Question Upload</h3>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0">
                    +50
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Watch 15s ad & upload photo
                </p>
              </div>
            </div>

            <Link
              href="/tasks/upload-question"
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1 shrink-0 min-w-[90px]"
            >
              <span>⚡</span>
              <span>Start</span>
            </Link>
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
