"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { playMonetagAd, openMonetagDirectLink, isMonetagSDKReady } from "@/lib/monetag";

export default function SubjectsUploadPage() {
  const router = useRouter();
  const { user } = useUser();

  // Screen Stages: 'ad' | 'watching_ad' | 'select_subject' | 'upload_image' | 'success'
  const [step, setStep] = useState("ad");
  const [loadingAd, setLoadingAd] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // 15-Second Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const timerRef = useRef(null);
  const adStartTimeRef = useRef(null);
  const isWatchingAdRef = useRef(false);

  // Subjects & Upload State
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch available subjects from API (Merged & Filtered)
  const fetchAvailableSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await fetch("/api/subjects/available");
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error("Failed to fetch available subjects:", err);
    }
    setLoadingSubjects(false);
  };

  // 2. Early return listener (Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isWatchingAdRef.current) {
        const elapsed = adStartTimeRef.current
          ? Math.floor((Date.now() - adStartTimeRef.current) / 1000)
          : 0;

        if (elapsed < 15) {
          // Came back too early -> INCOMPLETE!
          if (timerRef.current) clearInterval(timerRef.current);
          isWatchingAdRef.current = false;
          setStep("ad");
          setIsError(true);
          setStatusMessage(
            "❌ Ad Incomplete! You returned before 15 seconds. Please stay on ad page for full 15s to unlock."
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Step 1: Watch Ad with 15s Timer
  const handleWatchAdAndProceed = () => {
    setIsError(false);
    setStatusMessage("");
    setLoadingAd(true);

    // 1. Instantly trigger the Ad (SDK or Direct Smartlink in new window)
    try {
      playMonetagAd();
    } catch (err) {
      console.warn("Ad trigger error:", err);
    }

    // 2. Start the 15s Countdown Screen
    setStep("watching_ad");
    setSecondsRemaining(15);
    isWatchingAdRef.current = true;
    adStartTimeRef.current = Date.now();

    // 15-second countdown timer
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          isWatchingAdRef.current = false;
          // Successfully completed 15s -> Fetch available subjects & unlock screen!
          fetchAvailableSubjects();
          setStep("select_subject");
          setIsError(false);
          setStatusMessage("🎉 15s Ad Completed! Please pick an available subject.");
          setTimeout(() => setStatusMessage(""), 4000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setLoadingAd(false);
  };

  // Step 2: Handle Subject Selection
  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setStep("upload_image");
  };

  // Step 3: Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 4: Submit to Backend DB
  const handleSubmitQuestion = async () => {
    if (!imagePreview || !selectedSubject) return;

    setIsSubmitting(true);
    setIsError(false);
    setStatusMessage("Uploading question image to Cloudinary...");

    try {
      const response = await fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: user?.id || "demo_user",
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          subjectDate: selectedSubject.date,
          imageBase64: imagePreview,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("success");
      } else {
        setIsError(true);
        setStatusMessage(data.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage("Network error during submission. Please try again.");
    }

    setIsSubmitting(false);
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.date && sub.date.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full select-none">
      {/* 1. Top Navbar */}
      <Navbar />

      {/* 2. Main Content Body */}
      <main className="p-4 space-y-4 flex-1 flex flex-col justify-center">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Link
              href="/tasks"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm active:scale-95 transition-transform"
            >
              ←
            </Link>
            <h1 className="text-base font-bold text-white">Upload Exam Question</h1>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
            +50 Coins
          </span>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold text-center border ${
              isError
                ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: WATCH 15S AD SCREEN                                  */}
        {/* ------------------------------------------------------------- */}
        {step === "ad" && (
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-sky-500/20">
              📺
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Watch 15s Sponsor Ad</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Watch a short 15-second ad to unlock the available subject database and upload your exam question!
              </p>
            </div>

            {/* Reward Preview */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Reward per approved upload:</span>
              <span className="text-amber-400 font-extrabold">🪙 +50 Coins</span>
            </div>

            <button
              onClick={handleWatchAdAndProceed}
              disabled={loadingAd}
              className={`w-full py-4 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 ${
                loadingAd
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 shadow-sky-500/25 active:scale-98"
              }`}
            >
              <span>⚡</span>
              <span>{loadingAd ? "Opening Ad..." : "Watch 15s Ad & Unlock Subjects"}</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1.5: 15-SECOND COUNTDOWN WATCHING AD SCREEN             */}
        {/* ------------------------------------------------------------- */}
        {step === "watching_ad" && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/50 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {secondsRemaining}s
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Left</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">Viewing Sponsored Content</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ad opened in new tab. Please stay active. <br />
                <span className="text-amber-400 font-bold">
                  Do not close or leave before 15 seconds!
                </span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-1000"
                style={{ width: `${((15 - secondsRemaining) / 15) * 100}%` }}
              />
            </div>

            {/* Reopen Ad Link if blocked */}
            <button
              type="button"
              onClick={openMonetagDirectLink}
              className="text-[11px] text-sky-400 hover:text-sky-300 underline font-semibold block mx-auto"
            >
              Ad didn't open? Click here to open Ad
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: SELECT AVAILABLE SUBJECT (Merged & Verified Filter)  */}
        {/* ------------------------------------------------------------- */}
        {step === "select_subject" && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center space-x-2">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject code, name or exam date..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Available Subjects ({filteredSubjects.length})
              </span>
              <button
                onClick={fetchAvailableSubjects}
                className="text-xs text-sky-400 font-bold hover:underline"
              >
                🔄 Refresh List
              </button>
            </div>

            {loadingSubjects ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading merged database subjects...
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
                <span className="text-3xl">🎉</span>
                <p className="text-sm font-bold text-white">All subjects completed!</p>
                <p className="text-xs text-slate-400">
                  All routine subjects have already been uploaded and verified.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredSubjects.map((sub, idx) => (
                  <div
                    key={`${sub.code}-${idx}`}
                    onClick={() => handleSelectSubject(sub)}
                    className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-md group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {sub.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-mono text-sky-400">Code: {sub.code}</span>
                        {sub.date && (
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.2 rounded-full">
                            📅 {sub.date}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
                      Select →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: UPLOAD QUESTION PHOTO                                 */}
        {/* ------------------------------------------------------------- */}
        {step === "upload_image" && selectedSubject && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            {/* Selected Subject Banner */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Target Subject
                </span>
                <h3 className="text-sm font-bold text-white">{selectedSubject.name}</h3>
                <span className="text-xs text-sky-400 font-mono">
                  Code: {selectedSubject.code} • Date: {selectedSubject.date || "N/A"}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setImagePreview(null);
                  setStep("select_subject");
                }}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                Change
              </button>
            </div>

            {/* Image Preview / File Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Attach Clear Photo of Exam Question:
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-56 w-full object-contain"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60">
                  <span className="text-3xl">📷</span>
                  <span className="text-xs font-bold text-slate-300 mt-2">
                    Click to Take Photo or Browse Gallery
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Clear readable text required
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              onClick={handleSubmitQuestion}
              disabled={!imagePreview || isSubmitting}
              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all ${
                !imagePreview || isSubmitting
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 active:scale-98"
              }`}
            >
              {isSubmitting ? "Uploading..." : "Submit for Admin Review (+50 Coins)"}
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: SUCCESS CONFIRMATION                                 */}
        {/* ------------------------------------------------------------- */}
        {step === "success" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20">
              ✓
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Upload Submitted!</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Your question photo for{" "}
                <span className="text-white font-semibold">{selectedSubject?.name}</span> is pending
                admin review.
              </p>
              <p className="text-xs text-emerald-400 font-semibold font-mono pt-1">
                +50 Coins will be credited upon admin approval!
              </p>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setImagePreview(null);
                  setStep("ad");
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Upload Another
              </button>
              <Link
                href="/history"
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center"
              >
                View History
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Exam Question Hub
        </p>
      </footer>
    </div>
  );
}
