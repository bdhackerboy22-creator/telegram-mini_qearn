"use client";

export default function BalanceModal({
  isOpen,
  onClose,
  balance,
  userStats,
  transactions = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-bold text-white">Balance & Analytics</h3>
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
              Ads Watched
            </span>
            <p className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">
              📺 {userStats?.adsWatchedCount || 0}
            </p>
          </div>
        </div>

        {/* History Log */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Transaction & Activity History
          </h4>

          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {transactions.map((tx, idx) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
