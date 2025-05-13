import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  const path = request.nextUrl.pathname

  // Define protected paths
  const protectedPaths = ["/dashboard", "/quiz"]
  const isProtectedPath = protectedPaths.some((prefix) => path.startsWith(prefix))

  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // If user is not authenticated, redirect to login
    if (!token) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // If user is not an admin and trying to access dashboard
    if (path.startsWith("/dashboard") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/quiz/:path*"],
}

export function middleware2(request) {
  // Get the response from the existing middleware chain
  const response = NextResponse.next()

  // Add CORS headers if needed
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return response
}

export const config2 = {
  matcher: ["/api/:path*"],
}
