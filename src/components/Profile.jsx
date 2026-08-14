"use client";

export default function Profile({ user, balance = 0 }) {
  const firstName = user?.first_name || "Guest";
  const lastName = user?.last_name || "";
  const username = user?.username ? `@${user.username}` : `ID: ${user?.id || "Demo User"}`;
  const avatarLetter = firstName ? firstName[0].toUpperCase() : "U";

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/70 rounded-3xl p-5 shadow-2xl">
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md border-2 border-sky-400/40">
              {avatarLetter}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                {firstName} {lastName}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full">
                VIP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{username}</p>
          </div>
        </div>

        <div className="text-right bg-slate-950/70 border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-inner">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Coin Balance
          </span>
          <div className="flex items-center justify-end space-x-1.5 mt-0.5">
            <span className="text-xl">🪙</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
              {balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
