"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";

export default function HistoryPage() {
  const { user, balance, userStats, transactions, refreshUser, isRefreshing } = useUser();

  const [activeTab, setActiveTab] = useState("uploads"); // 'uploads' | 'transactions'
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  const fetchUserUploads = () => {
    if (!user?.id) return;
    setLoadingUploads(true);
    fetch(`/api/questions/user-history?telegramId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUploads(data.uploads || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingUploads(false));
  };

  useEffect(() => {
    fetchUserUploads();
    refreshUser();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="p-4 space-y-4 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm active:scale-95 transition-transform"
            >
              ←
            </Link>
            <h1 className="text-base font-bold text-white">History & Analytics</h1>
          </div>

          <button
            onClick={() => {
              fetchUserUploads();
              refreshUser();
            }}
            className="flex items-center space-x-1 text-xs text-sky-400 font-semibold px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full active:scale-95 transition-all"
          >
            <span className={isRefreshing || loadingUploads ? "animate-spin" : ""}>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Current Coins
            </span>
            <p className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">
              🪙 {(balance || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Earned
            </span>
            <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              🪙 {(userStats?.totalEarned || balance || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Withdrawn
            </span>
            <p className="text-xl font-extrabold text-rose-400 font-mono mt-0.5">
              🪙 {(userStats?.totalWithdrawn || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Questions Uploaded
            </span>
            <p className="text-xl font-extrabold text-sky-400 font-mono mt-0.5">
              📝 {uploads.length}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "uploads"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Question Uploads ({uploads.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "transactions"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recharge & Logs ({transactions.length})
          </button>
        </div>

        {/* TAB 1: Question Uploads History */}
        {activeTab === "uploads" && (
          <div className="space-y-2.5">
            {loadingUploads ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading uploads...</div>
            ) : uploads.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
                <span className="text-3xl">📝</span>
                <p className="text-sm font-bold text-white">No questions uploaded yet</p>
                <p className="text-xs text-slate-400">
                  Head to Tasks to upload exam question photos and earn coins!
                </p>
              </div>
            ) : (
              uploads.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.subjectName}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-sky-400">Code: {item.subjectCode}</span>
                        {item.subjectDate && (
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.2 rounded-full">
                            📅 {item.subjectDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                        item.status === "verified"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : item.status === "rejected"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                      }`}
                    >
                      {item.status === "verified" ? "Approved ✓" : item.status}
                    </span>
                  </div>

                  {item.rejectReason && item.status === "rejected" && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
                      ⚠️ Note from Admin: {item.rejectReason}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400 font-mono">
                      +{item.rewardAmount || 50} Coins
                    </span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Recharge & Transaction History */}
        {activeTab === "transactions" && (
          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
                <span className="text-3xl">💳</span>
                <p className="text-sm font-bold text-white">No transactions recorded yet</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div
                  key={tx.id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{tx.title}</h4>
                        {tx.status && (
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${
                              tx.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : tx.status === "pending"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {tx.status === "completed" ? "Paid ✓" : tx.status}
                          </span>
                        )}
                      </div>

                      {tx.accountNumber && (
                        <p className="text-xs text-sky-400 font-mono mt-1">
                          {tx.operator || "Recharge"}: <span className="font-bold">{tx.accountNumber}</span> ({tx.simType || "prepaid"})
                        </p>
                      )}
                    </div>

                    <span
                      className={`font-mono font-extrabold text-sm ${
                        tx.type === "earn" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.type === "earn" ? `+${tx.amount}` : `-${tx.amount}`}
                    </span>
                  </div>

                  {tx.trxId && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-mono">
                      ✅ Trx ID: <span className="font-bold">{tx.trxId}</span>
                    </div>
                  )}

                  {tx.rejectReason && tx.status === "rejected" && (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
                      ⚠️ Note: {tx.rejectReason} (Coins Refunded)
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>Type: {tx.type.toUpperCase()}</span>
                    <span>{tx.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • History & Records
        </p>
      </footer>
    </div>
  );
}
