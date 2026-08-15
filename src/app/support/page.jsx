"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SupportPage() {
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
            <h1 className="text-base font-bold text-white">Support & Community</h1>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            24/7 Active
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Need help with question uploads, coin rewards, or mobile recharges? Contact our official support or join our community.
        </p>

        {/* Support Channels */}
        <div className="space-y-3 pt-2">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 rounded-3xl transition-all group shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👨‍💻
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                  Contact Support Admin
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Direct Telegram Support Chat</p>
              </div>
            </div>
            <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
              Chat →
            </span>
          </a>

          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 rounded-3xl transition-all group shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📢
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  Official Telegram Channel
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Payment proofs & system updates</p>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
              Join →
            </span>
          </a>

          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 rounded-3xl transition-all group shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Community Discussion Group
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Chat & discuss with other earners</p>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
              Visit →
            </span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Official Support
        </p>
      </footer>
    </div>
  );
}
