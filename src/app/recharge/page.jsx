"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";

export default function RechargePage() {
  const { user, balance, updateBalance } = useUser();

  const [operator, setOperator] = useState("Grameenphone");
  const [simType, setSimType] = useState("prepaid");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("200");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const MIN_WITHDRAW_COINS = 200;
  const COIN_PRICE_RATE = 0.1; // 1 Coin = 0.1 TK

  const numAmount = parseInt(amount, 10) || 0;
  const calculatedBDT = (numAmount * COIN_PRICE_RATE).toFixed(2);

  const operators = [
    { id: "Grameenphone", name: "GP" },
    { id: "Banglalink", name: "Banglalink" },
    { id: "Robi", name: "Robi" },
    { id: "Airtel", name: "Airtel" },
    { id: "Teletalk", name: "Teletalk" },
  ];

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isNaN(numAmount) || numAmount < MIN_WITHDRAW_COINS) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAW_COINS} coins (৳20 TK Recharge).`);
      return;
    }

    if (numAmount > balance) {
      setError("Insufficient coin balance.");
      return;
    }

    if (!accountNumber.trim() || accountNumber.trim().length < 11) {
      setError("Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: user?.id || "demo_user",
          operator,
          simType,
          accountNumber: accountNumber.trim(),
          amount: numAmount,
        }),
      });

      const data = await res.json();

      if (data.success) {
        updateBalance(data.balance, data.transaction, {
          totalWithdrawn: data.totalWithdrawn,
        });
        setSuccess(`🎉 ৳${data.bdtAmount} Recharge request submitted! Admin will process it shortly.`);
        setAccountNumber("");
      } else {
        setError(data.error || "Failed to process recharge request.");
      }
    } catch (err) {
      setError("Network error while submitting recharge.");
    }

    setLoading(false);
  };

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
            <h1 className="text-base font-bold text-white">Mobile Recharge</h1>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            1 Coin = ৳0.10 TK
          </span>
        </div>

        {/* Rate Info Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 block">Available Balance:</span>
            <span className="font-extrabold text-amber-400 font-mono text-base">
              🪙 {(balance || 0).toLocaleString()} Coins
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Min Cashout:</span>
            <span className="text-emerald-400 font-bold font-mono">200 Coins (৳20 TK)</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-2xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-2xl text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl">
          {/* Operator Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Select SIM Operator:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {operators.map((op) => (
                <button
                  type="button"
                  key={op.id}
                  onClick={() => setOperator(op.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    operator === op.id
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {op.name}
                </button>
              ))}
            </div>
          </div>

          {/* SIM Type (Prepaid / Postpaid) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              SIM Connection Type:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "prepaid", label: "Prepaid" },
                { id: "postpaid", label: "Postpaid" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSimType(item.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    simType === item.id
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Mobile Number (11 Digits):
            </label>
            <input
              type="tel"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono"
            />
          </div>

          {/* Coin Amount & Live BDT Conversion */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                Amount (Coins):
              </label>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                = ৳{calculatedBDT} BDT Recharge
              </span>
            </div>
            <input
              type="number"
              required
              min={MIN_WITHDRAW_COINS}
              step="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="200"
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex space-x-2">
            {[200, 300, 500, 1000].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmount(String(preset))}
                className={`flex-1 py-2 text-xs font-mono rounded-xl border transition-all ${
                  numAmount === preset
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {preset} (৳{preset * 0.1})
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white font-bold text-sm rounded-2xl shadow-lg transition-all ${
              loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 active:scale-95"
            }`}
          >
            {loading ? "Processing..." : `Submit ৳${calculatedBDT} Recharge Request`}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Recharge Hub
        </p>
      </footer>
    </div>
  );
}
