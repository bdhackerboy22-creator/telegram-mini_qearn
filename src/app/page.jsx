"use client";

import { useEffect, useState } from "react";
import QuestionUploadModal from "@/components/QuestionUploadModal";

export default function Home() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    let initData = "";
    let localUser = {
      id: "demo_user",
      first_name: "Telegram",
      last_name: "User",
      username: "tele_user",
    };

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe?.user) {
        localUser = tg.initDataUnsafe.user;
      }
      initData = tg.initData || "";
    }

    // Authenticate and sync with MongoDB backend
    fetch("/api/telegram/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: initData || `user=${encodeURIComponent(JSON.stringify(localUser))}`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setBalance(data.user.balance);
        } else {
          setUser(localUser);
          setBalance(100);
        }
      })
      .catch(() => {
        setUser(localUser);
        setBalance(100);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.first_name || "User";
  const lastName = user?.last_name || "";
  const username = user?.username ? `@${user.username}` : `ID: ${user?.id || ""}`;
  const avatarLetter = firstName ? firstName[0].toUpperCase() : "U";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto w-full select-none">
      {/* Top Header / Status */}
      <div className="w-full flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
            Online
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
          v1.0
        </span>
      </div>

      <div className="space-y-4 my-auto w-full py-4">
        {/* 1. Profile Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg border-2 border-sky-400/40">
                {loading ? "..." : avatarLetter}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="space-y-0.5 text-left">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {loading ? "Loading..." : `${firstName} ${lastName}`}
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full">
                  VIP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {username}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Balance Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Coin Balance
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              Verified Telegram Account
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/70 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
            <span className="text-2xl">🪙</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
              {loading ? "..." : balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3. Task Section: "Question Upload" with Upload Button */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl">
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
                  Watch ad, choose subject & submit photo
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>⚡</span>
            <span>Upload Question</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-2">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Clean Mode
        </p>
      </footer>

      {/* Question Upload & Ad Modal Flow */}
      <QuestionUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        telegramId={user?.id}
        onUploadSuccess={() => {
          // Success callback
        }}
      />
    </main>
  );
}
