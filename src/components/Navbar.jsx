"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";

export default function Navbar() {
  const { user, balance } = useUser();

  const firstName = user?.first_name || "User";
  const username = user?.username ? `@${user.username}` : `ID: ${user?.id || ""}`;
  const avatarLetter = firstName ? firstName[0].toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {/* Left: User Profile Brief */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-base text-white shadow-md border border-sky-400/30">
              {avatarLetter}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                {firstName}
              </h2>
              <span className="px-1.5 py-0.2 text-[8px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full">
                VIP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{username}</p>
          </div>
        </Link>

        {/* Right: Live Coin Balance Capsule */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800/90 px-3 py-1.5 rounded-2xl shadow-inner">
          <span className="text-base">🪙</span>
          <span className="text-sm font-extrabold text-amber-400 font-mono tracking-tight">
            {(balance || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
}
