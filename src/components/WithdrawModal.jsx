"use client";

import { useState } from "react";

export default function WithdrawModal({
  isOpen,
  onClose,
  balance,
  telegramId,
  onWithdrawSuccess,
}) {
  const [operator, setOperator] = useState("Grameenphone");
  const [simType, setSimType] = useState("prepaid"); // 'prepaid' | 'postpaid'
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("200");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const MIN_WITHDRAW_COINS = 200;
  const COIN_PRICE_RATE = 0.1; // 1 Coin = 0.1 TK

  const numAmount = parseInt(amount, 10) || 0;
  const calculatedBDT = (numAmount * COIN_PRICE_RATE).toFixed(2);

  const operators = [
    { id: "Grameenphone", name: "GP", color: "from-sky-500 to-blue-600" },
    { id: "Banglalink", name: "Banglalink", color: "from-amber-500 to-orange-600" },
    { id: "Robi", name: "Robi", color: "from-rose-500 to-red-600" },
    { id: "Airtel", name: "Airtel", color: "from-red-500 to-rose-600" },
    { id: "Teletalk", name: "Teletalk", color: "from-emerald-500 to-teal-600" },
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
          telegramId: telegramId || "demo_user",
          operator,
          simType,
          accountNumber: accountNumber.trim(),
          amount: numAmount,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onWithdrawSuccess(data.balance, data.transaction, {
          totalWithdrawn: data.totalWithdrawn,
        });
        setSuccess(`🎉 ৳${data.bdtAmount} Recharge request submitted! Admin will process it shortly.`);
        setAccountNumber("");
        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 3000);
      } else {
        setError(data.error || "Failed to process recharge request.");
      }
    } catch (err) {
      setError("Network error while submitting recharge.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="text-lg font-bold text-white">Mobile Recharge</h3>
              <p className="text-[11px] text-slate-400">Direct top-up to all Bangladeshi operators</p>
            </div>
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

        {/* Rate Info Banner */}
        <div className="text-[11px] text-slate-300 bg-sky-950/40 border border-sky-500/30 p-2.5 rounded-xl flex items-center justify-between">
          <span>🪙 1 Coin = ৳0.10 TK</span>
          <span className="text-emerald-400 font-bold">Min: 200 Coins (৳20 TK)</span>
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
                className={`flex-1 py-1.5 text-[11px] font-mono rounded-lg border transition-all ${
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
            className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all ${
              loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 active:scale-95"
            }`}
          >
            {loading ? "Processing..." : `Request ৳${calculatedBDT} Recharge`}
          </button>
        </form>
      </div>
    </div>
  );
}
