import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Question from "@/models/Question"

export async function GET() {
  try {
    // Connect to the database
    await dbConnect()

    // Define the subjects we want to count
    const subjects = [
      { id: "mobile-development", name: "Mobile Development" },
      { id: "web-development", name: "Web Development" },
      { id: "graphic-design", name: "Graphic Design" },
      { id: "video-editing", name: "Video Editing" },
    ]

    // Get counts for each subject
    const subjectStats = await Promise.all(
      subjects.map(async (subject) => {
        const count = await Question.countDocuments({ subject: subject.id })
        return {
          ...subject,
          count,
        }
      }),
    )

    return NextResponse.json(subjectStats)
  } catch (error) {
    console.error("Error fetching subject stats:", error)
    return NextResponse.json({ error: "Failed to fetch subject statistics" }, { status: 500 })
  }
}
