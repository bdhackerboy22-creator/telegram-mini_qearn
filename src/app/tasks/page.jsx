"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import QuestionUploadModal from "@/components/QuestionUploadModal";

export default function TasksPage() {
  const { user } = useUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="p-4 space-y-4 flex-1">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm active:scale-95 transition-transform"
            >
              ←
            </Link>
            <h1 className="text-base font-bold text-white">Available Tasks</h1>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            1 Active Task
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {/* TASK 1: Question Upload Task */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/20">
                  📝
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Question Upload</h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      +50 Coins
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Watch ad, pick subject & upload question photo
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <span>⚡</span>
                <span>Start Upload Task</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Task Hub
        </p>
      </footer>

      {/* Dedicated Question Upload Modal */}
      <QuestionUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        telegramId={user?.id}
      />
    </div>
  );
}
