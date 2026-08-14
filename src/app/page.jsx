"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ActionCards from "@/components/ActionCards";
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
  });
  const [transactions, setTransactions] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'withdraw' | 'balance' | 'support' | null

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
          setUserStats({
            totalEarned: data.user.totalEarned,
            totalWithdrawn: data.user.totalWithdrawn,
            adsWatchedCount: data.user.adsWatchedCount,
          });
          setTransactions(data.transactions || []);
        } else {
          setUser(localUser);
          setBalance(100);
        }
      })
      .catch(() => {
        setUser(localUser);
        setBalance(100);
      });
  }, []);

  const handleWithdrawSuccess = (newBalance, newTx, updatedStats = {}) => {
    setBalance(newBalance);
    setUserStats((prev) => ({ ...prev, ...updatedStats }));
    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full select-none">
      {/* 1. Global Navbar with Profile & Balance */}
      <Navbar user={user} balance={balance} />

      {/* 2. Main Content Body */}
      <main className="p-4 space-y-4 flex-1 flex flex-col justify-center">
        {/* Welcome Status Card */}
        <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/30 rounded-3xl p-5 shadow-xl text-center space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Telegram Account Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Welcome, {user?.first_name || "Earner"}! 👋
          </h2>
          <p className="text-xs text-slate-400">
            Complete tasks, earn coins and cashout to your wallet.
          </p>
        </div>

        {/* 3. Main Menu Action Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Dashboard Menu
          </h3>
          <ActionCards onOpenModal={(modalId) => setActiveModal(modalId)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Clean Architecture
        </p>
      </footer>

      {/* Action Modals */}
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
    </div>
  );
}
