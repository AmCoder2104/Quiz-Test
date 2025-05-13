import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Question from "@/models/Question"
import Test from "@/models/Test"
import { digitalMarketingQuestions } from "./digital-marketing-questions"
import { dataScienceQuestions } from "./data-science-questions"

// This endpoint can be used to seed the database with initial data
export async function GET() {
  try {
    // Connect to the database
    await dbConnect()

    console.log("Connected to database, starting seed process...")

    // Seed Digital Marketing questions
    console.log("Seeding Digital Marketing questions...")

    // First, remove any existing Digital Marketing questions to avoid duplicates
    await Question.deleteMany({ subject: "digital-marketing" })

    // Insert the new questions
    const digitalMarketingResults = await Question.insertMany(digitalMarketingQuestions)
    console.log(`Added ${digitalMarketingResults.length} Digital Marketing questions`)

    // Seed Data Science questions
    console.log("Seeding Data Science questions...")

    // First, remove any existing Data Science questions to avoid duplicates
    await Question.deleteMany({ subject: "data-science" })

    // Insert the new questions
    const dataScienceResults = await Question.insertMany(dataScienceQuestions)
    console.log(`Added ${dataScienceResults.length} Data Science questions`)

    // Create tests for the new subjects if they don't exist
    const digitalMarketingTest = await Test.findOne({ subject: "digital-marketing" })
    if (!digitalMarketingTest) {
      console.log("Creating Digital Marketing test...")
      await Test.create({
        title: "Digital Marketing Assessment",
        description: "Test your knowledge of digital marketing strategies and concepts",
        subject: "digital-marketing",
        timeLimit: 15, // 15 minutes
        passingScore: 70,
        isActive: true,
      })
    }

    const dataScienceTest = await Test.findOne({ subject: "data-science" })
    if (!dataScienceTest) {
      console.log("Creating Data Science test...")
      await Test.create({
        title: "Data Science Assessment",
        description: "Evaluate your understanding of data science and analytics concepts",
        subject: "data-science",
        timeLimit: 15, // 15 minutes
        passingScore: 70,
        isActive: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      details: {
        digitalMarketingQuestions: digitalMarketingResults.length,
        dataScienceQuestions: dataScienceResults.length,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    // Return more detailed error information
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
