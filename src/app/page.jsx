"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import ActionCards from "@/components/ActionCards";
import WithdrawModal from "@/components/WithdrawModal";
import BalanceModal from "@/components/BalanceModal";
import SupportModal from "@/components/SupportModal";

export default function Home() {
  const { user, balance, userStats, transactions, updateBalance } = useUser();
  const [activeModal, setActiveModal] = useState(null); // 'withdraw' | 'balance' | 'support' | null

  const handleWithdrawSuccess = (newBalance, newTx, updatedStats = {}) => {
    updateBalance(newBalance, newTx, updatedStats);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full select-none">
      {/* 1. Global Navbar */}
      <Navbar />

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
