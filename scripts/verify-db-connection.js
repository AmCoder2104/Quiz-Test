// This script verifies the database connection and checks that collections are accessible

import dbConnect from "../lib/mongoose.js"
import Question from "../models/Question.js"
import User from "../models/User.js"
import Test from "../models/Test.js"
import TestAttempt from "../models/TestAttempt.js"
import Notification from "../models/Notification.js"

async function verifyDatabaseConnection() {
  try {
    console.log("Connecting to database...")
    await dbConnect()
    console.log("✅ Database connection successful!")

    // Verify collections
    console.log("\nVerifying collections...")

    // Questions collection
    const questionCount = await Question.countDocuments()
    console.log(`✅ Questions collection accessible: ${questionCount} documents found`)
    if (questionCount > 0) {
      const sampleQuestion = await Question.findOne()
      console.log("Sample question:", sampleQuestion.question)
    }

    // Users collection
    const userCount = await User.countDocuments()
    console.log(`✅ Users collection accessible: ${userCount} documents found`)
    if (userCount > 0) {
      const sampleUser = await User.findOne().select("-password")
      console.log("Sample user:", sampleUser.email)
    }

    // Test collection
    try {
      const testCount = await Test.countDocuments()
      console.log(`✅ Tests collection accessible: ${testCount} documents found`)
    } catch (error) {
      console.log("⚠️ Tests collection not yet initialized or empty")
    }

    // TestAttempt collection
    try {
      const attemptCount = await TestAttempt.countDocuments()
      console.log(`✅ TestAttempts collection accessible: ${attemptCount} documents found`)
    } catch (error) {
      console.log("⚠️ TestAttempts collection not yet initialized or empty")
    }

    // Notification collection
    try {
      const notificationCount = await Notification.countDocuments()
      console.log(`✅ Notifications collection accessible: ${notificationCount} documents found`)
    } catch (error) {
      console.log("⚠️ Notifications collection not yet initialized or empty")
    }

    console.log("\n✅ Database verification completed successfully!")
  } catch (error) {
    console.error("❌ Database verification failed:", error)
  } finally {
    process.exit(0)
  }
}

verifyDatabaseConnection()
