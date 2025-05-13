import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/mongoose"
import Test from "@/models/Test"
import Question from "@/models/Question"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has required role
    if (!["admin", "examiner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await dbConnect()

    const data = await req.json()

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Test title is required" }, { status: 400 })
    }

    if (!data.subjects || data.subjects.length === 0) {
      return NextResponse.json({ error: "At least one subject must be selected" }, { status: 400 })
    }

    // Get questions for each subject based on the counts
    const questionsToInclude = []

    for (const subjectId of data.subjects) {
      const count = Number.parseInt(data.questionCounts[subjectId] || 0)

      if (count > 0) {
        // Get random questions from this subject
        const questions = await Question.find({ subject: subjectId }).limit(count).select("_id")

        questionsToInclude.push(...questions.map((q) => q._id))
      }
    }

    if (questionsToInclude.length === 0) {
      return NextResponse.json({ error: "No questions selected" }, { status: 400 })
    }

    // Create the test
    const test = new Test({
      title: data.title,
      description: data.description,
      duration: data.duration,
      totalMarks: data.totalMarks,
      passingMarks: data.passingMarks,
      randomizeQuestions: data.randomizeQuestions,
      negativeMarking: data.negativeMarking,
      allowedAttempts: data.allowedAttempts,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      isActive: data.isActive,
      createdBy: session.user.id,
      questions: questionsToInclude,
    })

    await test.save()

    return NextResponse.json({
      message: "Test created successfully",
      test: {
        id: test._id,
        title: test.title,
      },
    })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get tests with pagination
    const tests = await Test.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean()

    const total = await Test.countDocuments({})

    return NextResponse.json({
      tests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}
