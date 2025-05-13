"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

export function DebugSession() {
  const { data: session, status, update } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshSession = async () => {
    setIsRefreshing(true)
    await update()
    setIsRefreshing(false)
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Session Debug</h2>

      <div className="mb-4">
        <p className="font-medium">
          Status: <span className="font-normal">{status}</span>
        </p>
      </div>

      {session ? (
        <div className="space-y-2">
          <p className="font-medium">
            User ID: <span className="font-normal">{session.user.id}</span>
          </p>
          <p className="font-medium">
            Name: <span className="font-normal">{session.user.name}</span>
          </p>
          <p className="font-medium">
            Email: <span className="font-normal">{session.user.email}</span>
          </p>
          <p className="font-medium">
            Role: <span className="font-normal">{session.user.role}</span>
          </p>
        </div>
      ) : (
        <p>No session data available</p>
      )}

      <button
        onClick={refreshSession}
        disabled={isRefreshing}
        className="mt-4 px-4 py-2 bg-[#0536E5] text-white rounded-md hover:bg-[#0536E5]/90 disabled:opacity-50"
      >
        {isRefreshing ? "Refreshing..." : "Refresh Session"}
      </button>
    </div>
  )
}
