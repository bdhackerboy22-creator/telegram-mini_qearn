"use client";

import { useState, useEffect, useRef } from "react";
import { playMonetagRewardedInterstitial } from "@/lib/monetag";

export default function QuestionUploadModal({ isOpen, onClose, telegramId, onUploadSuccess }) {
  const [step, setStep] = useState("ad"); // 'ad' | 'watching_ad' | 'select_subject' | 'upload_image' | 'success'
  const [loadingAd, setLoadingAd] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // 15-second Verification Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const timerRef = useRef(null);
  const adStartTimeRef = useRef(null);
  const isWatchingAdRef = useRef(false);

  // Demo Subject List with codes (simulating database query)
  const subjects = [
    { id: "1", name: "Higher Mathematics", code: "MATH-101", icon: "📐", department: "Science" },
    { id: "2", name: "Physics Part I", code: "PHY-201", icon: "⚡", department: "Science" },
    { id: "3", name: "Chemistry Part I", code: "CHEM-301", icon: "🧪", department: "Science" },
    { id: "4", name: "Computer Science", code: "CSE-110", icon: "💻", department: "Engineering" },
    { id: "5", name: "Accounting & Finance", code: "ACC-102", icon: "📊", department: "Business" },
    { id: "6", name: "English Literature", code: "ENG-101", icon: "📚", department: "Arts" },
  ];

  // Listen for user returning to Mini App early (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If user comes back to mini app before 15 seconds have passed
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
          setStatusMessage("❌ Ad Incomplete! You returned before 15 seconds. Please watch for full 15s to unlock.");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Step 1: Start 15s Ad Session & Open Monetag Ad
  const handleWatchAdAndProceed = async () => {
    setIsError(false);
    setStatusMessage("");
    setLoadingAd(true);
    setStep("watching_ad");
    setSecondsRemaining(15);
    isWatchingAdRef.current = true;
    adStartTimeRef.current = Date.now();

    // 1. Start the 15-second countdown timer inside Mini App
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          isWatchingAdRef.current = false;
          // Completed 15s successfully -> Unlock subject selection!
          setStep("select_subject");
          setIsError(false);
          setStatusMessage("🎉 15s Ad Completed! Please select your subject.");
          setTimeout(() => setStatusMessage(""), 4000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. Trigger Monetag Ad (Opens in ad window/tab)
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

  // Step 3: Handle Image File Pick
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

  // Step 4: Submit to Backend DB & Cloudinary
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
          telegramId: telegramId || "demo_user",
          subjectName: selectedSubject.name,
          subjectCode: selectedSubject.code,
          imageBase64: imagePreview,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep("success");
        onUploadSuccess?.();
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

  const handleResetAndClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    isWatchingAdRef.current = false;
    setStep("ad");
    setSelectedSubject(null);
    setImagePreview(null);
    setStatusMessage("");
    setIsError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📝</span>
            <h3 className="text-lg font-bold text-white">Question Upload Task</h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 border text-xs font-semibold rounded-xl text-center ${
              isError
                ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 animate-pulse"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* STEP 1: Initial Ad Trigger */}
        {step === "ad" && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
              📺
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                15-Second Sponsored Ad
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click below to open the ad. You must stay on the ad for <span className="text-amber-400 font-bold">15 seconds</span> to unlock the upload section.
              </p>
            </div>

            <button
              onClick={handleWatchAdAndProceed}
              disabled={loadingAd}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                loadingAd
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95"
              }`}
            >
              <span>⚡</span>
              <span>{loadingAd ? "Opening..." : "Watch Ad (15s Requirement)"}</span>
            </button>
          </div>
        )}

        {/* STEP 1.5: 15-Second Live Timer & Incomplete Checker */}
        {step === "watching_ad" && (
          <div className="text-center py-8 space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {secondsRemaining}s
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white">
                Ad Session in Progress
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Stay on the ad tab for <span className="text-amber-400 font-bold">{secondsRemaining} seconds</span>. Returning before time will mark it as incomplete.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Subject List Selection (Unlocked after 15s) */}
        {step === "select_subject" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select a Subject to Upload:
              </h4>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                15s Ad Completed ✓
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className="w-full p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl flex items-center justify-between transition-all group active:scale-98 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{sub.icon}</span>
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                        {sub.name}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400">
                        Code: {sub.code} • {sub.department}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Image Upload & Preview */}
        {step === "upload_image" && selectedSubject && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected Subject</span>
                <p className="text-sm font-bold text-white">{selectedSubject.name}</p>
                <p className="text-xs font-mono text-sky-400">Code: {selectedSubject.code}</p>
              </div>
              <button
                onClick={() => setStep("select_subject")}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Change
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center hover:border-sky-500 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Question Preview"
                    className="max-h-44 mx-auto rounded-xl object-contain border border-slate-700 shadow-md"
                  />
                  <label className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold rounded-xl cursor-pointer">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center space-y-2 py-4 cursor-pointer">
                  <span className="text-3xl">📷</span>
                  <span className="text-xs font-bold text-white">Click to Select Question Image</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP supported</span>
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
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                !imagePreview || isSubmitting
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95"
              }`}
            >
              <span>{isSubmitting ? "Uploading..." : "Submit for Verification"}</span>
            </button>
          </div>
        )}

        {/* STEP 4: Success & Pending Verification */}
        {step === "success" && (
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl">
              ⏳
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-white">
                Upload Submitted!
              </h4>
              <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-xs font-semibold">
                Status: Pending Verification 🟡
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto pt-1 leading-relaxed">
                Your question image has been received. Admin will verify it shortly. You will receive coins once verified.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl transition-all"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
