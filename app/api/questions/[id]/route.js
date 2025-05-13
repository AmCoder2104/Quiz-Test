import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Question from "@/models/Question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// This handles GET requests to /api/questions/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params

    // Connect to the database
    await dbConnect()

    // Find the question
    const question = await Question.findById(id).lean()

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Transform MongoDB _id to string
    const serializedQuestion = {
      ...question,
      id: question._id.toString(),
      _id: question._id.toString(),
    }

    return NextResponse.json(serializedQuestion)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch question from database" }, { status: 500 })
  }
}

// This handles PUT requests to /api/questions/[id]
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "examiner")) {
      return NextResponse.json({ error: "Unauthorized. Admin or examiner access required." }, { status: 403 })
    }

    const { id } = params

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

    // Find and update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        subject: questionData.subject,
        difficultyLevel: questionData.difficultyLevel || "medium",
        explanation: questionData.explanation || "",
        marks: questionData.marks || 1,
      },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Transform MongoDB _id to string
    const serializedQuestion = {
      ...updatedQuestion,
      id: updatedQuestion._id.toString(),
      _id: updatedQuestion._id.toString(),
    }

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
      question: serializedQuestion,
    })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update question",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// This handles DELETE requests to /api/questions/[id]
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "examiner")) {
      return NextResponse.json({ error: "Unauthorized. Admin or examiner access required." }, { status: 403 })
    }

    const { id } = params

    // Connect to the database
    await dbConnect()

    // Find and delete the question
    const deletedQuestion = await Question.findByIdAndDelete(id)

    if (!deletedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete question",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
