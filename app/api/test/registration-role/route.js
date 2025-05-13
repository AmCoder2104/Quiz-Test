import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

// This is a utility endpoint to check the role of the most recently registered user
// It should be disabled or removed in production
export async function GET() {
  try {
    await dbConnect()

    // Get the most recently registered user
    const latestUser = await User.findOne().sort({ createdAt: -1 }).limit(1)

    if (!latestUser) {
      return NextResponse.json({ message: "No users found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Latest registered user",
      user: {
        id: latestUser._id.toString(),
        name: latestUser.name,
        email: latestUser.email,
        role: latestUser.role,
        createdAt: latestUser.createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching latest user:", error)
    return NextResponse.json({ error: "Failed to fetch latest user" }, { status: 500 })
  }
}
