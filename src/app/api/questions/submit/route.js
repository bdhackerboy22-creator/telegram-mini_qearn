import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSubmission from "@/models/QuestionSubmission";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { broadcastActivity } from "@/lib/telegramBroadcast";

export async function POST(request) {
  try {
    const { telegramId, subjectCode, subjectName, subjectDate, imageBase64 } = await request.json();

    if (!telegramId || !subjectCode || !imageBase64) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Upload question image to Cloudinary
    let uploadedImageUrl = imageBase64;
    try {
      uploadedImageUrl = await uploadToCloudinary(imageBase64, "question_uploads");
    } catch (uploadErr) {
      console.warn("Cloudinary upload fallback to direct storage:", uploadErr.message);
    }

    // 2. Save submission to MongoDB
    const submission = await QuestionSubmission.create({
      telegramId: String(telegramId),
      subjectCode,
      subjectName: subjectName || "Subject",
      subjectDate: subjectDate || "",
      imageUrl: uploadedImageUrl,
      status: "pending",
      rewardAmount: 50,
    });

    // 3. Auto-broadcast new question upload to @Qearn_Activities
    broadcastActivity({
      badge: "📝",
      title: "New Question Uploaded",
      description: `A user has submitted a question paper for review!`,
      details: {
        Subject: `${subjectName || "Subject"} (${subjectCode})`,
        "Exam Date": subjectDate || "N/A",
        "User ID": `<code>${telegramId}</code>`,
        Status: "🟡 Pending Review",
      },
    }).catch(console.error);

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
