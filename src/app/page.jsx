"use client";

import { useEffect, useState } from "react";
import Profile from "@/components/Profile";
import ActionCards from "@/components/ActionCards";
import TasksModal from "@/components/TasksModal";
import WithdrawModal from "@/components/WithdrawModal";
import BalanceModal from "@/components/BalanceModal";
import SupportModal from "@/components/SupportModal";

export default function Home() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    adsWatchedCount: 0,
    lastDailyRewardDate: null,
  });
  const [transactions, setTransactions] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initData = "";
    let localUser = {
      id: "demo_101",
      first_name: "Demo",
      last_name: "User",
      username: "demo_earner",
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
          setUserStats({
            totalEarned: data.user.totalEarned,
            totalWithdrawn: data.user.totalWithdrawn,
            adsWatchedCount: data.user.adsWatchedCount,
            lastDailyRewardDate: data.user.lastDailyRewardDate,
          });
          setTransactions(data.transactions || []);
        } else {
          setUser(localUser);
        }
      })
      .catch((err) => {
        console.error("Auth sync error:", err);
        setUser(localUser);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRewardClaimed = (newBalance, newTx, updatedStats = {}) => {
    setBalance(newBalance);
    setUserStats((prev) => ({ ...prev, ...updatedStats }));
    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleWithdrawSuccess = (newBalance, newTx, updatedStats = {}) => {
    setBalance(newBalance);
    setUserStats((prev) => ({ ...prev, ...updatedStats }));
    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      <div className="space-y-5">
        {/* Top Profile Card */}
        <Profile user={user} balance={balance} />

        {/* Live Notification Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center space-x-2.5 text-xs text-slate-300">
          <span className="animate-pulse text-emerald-400">●</span>
          <span className="font-medium truncate">
            🔥 Monetag high-paying ads are now active! Watch & Earn coins.
          </span>
        </div>

        {/* 4 Full-Width Big Action Buttons */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Main Menu
          </h3>
          <ActionCards onOpenModal={(modalId) => setActiveModal(modalId)} />
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-[11px] text-slate-500 pb-2">
        Telegram Monetag Earning App • Dynamic Cloud DB
      </footer>

      {/* Dynamic Modals */}
      <TasksModal
        isOpen={activeModal === "tasks"}
        onClose={() => setActiveModal(null)}
        telegramId={user?.id}
        userStats={userStats}
        onRewardClaimed={handleRewardClaimed}
      />

      <WithdrawModal
        isOpen={activeModal === "withdraw"}
        onClose={() => setActiveModal(null)}
        balance={balance}
        telegramId={user?.id}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <BalanceModal
        isOpen={activeModal === "balance"}
        onClose={() => setActiveModal(null)}
        balance={balance}
        userStats={userStats}
        transactions={transactions}
      />

      <SupportModal
        isOpen={activeModal === "support"}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
