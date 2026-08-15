import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSubmission from "@/models/QuestionSubmission";

export async function GET(request) {
  try {
    const apiScheduleUrl =
      process.env.API_SCHEDULE_URL ||
      "https://diplomaresultarea.com/api/routine/69d78dafea819cc7524eb9a1";
    const apiSubjectsUrl =
      process.env.API_SUBJECTS_URL ||
      "https://diplomaresultarea.com/api/booklist";

    let scheduleData = null;
    let booklistData = null;

    // 1. Fetch live APIs
    try {
      const [resSchedule, resBooklist] = await Promise.all([
        fetch(apiScheduleUrl, { next: { revalidate: 120 } }),
        fetch(apiSubjectsUrl, { next: { revalidate: 300 } }),
      ]);

      if (resSchedule.ok) scheduleData = await resSchedule.json();
      if (resBooklist.ok) booklistData = await resBooklist.json();
    } catch (apiErr) {
      console.error("External API fetch error:", apiErr);
    }

    // 2. Build Book Map from Booklist API
    const bookMap = new Map();
    if (booklistData?.data && Array.isArray(booklistData.data)) {
      booklistData.data.forEach((course) => {
        const courseName = course.course_name || "Diploma";
        course.departments?.forEach((dept) => {
          const deptName = dept.name || "Engineering";
          dept.regulation?.forEach((reg) => {
            reg.semesters?.forEach((sem) => {
              const semName = sem.semester_name || "";
              sem.subjects?.forEach((sub) => {
                const code = String(sub.subject_code || "").trim();
                const name = sub.subject_name || "Subject";
                if (code && !bookMap.has(code)) {
                  bookMap.set(code, {
                    name,
                    department: deptName,
                    course: courseName,
                    semester: semName,
                  });
                }
              });
            });
          });
        });
      });
    }

    // 3. Build Routine Items
    const masterMergedList = [];
    const seenRoutineCodes = new Set();

    if (scheduleData?.data?.routine && Array.isArray(scheduleData.data.routine)) {
      scheduleData.data.routine.forEach((slot) => {
        const slotDate = slot.date || "N/A";
        const slotTime = slot.time || "";

        slot.codes?.forEach((rawCode) => {
          const code = String(rawCode || "").trim();
          if (!code || seenRoutineCodes.has(code)) return;
          seenRoutineCodes.add(code);

          const bookInfo = bookMap.get(code) || {
            name: `Subject (${code})`,
            department: "Diploma Engineering",
            semester: "",
          };

          masterMergedList.push({
            code,
            date: slotDate,
            time: slotTime,
            name: bookInfo.name,
            department: bookInfo.department,
            semester: bookInfo.semester,
            icon: "📚",
          });
        });
      });
    }

    // 4. Fetch ONLY APPROVED/VERIFIED Questions from MongoDB
    // Pending or Rejected subjects will STILL remain visible in the list!
    await connectDB();
    const verifiedSubmissions = await QuestionSubmission.find(
      { status: "verified" },
      { subjectCode: 1 }
    ).lean();

    const verifiedCodesSet = new Set(
      verifiedSubmissions.map((s) => String(s.subjectCode || "").trim())
    );

    // 5. Exclude ONLY verified/approved subjects!
    const availableList = masterMergedList.filter(
      (item) => !verifiedCodesSet.has(item.code)
    );

    return NextResponse.json({
      success: true,
      title: scheduleData?.data?.title || "Diploma Routine & Subjects",
      totalRoutineSubjects: masterMergedList.length,
      verifiedUploadedCount: verifiedCodesSet.size,
      availableCount: availableList.length,
      subjects: availableList,
    });
  } catch (error) {
    console.error("Master Subjects API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
