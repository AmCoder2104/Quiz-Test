import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log("Received test attempt data:", data)

    // Validate required fields
    if (!data.testId || data.score === undefined || !data.totalQuestions || data.correctAnswers === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          received: {
            testId: !!data.testId,
            score: data.score !== undefined,
            totalQuestions: !!data.totalQuestions,
            correctAnswers: data.correctAnswers !== undefined,
          },
        },
        { status: 400 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Create test attempt record
    const testAttempt = {
      test: data.testId,
      user: new ObjectId(session.user.id),
      score: data.score,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      answers: data.answers || [],
      startTime: data.startTime ? new Date(data.startTime) : new Date(),
      endTime: new Date(),
      status: "completed",
      ipAddress: data.ipAddress || "",
      device: data.device || "",
      browser: data.browser || "",
    }

    console.log("Saving test attempt:", testAttempt)

    // Insert directly into the collection
    const result = await db.collection("testattempts").insertOne(testAttempt)

    console.log("Test attempt saved with ID:", result.insertedId)

    return NextResponse.json({
      success: true,
      message: "Test result saved successfully",
      testAttemptId: result.insertedId,
    })
  } catch (error) {
    console.error("Error saving test result:", error)
    return NextResponse.json(
      {
        error: "Failed to save test result",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const testId = searchParams.get("testId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Connect to database
    const { db } = await connectToDatabase()

    // Build query based on role and parameters
    const query = {}

    // If user is a candidate, they can only see their own results
    if (session.user.role === "candidate") {
      query.user = new ObjectId(session.user.id)
    } else if (userId) {
      // Admins and examiners can filter by user
      query.user = new ObjectId(userId)
    }

    // Filter by test if provided
    if (testId) {
      query.test = testId
    }

    console.log("Fetching test attempts with query:", query)

    // Get total count for pagination
    const total = await db.collection("testattempts").countDocuments(query)

    // Fetch test attempts with pagination
    const testAttempts = await db
      .collection("testattempts")
      .find(query)
      .sort({ endTime: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Populate user information
    const userIds = testAttempts.map((attempt) => attempt.user)
    const users =
      userIds.length > 0
        ? await db
            .collection("users")
            .find({ _id: { $in: userIds } })
            .toArray()
        : []

    const userMap = {}
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        name: user.name,
        email: user.email,
      }
    })

    // Format the results
    const formattedResults = testAttempts.map((attempt) => {
      const userId = attempt.user.toString()
      return {
        id: attempt._id.toString(),
        test: attempt.test,
        user: {
          id: userId,
          name: userMap[userId]?.name || "Unknown User",
          email: userMap[userId]?.email || "unknown@example.com",
        },
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        status: attempt.status,
        passed: attempt.score >= 60, // Assuming 60% is passing
      }
    })

    console.log(`Found ${formattedResults.length} test attempts`)

    return NextResponse.json({
      results: formattedResults,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching test results:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch test results",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
