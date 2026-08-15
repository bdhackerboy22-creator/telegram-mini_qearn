import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSubmission from "@/models/QuestionSubmission";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get("telegramId");

    if (!telegramId) {
      return NextResponse.json({ success: false, error: "Missing telegramId" }, { status: 400 });
    }

    await connectDB();

    const uploads = await QuestionSubmission.find({ telegramId: String(telegramId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      uploads,
    });
  } catch (error) {
    console.error("Fetch user uploads error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
