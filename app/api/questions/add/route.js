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
    const questionData = await request.json()

    // Validate required fields
    if (
      !questionData.question ||
      !questionData.options ||
      !questionData.correctAnswer === undefined ||
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
      createdBy: questionData.createdBy || null,
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
