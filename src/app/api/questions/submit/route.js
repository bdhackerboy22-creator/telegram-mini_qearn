import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSubmission from "@/models/QuestionSubmission";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const { telegramId, subjectName, subjectCode, imageBase64 } = await request.json();

    if (!telegramId || !subjectName || !imageBase64) {
      return NextResponse.json(
        { success: false, error: "Missing required submission fields" },
        { status: 400 }
      );
    }

    // 1. Upload the image directly to Cloudinary
    const uploadedImageUrl = await uploadToCloudinary(imageBase64, "telegram_questions");

    await connectDB();

    // 2. Save only the lightweight Cloudinary URL to MongoDB (Uses ~0 MB storage!)
    const submission = await QuestionSubmission.create({
      telegramId: String(telegramId),
      subjectName,
      subjectCode: subjectCode || "N/A",
      imageUrl: uploadedImageUrl,
      status: "pending",
      rewardAmount: 50,
    });

    return NextResponse.json({
      success: true,
      submissionId: submission._id,
      imageUrl: uploadedImageUrl,
      status: submission.status,
      message: "Question uploaded successfully! Status is pending verification.",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
