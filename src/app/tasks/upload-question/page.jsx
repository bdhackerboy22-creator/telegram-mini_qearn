"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { playMonetagRewardedInterstitial } from "@/lib/monetag";

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
            "❌ Ad Incomplete! You returned before 15 seconds. Please watch for full 15s to unlock."
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

    // Trigger Monetag Ad
    try {
      playMonetagRewardedInterstitial();
    } catch (err) {
      console.warn("Ad trigger note:", err);
    }

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
          subjectName: selectedSubject.name,
          subjectCode: selectedSubject.code,
          imageBase64: imagePreview,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep("success");
      } else {
        setIsError(true);
        setStatusMessage(data.error || "Failed to submit question");
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage("Network error during upload");
    }

    setIsSubmitting(false);
  };

  // Filter subjects by search
  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto w-full">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* Main Full-Screen Content */}
      <main className="p-4 space-y-4 flex-1 flex flex-col">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (step === "upload_image") {
                  setStep("select_subject");
                } else if (step === "select_subject") {
                  setStep("ad");
                } else {
                  router.push("/tasks");
                }
              }}
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm active:scale-95 transition-transform"
            >
              ←
            </button>
            <h1 className="text-base font-bold text-white">
              {step === "upload_image"
                ? "Upload Question Photo"
                : step === "select_subject"
                ? "Select Subject"
                : "Question Upload Task"}
            </h1>
          </div>

          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            +50 Coins
          </span>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`p-3 border text-xs font-semibold rounded-2xl text-center ${
              isError
                ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 animate-pulse"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* STAGE 1: Ad Requirement Screen */}
        {step === "ad" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10">
              📺
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h2 className="text-lg font-bold text-white">
                15-Second Sponsored Ad
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch a 15-second sponsored ad to unlock the remaining available question subjects list.
              </p>
            </div>

            <div className="w-full max-w-xs pt-4">
              <button
                onClick={handleWatchAdAndProceed}
                disabled={loadingAd}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>⚡</span>
                <span>{loadingAd ? "Opening Ad..." : "Watch Ad & Unlock Subjects"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 1.5: 15s Countdown Screen */}
        {step === "watching_ad" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6">
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-amber-400 font-mono">
                  {secondsRemaining}s
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-white">
                Ad Session in Progress
              </h3>
              <p className="text-xs text-slate-400">
                Please stay on the ad for <span className="text-amber-400 font-bold">{secondsRemaining} seconds</span>. Returning before time will reset the session.
              </p>
            </div>
          </div>
        )}

        {/* STAGE 2: Full-Screen Subject Selection List (Filtered) */}
        {step === "select_subject" && (
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search subject by name or code (e.g. MATH-101)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none shadow-inner"
              />
              <span className="absolute right-3.5 top-3 text-slate-500 text-sm">🔍</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[60vh]">
              {loadingSubjects ? (
                <div className="p-12 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading remaining subjects...</p>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
                  <span className="text-3xl">🎉</span>
                  <p className="text-sm font-bold text-white">All Subjects Completed!</p>
                  <p className="text-xs text-slate-400">
                    All question subjects have already been uploaded by contributors.
                  </p>
                </div>
              ) : (
                filteredSubjects.map((sub) => (
                  <button
                    key={sub.code}
                    onClick={() => handleSelectSubject(sub)}
                    className="w-full p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl flex items-center justify-between transition-all group active:scale-98 text-left shadow-md"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-2xl">{sub.icon || "📚"}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {sub.name}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Code: <span className="text-sky-400 font-bold">{sub.code}</span> • {sub.department}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                      Select →
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAGE 3: Full-Screen Image Upload & Preview */}
        {step === "upload_image" && selectedSubject && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Selected Subject Banner */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Subject</span>
                  <h3 className="text-sm font-bold text-white">{selectedSubject.name}</h3>
                  <p className="text-xs font-mono text-sky-400">Code: {selectedSubject.code}</p>
                </div>
                <button
                  onClick={() => setStep("select_subject")}
                  className="text-xs font-semibold text-sky-400 hover:underline px-2.5 py-1 bg-sky-500/10 rounded-xl"
                >
                  Change
                </button>
              </div>

              {/* Photo Selector Area */}
              <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 rounded-3xl p-5 text-center transition-colors bg-slate-900/40">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Question Preview"
                      className="max-h-52 mx-auto rounded-2xl object-contain border border-slate-800 shadow-xl"
                    />
                    <label className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded-xl cursor-pointer active:scale-95 transition-all">
                      Choose Another Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center space-y-3 py-8 cursor-pointer group">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Click to Take / Select Question Photo
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        High resolution JPG, PNG or WebP
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleSubmitQuestion}
              disabled={!imagePreview || isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                !imagePreview || isSubmitting
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95"
              }`}
            >
              <span>{isSubmitting ? "Uploading to Cloud..." : "Submit for Verification"}</span>
            </button>
          </div>
        )}

        {/* STAGE 4: Success / Pending Screen */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-8 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10">
              ⏳
            </div>
            <div className="space-y-2 max-w-xs">
              <h2 className="text-xl font-bold text-white">
                Upload Submitted!
              </h2>
              <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-xs font-bold font-mono">
                Status: Pending Verification 🟡
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Your question photo has been submitted to the queue. Admin will verify it shortly. You will receive coins once verified.
              </p>
            </div>

            <div className="w-full max-w-xs pt-4">
              <Link
                href="/tasks"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-800 transition-all block"
              >
                Back to Tasks
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3">
        <p className="text-[11px] text-slate-600 font-medium">
          Telegram Mini App • Subject Portal
        </p>
      </footer>
    </div>
  );
}
