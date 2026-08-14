"use client";

export default function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💬</span>
            <h3 className="text-xl font-bold text-white">Support & Community</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Need help with ads, earnings, or withdrawals? Reach out to our official support team.
        </p>

        {/* Links */}
        <div className="space-y-3">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👨‍💻</span>
              <div>
                <h4 className="text-sm font-bold text-white">Contact Admin</h4>
                <p className="text-[11px] text-slate-400">Direct Telegram Chat</p>
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
            className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📢</span>
              <div>
                <h4 className="text-sm font-bold text-white">Official Channel</h4>
                <p className="text-[11px] text-slate-400">Payment proofs & updates</p>
              </div>
            </div>
            <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
              Join →
            </span>
          </a>

          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <h4 className="text-sm font-bold text-white">Discussion Group</h4>
                <p className="text-[11px] text-slate-400">Community chat</p>
              </div>
            </div>
            <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
              Visit →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
