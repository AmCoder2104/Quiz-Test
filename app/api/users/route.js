import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access user data
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("search") || ""
    const roleFilter = searchParams.get("role") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Connect to database
    await connectToDatabase()

    // Build query based on search term and role filter
    const query = {}

    if (searchTerm) {
      query.$or = [{ name: { $regex: searchTerm, $options: "i" } }, { email: { $regex: searchTerm, $options: "i" } }]
    }

    if (roleFilter && roleFilter !== "all") {
      query.role = roleFilter
    }

    // Get total count for pagination
    const db = (await connectToDatabase()).db
    const total = await db.collection("users").countDocuments(query)

    // Fetch users with pagination
    const users = await db
      .collection("users")
      .find(query)
      .project({
        password: 0, // Exclude password field
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
