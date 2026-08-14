"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'verified' | 'rejected'
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

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

  const handleAction = async (submissionId, action) => {
    setProcessingId(submissionId);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passkey,
          submissionId,
          action,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update state locally
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === submissionId ? { ...sub, status: data.status } : sub
          )
        );

        // Update stats
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
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      alert("Network error");
    }
    setProcessingId(null);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
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
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter admin passcode to review question submissions
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

  // Admin Dashboard
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Management Dashboard</h1>
            <p className="text-xs text-slate-400">Review & verify user question uploads</p>
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
            <span className="text-[11px] uppercase font-bold text-slate-400">Pending Review</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {stats.pendingCount}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] uppercase font-bold text-slate-400">Verified & Paid</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {stats.verifiedCount}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] uppercase font-bold text-slate-400">Rejected</span>
            <p className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
              {stats.rejectedCount}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] uppercase font-bold text-slate-400">Total Users</span>
            <p className="text-2xl font-extrabold text-sky-400 font-mono mt-1">
              {stats.totalUsers}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "all", label: "All Uploads" },
          { id: "pending", label: `Pending (${stats?.pendingCount || 0})` },
          { id: "verified", label: "Verified" },
          { id: "rejected", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List / Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
          <span className="text-4xl">📂</span>
          <p className="text-sm font-semibold text-slate-400 mt-2">No question uploads found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* User & Subject info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{sub.subjectName}</h3>
                    <p className="text-xs text-sky-400 font-mono">Code: {sub.subjectCode}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      User Telegram ID: <span className="font-mono text-slate-300">{sub.telegramId}</span>
                    </p>
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
              </div>

              {/* Action Buttons */}
              {sub.status === "pending" ? (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleAction(sub._id, "approve")}
                    disabled={processingId === sub._id}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20"
                  >
                    {processingId === sub._id ? "..." : "✓ Approve (+50 Coins)"}
                  </button>
                  <button
                    onClick={() => handleAction(sub._id, "reject")}
                    disabled={processingId === sub._id}
                    className="py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 active:scale-98 text-rose-300 font-bold text-xs rounded-xl transition-all"
                  >
                    {processingId === sub._id ? "..." : "✕ Reject"}
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
