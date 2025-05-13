import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Question from "@/models/Question"

export async function POST(request) {
  try {
    // Optional: Check authentication (uncomment if you want to restrict access)
    // const session = await getServerSession(authOptions)
    // if (!session || (session.user.role !== "admin" && session.user.role !== "examiner")) {
    //   return NextResponse.json({ error: "Unauthorized. Admin or examiner access required." }, { status: 403 })
    // }

    // Connect to the database
    await dbConnect()

    // Parse the request body
    const { questions } = await request.json()

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Request must include a non-empty array of questions" }, { status: 400 })
    }

    // Validate each question
    const validQuestions = []
    const invalidQuestions = []

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]

      // Check required fields
      if (!q.question || !q.options || q.correctAnswer === undefined || !q.subject) {
        invalidQuestions.push({
          index: i,
          question: q,
          reason: "Missing required fields",
        })
        continue
      }

      // Validate options array
      if (!Array.isArray(q.options) || q.options.length < 2) {
        invalidQuestions.push({
          index: i,
          question: q,
          reason: "Options must be an array with at least 2 items",
        })
        continue
      }

      // Validate correctAnswer is within range
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        invalidQuestions.push({
          index: i,
          question: q,
          reason: "correctAnswer must be a valid index in the options array",
        })
        continue
      }

      // Question is valid
      validQuestions.push({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: q.subject,
        difficultyLevel: q.difficultyLevel || "medium",
        explanation: q.explanation || "",
        marks: q.marks || 1,
        createdBy: q.createdBy || null,
      })
    }

    // Insert valid questions
    let insertedQuestions = []
    if (validQuestions.length > 0) {
      insertedQuestions = await Question.insertMany(validQuestions)
    }

    // Return results
    return NextResponse.json({
      success: true,
      message: `Added ${insertedQuestions.length} questions successfully`,
      totalSubmitted: questions.length,
      validCount: validQuestions.length,
      invalidCount: invalidQuestions.length,
      invalidQuestions: invalidQuestions.length > 0 ? invalidQuestions : undefined,
    })
  } catch (error) {
    console.error("Error adding questions in bulk:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add questions",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
