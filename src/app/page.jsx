"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

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

      {/* Main Center Content: Profile & Balance Only */}
      <div className="my-auto space-y-6 w-full py-6">
        {/* Profile Card */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          {/* Subtle Ambient Light */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-3xl text-white shadow-lg border-2 border-sky-400/40">
                {loading ? "..." : avatarLetter}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            {/* Name & Username */}
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {loading ? "Loading..." : `${firstName} ${lastName}`}
              </h2>
              <p className="text-xs text-sky-400 font-mono">
                {username}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Total Balance
          </span>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl">🪙</span>
            <span className="text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
              {loading ? "..." : balance.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Telegram Verified Account
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Clean Mode
        </p>
      </footer>
    </main>
  );
}
