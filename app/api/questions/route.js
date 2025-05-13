import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Question from "@/models/Question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// This handles GET requests to /api/questions
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subject = searchParams.get("subject")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sortField = searchParams.get("sortField") || "createdAt"
    const sortDirection = searchParams.get("sortDirection") || "desc"

    // Connect to the database
    await dbConnect()

    // Build query
    const query = subject && subject !== "all" ? { subject } : {}

    // Build sort object
    const sort = {}
    sort[sortField] = sortDirection === "asc" ? 1 : -1

    // Count total questions for pagination
    const total = await Question.countDocuments(query)

    // Fetch questions with pagination and sorting
    const questions = await Question.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform MongoDB _id to string
    const serializedQuestions = questions.map((q) => ({
      ...q,
      id: q._id.toString(),
      _id: q._id.toString(),
    }))

    // Return with pagination metadata
    return NextResponse.json({
      questions: serializedQuestions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch questions from database" }, { status: 500 })
  }
}

// This handles POST requests to /api/questions
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "examiner")) {
      return NextResponse.json({ error: "Unauthorized. Admin or examiner access required." }, { status: 403 })
    }

    // Connect to the database
    await dbConnect()

    // Parse the request body
    const questionData = await request.json()

    // Validate required fields
    if (
      !questionData.question ||
      !questionData.options ||
      questionData.correctAnswer === undefined ||
      !questionData.subject
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          requiredFields: ["question", "options", "correctAnswer", "subject"],
        },
        { status: 400 },
      )
    }

    // Validate options array
    if (!Array.isArray(questionData.options) || questionData.options.length < 2) {
      return NextResponse.json({ error: "Options must be an array with at least 2 items" }, { status: 400 })
    }

    // Validate correctAnswer is within range
    if (questionData.correctAnswer < 0 || questionData.correctAnswer >= questionData.options.length) {
      return NextResponse.json({ error: "correctAnswer must be a valid index in the options array" }, { status: 400 })
    }

    // Create the new question
    const newQuestion = new Question({
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      subject: questionData.subject,
      difficultyLevel: questionData.difficultyLevel || "medium",
      explanation: questionData.explanation || "",
      marks: questionData.marks || 1,
      createdBy: session.user.id,
    })

    // Save the question to the database
    await newQuestion.save()

    // Return the created question
    return NextResponse.json({
      success: true,
      message: "Question added successfully",
      question: {
        id: newQuestion._id.toString(),
        question: newQuestion.question,
        subject: newQuestion.subject,
        difficultyLevel: newQuestion.difficultyLevel,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        explanation: newQuestion.explanation,
        marks: newQuestion.marks,
        createdBy: newQuestion.createdBy,
        createdAt: newQuestion.createdAt,
      },
    })
  } catch (error) {
    console.error("Error adding question:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add question",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
