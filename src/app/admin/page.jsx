"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [stats, setStats] = useState(null);
  const [activeSection, setActiveSection] = useState("withdrawals"); // 'withdrawals' | 'questions'
  const [submissions, setSubmissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'verified'/'completed' | 'rejected'
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Reject Note Modal State (For Questions)
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  // Pay Modal State (For Withdrawals)
  const [payingWithdrawal, setPayingWithdrawal] = useState(null);
  const [trxIdInput, setTrxIdInput] = useState("");

  // Reject Modal State (For Withdrawals)
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState(null);
  const [withdrawalRejectNote, setWithdrawalRejectNote] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (passkey.trim()) {
      fetchAdminData(passkey.trim());
    }
  };

  const fetchAdminData = async (key) => {
    setLoading(true);
    setStatusMessage("");
    try {
      const res = await fetch(`/api/admin/submissions?key=${encodeURIComponent(key)}`);
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setStats(data.stats);
        setSubmissions(data.submissions || []);
        setWithdrawals(data.withdrawals || []);
        sessionStorage.setItem("admin_key", key);
      } else {
        setStatusMessage(data.error || "Invalid Passcode!");
      }
    } catch (err) {
      setStatusMessage("Failed to connect to backend");
    }
    setLoading(false);
  };

  useEffect(() => {
    const savedKey = sessionStorage.getItem("admin_key");
    if (savedKey) {
      setPasskey(savedKey);
      fetchAdminData(savedKey);
    }
  }, []);

  // Download image with format: SubjectName_SubjectCode_Date.jpg
  const handleDownloadImage = async (sub) => {
    const imgUrl = sub.imageUrl || sub.imageBase64;
    if (!imgUrl) return;

    try {
      const cleanName = (sub.subjectName || "Subject").replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanCode = (sub.subjectCode || "Code").replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanDate = (sub.subjectDate || "NoDate").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `${cleanName}_${cleanCode}_${cleanDate}.jpg`;

      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(imgUrl, "_blank");
    }
  };

  // Action on Question Submissions (Approve / Reject)
  const handleQuestionAction = async (submissionId, action, reason = "") => {
    setProcessingId(submissionId);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passkey,
          submissionId,
          action,
          rejectReason: reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === submissionId
              ? { ...sub, status: data.status, rejectReason: reason || sub.rejectReason }
              : sub
          )
        );

        setStats((prev) => {
          if (!prev) return prev;
          const isApprove = action === "approve";
          return {
            ...prev,
            pendingCount: Math.max(0, prev.pendingCount - 1),
            verifiedCount: isApprove ? prev.verifiedCount + 1 : prev.verifiedCount,
            rejectedCount: !isApprove ? prev.rejectedCount + 1 : prev.rejectedCount,
          };
        });

        if (action === "reject") {
          setRejectingItem(null);
          setRejectNote("");
        }
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      alert("Network error");
    }
    setProcessingId(null);
  };

  // Action on Withdrawal Requests (Pay with TRX ID / Reject with Refund)
  const handleWithdrawalAction = async (withdrawalId, action, extra = {}) => {
    setProcessingId(withdrawalId);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passkey,
          withdrawalId,
          action,
          trxId: extra.trxId,
          rejectReason: extra.rejectReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === withdrawalId
              ? {
                  ...w,
                  status: data.status,
                  trxId: data.trxId || w.trxId,
                  rejectReason: data.rejectReason || w.rejectReason,
                }
              : w
          )
        );

        setStats((prev) => {
          if (!prev) return prev;
          const isPay = action === "pay";
          return {
            ...prev,
            pendingWithdrawalsCount: Math.max(0, (prev.pendingWithdrawalsCount || 1) - 1),
            paidWithdrawalsCount: isPay
              ? (prev.paidWithdrawalsCount || 0) + 1
              : prev.paidWithdrawalsCount,
            rejectedWithdrawalsCount: !isPay
              ? (prev.rejectedWithdrawalsCount || 0) + 1
              : prev.rejectedWithdrawalsCount,
          };
        });

        setPayingWithdrawal(null);
        setTrxIdInput("");
        setRejectingWithdrawal(null);
        setWithdrawalRejectNote("");
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      alert("Network error");
    }
    setProcessingId(null);
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  // Filter Withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === "all") return true;
    if (filter === "verified") return w.status === "completed";
    return w.status === filter;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter passcode to review questions & recharge requests
            </p>
          </div>

          {statusMessage && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-semibold">
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Passcode (default: admin123)"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white text-center focus:outline-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {loading ? "Authenticating..." : "Login Dashboard"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Management Dashboard</h1>
            <p className="text-xs text-slate-400">Mobile Recharge & Question Upload Manager</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchAdminData(passkey)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_key");
              setIsAuthenticated(false);
            }}
            className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Recharge</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {stats.pendingWithdrawalsCount || 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Questions</span>
            <p className="text-2xl font-extrabold text-sky-400 font-mono mt-1">
              {stats.pendingCount || 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Paid Recharges</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {stats.paidWithdrawalsCount || 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
            <p className="text-2xl font-extrabold text-purple-400 font-mono mt-1">
              {stats.totalUsers || 0}
            </p>
          </div>
        </div>
      )}

      {/* Section Switcher Tabs: Mobile Recharges vs Question Uploads */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            setActiveSection("withdrawals");
            setFilter("all");
          }}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeSection === "withdrawals"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>📱</span>
          <span>Mobile Recharge Requests ({withdrawals.length})</span>
          {stats?.pendingWithdrawalsCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {stats.pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSection("questions");
            setFilter("all");
          }}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeSection === "questions"
              ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>📝</span>
          <span>Question Uploads ({submissions.length})</span>
          {stats?.pendingCount > 0 && (
            <span className="bg-sky-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {stats.pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "all", label: "All Records" },
          { id: "pending", label: "Pending" },
          { id: "verified", label: activeSection === "withdrawals" ? "Paid" : "Verified" },
          { id: "rejected", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? "bg-slate-800 text-sky-400 border border-sky-500/40"
                : "bg-slate-900/60 text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MOBILE RECHARGE REQUESTS                       */}
      {/* ========================================================= */}
      {activeSection === "withdrawals" && (
        <div className="space-y-4">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
              <span className="text-4xl">📱</span>
              <p className="text-sm font-semibold text-slate-400 mt-2">
                No recharge requests found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWithdrawals.map((w) => (
                <div
                  key={w._id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Amount & Status */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-extrabold text-emerald-400 font-mono">
                            ৳{w.bdtAmount || (w.amount * 0.1).toFixed(2)} TK
                          </span>
                          <span className="text-xs text-amber-400 font-mono">
                            ({w.amount} Coins)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Operator: <span className="text-white font-bold">{w.operator || "Mobile"}</span> ({w.simType || "prepaid"})
                        </p>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                          w.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : w.status === "rejected"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {w.status === "completed" ? "PAID ✓" : w.status}
                      </span>
                    </div>

                    {/* Mobile Number Box */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Recharge Mobile Number
                        </span>
                        <span className="text-base font-black text-sky-400 font-mono tracking-wider">
                          {w.accountNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(w.accountNumber);
                          alert(`Copied ${w.accountNumber} to clipboard!`);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        📋 Copy
                      </button>
                    </div>

                    {/* User Telegram ID & Time */}
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>User ID: <span className="font-mono text-slate-300">{w.telegramId}</span></span>
                      <span>{new Date(w.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Transaction ID if Paid */}
                    {w.trxId && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-mono">
                        ✅ Trx ID: <span className="font-bold">{w.trxId}</span>
                      </div>
                    )}

                    {/* Rejection Note */}
                    {w.rejectReason && w.status === "rejected" && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                        ⚠️ Reject Reason: {w.rejectReason} (Coins refunded)
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Recharges */}
                  {w.status === "pending" ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setPayingWithdrawal(w);
                          setTrxIdInput("");
                        }}
                        disabled={processingId === w._id}
                        className="py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20"
                      >
                        ✓ Mark as Paid
                      </button>
                      <button
                        onClick={() => {
                          setRejectingWithdrawal(w);
                          setWithdrawalRejectNote("");
                        }}
                        disabled={processingId === w._id}
                        className="py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 active:scale-98 text-rose-300 font-bold text-xs rounded-xl transition-all"
                      >
                        ✕ Reject & Refund
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 text-center">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Processed • Status: {w.status === "completed" ? "Paid" : w.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: QUESTION UPLOADS                               */}
      {/* ========================================================= */}
      {activeSection === "questions" && (
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
              <span className="text-4xl">📂</span>
              <p className="text-sm font-semibold text-slate-400 mt-2">
                No question uploads found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* User, Subject & Date Info */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-base">{sub.subjectName}</h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-sky-400 font-mono">Code: {sub.subjectCode}</span>
                          {sub.subjectDate && (
                            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.2 rounded-full">
                              📅 {sub.subjectDate}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          User ID: <span className="font-mono text-slate-300">{sub.telegramId}</span>
                        </p>
                        {sub.rejectReason && (
                          <p className="text-xs text-rose-400 mt-1 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                            ⚠️ Note: {sub.rejectReason}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                          sub.status === "verified"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : sub.status === "rejected"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    {/* Question Image Preview */}
                    <div
                      onClick={() => setSelectedImage(sub.imageUrl || sub.imageBase64)}
                      className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer max-h-48 flex items-center justify-center"
                    >
                      <img
                        src={sub.imageUrl || sub.imageBase64}
                        alt={sub.subjectName}
                        className="max-h-48 w-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white transition-opacity">
                        🔍 Click to Zoom Image
                      </div>
                    </div>

                    {/* Download Image Button */}
                    <button
                      onClick={() => handleDownloadImage(sub)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all border border-slate-700"
                    >
                      <span>⬇️</span>
                      <span>Download ({sub.subjectCode}_{sub.subjectDate || "date"}.jpg)</span>
                    </button>
                  </div>

                  {/* Actions for Question Submissions */}
                  {sub.status === "pending" ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleQuestionAction(sub._id, "approve")}
                        disabled={processingId === sub._id}
                        className="py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20"
                      >
                        {processingId === sub._id ? "..." : "✓ Approve (+50 Coins)"}
                      </button>
                      <button
                        onClick={() => {
                          setRejectingItem(sub);
                          setRejectNote("");
                        }}
                        disabled={processingId === sub._id}
                        className="py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 active:scale-98 text-rose-300 font-bold text-xs rounded-xl transition-all"
                      >
                        ✕ Reject with Note
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 text-center">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Processed • Status: {sub.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Mark Withdrawal as Paid (Enter TRX ID) */}
      {payingWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Mark Recharge as Paid</h3>
              <button
                onClick={() => setPayingWithdrawal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-400">
                Amount: <span className="text-emerald-400 font-bold font-mono">৳{payingWithdrawal.bdtAmount || (payingWithdrawal.amount * 0.1).toFixed(2)} TK</span>
              </p>
              <p className="text-slate-400">
                Number: <span className="text-sky-400 font-bold font-mono">{payingWithdrawal.accountNumber}</span> ({payingWithdrawal.operator})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Enter Mobile Recharge Transaction ID / Ref:
              </label>
              <input
                type="text"
                placeholder="e.g. TRX98273461"
                value={trxIdInput}
                onChange={(e) => setTrxIdInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setPayingWithdrawal(null)}
                className="py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleWithdrawalAction(payingWithdrawal._id, "pay", {
                    trxId: trxIdInput.trim() || `TRX_${Date.now().toString().slice(-8)}`,
                  })
                }
                className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Confirm Paid ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Withdrawal with Refund Reason */}
      {rejectingWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Reject Recharge Request</h3>
              <button
                onClick={() => setRejectingWithdrawal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Rejection will <span className="text-amber-400 font-bold">refund {rejectingWithdrawal.amount} coins</span> back to user <span className="text-white font-semibold font-mono">{rejectingWithdrawal.telegramId}</span>:
            </p>

            <textarea
              rows="3"
              placeholder="e.g. Invalid operator / Wrong 11-digit number / Network down..."
              value={withdrawalRejectNote}
              onChange={(e) => setWithdrawalRejectNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-3 text-xs text-white focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRejectingWithdrawal(null)}
                className="py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleWithdrawalAction(rejectingWithdrawal._id, "reject_withdraw", {
                    rejectReason: withdrawalRejectNote.trim() || "Invalid mobile number",
                  })
                }
                className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Reject & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reject Question Note Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Reject Question Note</h3>
              <button
                onClick={() => setRejectingItem(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter reason for rejecting <span className="text-white font-semibold">{rejectingItem.subjectName} ({rejectingItem.subjectCode})</span>:
            </p>

            <textarea
              rows="3"
              placeholder="e.g. Blurry photo / Incorrect year / Duplicate question..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-3 text-xs text-white focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleQuestionAction(
                    rejectingItem._id,
                    "reject",
                    rejectNote.trim() || "Question image is invalid/blurry"
                  )
                }
                className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-3xl max-h-[90vh] relative">
            <img
              src={selectedImage}
              alt="Zoomed Question"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
            <p className="text-center text-xs text-slate-400 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </main>
  );
}
