"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync / Verify with Database
  const fetchUserData = useCallback(async (isInitial = false) => {
    if (!isInitial) setIsRefreshing(true);

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

    try {
      const res = await fetch("/api/telegram/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: initData || `user=${encodeURIComponent(JSON.stringify(localUser))}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setBalance(data.user.balance);
        setUserStats({
          totalEarned: data.user.totalEarned || 0,
          totalWithdrawn: data.user.totalWithdrawn || 0,
          adsWatchedCount: data.user.adsWatchedCount || 0,
        });
        setTransactions(data.transactions || []);
      } else {
        setUser(localUser);
        setBalance(50);
      }
    } catch (_) {
      if (isInitial) {
        setUser(localUser);
        setBalance(50);
      }
    } finally {
      if (isInitial) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load on App Open
  useEffect(() => {
    fetchUserData(true);

    // Auto-refresh when user switches back to the app window/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUserData(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchUserData]);

  const updateBalance = (newBalance, newTx = null, statsUpdate = {}) => {
    setBalance(newBalance);
    setUserStats((prev) => ({ ...prev, ...statsUpdate }));
    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
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
        isRefreshing,
        refreshUser: () => fetchUserData(false),
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
              Connecting Telegram Session...
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Fetching live balance & history
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
