"use client";

import { useState, useEffect } from "react";

export default function BalanceModal({
  isOpen,
  onClose,
  balance,
  userStats,
  transactions = [],
  telegramId,
}) {
  const [activeTab, setActiveTab] = useState("uploads"); // 'uploads' | 'transactions'
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  useEffect(() => {
    if (isOpen && telegramId) {
      setLoadingUploads(true);
      fetch(`/api/questions/user-history?telegramId=${encodeURIComponent(telegramId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUploads(data.uploads || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingUploads(false));
    }
  }, [isOpen, telegramId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-bold text-white">History & Analytics</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Current Coins
            </span>
            <p className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">
              🪙 {balance.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Total Earned
            </span>
            <p className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
              🪙 {(userStats?.totalEarned || balance).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Total Withdrawn
            </span>
            <p className="text-lg font-extrabold text-rose-400 font-mono mt-0.5">
              🪙 {(userStats?.totalWithdrawn || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Questions Uploaded
            </span>
            <p className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">
              📝 {uploads.length}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "uploads"
                ? "bg-sky-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Question Uploads ({uploads.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "transactions"
                ? "bg-sky-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Transactions
          </button>
        </div>

        {/* TAB 1: User's Question Uploads History */}
        {activeTab === "uploads" && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {loadingUploads ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading your uploads...</div>
            ) : uploads.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">No questions uploaded yet.</p>
              </div>
            ) : (
              uploads.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-800/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.subjectName}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-[11px] text-sky-400">Code: {item.subjectCode}</span>
                        {item.subjectDate && (
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.2 rounded-full">
                            📅 {item.subjectDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
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
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
                      ⚠️ Note from Admin: {item.rejectReason}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span>Reward: +{item.rewardAmount || 50} Coins</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: General Transactions History */}
        {activeTab === "transactions" && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">No activity recorded yet.</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div
                  key={tx.id || idx}
                  className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="font-semibold text-white">{tx.title}</p>
                      {tx.status && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            tx.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : tx.status === "pending"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {tx.status}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.time}</p>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      tx.type === "earn" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.type === "earn" ? `+${tx.amount}` : `-${tx.amount}`}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
