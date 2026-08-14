"use client";

import { useState } from "react";

export default function WithdrawModal({
  isOpen,
  onClose,
  balance,
  telegramId,
  onWithdrawSuccess,
}) {
  const [method, setMethod] = useState("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const MIN_WITHDRAW_COINS = 500;
  const coinRateText = "1,000 Coins = 50 BDT / $0.50";

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < MIN_WITHDRAW_COINS) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAW_COINS} coins.`);
      return;
    }

    if (numAmount > balance) {
      setError("Insufficient coin balance.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please provide your account number or wallet address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: telegramId || "demo_user",
          method,
          accountNumber,
          amount: numAmount,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onWithdrawSuccess(data.balance, data.transaction, {
          totalWithdrawn: data.totalWithdrawn,
        });
        setSuccess("Withdrawal request submitted! It will be reviewed by admin.");
        setAmount("");
        setAccountNumber("");
        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 3000);
      } else {
        setError(data.error || "Failed to process withdrawal request.");
      }
    } catch (err) {
      setError("Network error while submitting withdrawal.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💳</span>
            <h3 className="text-xl font-bold text-white">Withdraw Coins</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 flex justify-between items-center text-sm">
          <span className="text-slate-400">Available Balance:</span>
          <span className="font-extrabold text-amber-400 font-mono text-base">
            🪙 {balance.toLocaleString()}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          ℹ️ {coinRateText} | Min payout: {MIN_WITHDRAW_COINS} Coins
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          {/* Method Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bkash", label: "bKash" },
                { id: "nagad", label: "Nagad" },
                { id: "ton", label: "TON / USDT" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setMethod(item.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    method === item.id
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account / Wallet Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {method === "ton" ? "Wallet Address" : "Account Number"}:
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={method === "ton" ? "UQ..." : "017XXXXXXXX"}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Amount (Coins):
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${MIN_WITHDRAW_COINS}`}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all ${
              loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 active:scale-95"
            }`}
          >
            {loading ? "Submitting..." : "Submit Withdrawal Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
