"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, LogOut, User } from "lucide-react"

export function UserMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
  }

  if (status === "loading") {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Link
          href="/auth/login"
          className="px-4 py-2 border border-[#0536E5] text-[#0536E5] rounded-lg hover:bg-[#0536E5]/5 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 bg-[#0536E5] text-white rounded-lg hover:bg-[#0536E5]/90 transition-colors"
        >
          Register
        </Link>
      </div>
    )
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 focus:outline-none">
        <div className="h-10 w-10 rounded-full bg-[#0536E5] text-white flex items-center justify-center font-medium">
          {session.user.image ? (
            <img
              src={session.user.image || "/placeholder.svg"}
              alt={session.user.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            getInitials(session.user.name || "User")
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-gray-800">{session.user.name}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            <p className="text-xs font-medium text-[#0536E5] mt-1">Role: {session.user.role}</p>
          </div>

          {session.user.role === "admin" && (
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          )}

          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
