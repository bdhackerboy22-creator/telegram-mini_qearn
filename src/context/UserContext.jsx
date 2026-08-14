"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    adsWatchedCount: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // App Initial Load: Verify and load user ONCE
  useEffect(() => {
    // Check if already authenticated in session
    const cachedUser = sessionStorage.getItem("tg_user_data");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed.user);
        setBalance(parsed.user.balance || 0);
        setUserStats({
          totalEarned: parsed.user.totalEarned || 0,
          totalWithdrawn: parsed.user.totalWithdrawn || 0,
          adsWatchedCount: parsed.user.adsWatchedCount || 0,
        });
        setTransactions(parsed.transactions || []);
        setLoading(false);
        return;
      } catch (_) {}
    }

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

    // Single Auth API Call on App Launch
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
          setUserStats({
            totalEarned: data.user.totalEarned || 0,
            totalWithdrawn: data.user.totalWithdrawn || 0,
            adsWatchedCount: data.user.adsWatchedCount || 0,
          });
          setTransactions(data.transactions || []);

          // Cache in session to eliminate route reload latency
          sessionStorage.setItem("tg_user_data", JSON.stringify(data));
        } else {
          setUser(localUser);
          setBalance(100);
        }
      })
      .catch(() => {
        setUser(localUser);
        setBalance(100);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateBalance = (newBalance, newTx = null, statsUpdate = {}) => {
    setBalance(newBalance);
    setUserStats((prev) => ({ ...prev, ...statsUpdate }));
    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
    }

    // Sync cache
    const cached = sessionStorage.getItem("tg_user_data");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.user.balance = newBalance;
        sessionStorage.setItem("tg_user_data", JSON.stringify(parsed));
      } catch (_) {}
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        balance,
        userStats,
        transactions,
        loading,
        updateBalance,
      }}
    >
      {/* Global App Initialization Splash Screen */}
      {loading ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-5 text-center">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-sky-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              🪙
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-wide">
              Verifying Telegram Session...
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Loading account & coin balance
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
