import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subject from "@/models/Subject";
import QuestionSubmission from "@/models/QuestionSubmission";

// Default Master Subjects if DB is empty initially
const INITIAL_MASTER_SUBJECTS = [
  { code: "MATH-101", name: "Higher Mathematics Part I", department: "Science", icon: "📐" },
  { code: "MATH-102", name: "Higher Mathematics Part II", department: "Science", icon: "📐" },
  { code: "PHY-201", name: "Physics Part I", department: "Science", icon: "⚡" },
  { code: "PHY-202", name: "Physics Part II", department: "Science", icon: "⚡" },
  { code: "CHEM-301", name: "Chemistry Part I", department: "Science", icon: "🧪" },
  { code: "CHEM-302", name: "Chemistry Part II", department: "Science", icon: "🧪" },
  { code: "BIO-401", name: "Biology Part I", department: "Science", icon: "🔬" },
  { code: "CSE-110", name: "Computer & ICT", department: "Engineering", icon: "💻" },
  { code: "ACC-101", name: "Accounting First Paper", department: "Business", icon: "📊" },
  { code: "ACC-102", name: "Accounting Second Paper", department: "Business", icon: "📊" },
  { code: "ENG-101", name: "English 1st Paper", department: "General", icon: "📚" },
  { code: "BAN-101", name: "Bangla 1st Paper", department: "General", icon: "📖" },
];

export async function GET(request) {
  try {
    await connectDB();

    // 1. Seed initial Master subjects if collection is empty
    const subjectCount = await Subject.countDocuments();
    if (subjectCount === 0) {
      await Subject.insertMany(INITIAL_MASTER_SUBJECTS);
    }

    // 2. Fetch all Master Subjects from DB
    const allSubjects = await Subject.find({ isActive: { $ne: false } }).lean();

    // 3. Fetch already uploaded subject codes (pending or verified in QuestionSubmission)
    const uploadedSubmissions = await QuestionSubmission.find(
      { status: { $in: ["pending", "verified"] } },
      { subjectCode: 1 }
    ).lean();

    const uploadedCodesSet = new Set(
      uploadedSubmissions.map((s) => s.subjectCode).filter(Boolean)
    );

    // 4. Merge & Filter: Exclude subjects that have already been uploaded!
    const availableSubjects = allSubjects.filter(
      (sub) => !uploadedCodesSet.has(sub.code)
    );

    return NextResponse.json({
      success: true,
      totalMasterSubjects: allSubjects.length,
      alreadyUploadedCount: uploadedCodesSet.size,
      availableCount: availableSubjects.length,
      subjects: availableSubjects,
    });
  } catch (error) {
    console.error("Subjects fetch & merge error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
