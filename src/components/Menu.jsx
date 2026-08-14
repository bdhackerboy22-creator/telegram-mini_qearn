"use client";

export default function Menu({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "earn", label: "Earn", icon: "⚡" },
    { id: "tasks", label: "Tasks", icon: "📋" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "wallet", label: "Wallet", icon: "💼" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 z-50">
      <div className="flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-sky-400 bg-sky-500/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
