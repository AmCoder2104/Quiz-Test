"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { BarChart, Users, BookOpen, Award } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()

  // Mock data for dashboard
  const stats = [
    { title: "Total Quizzes", value: "24", icon: BookOpen, color: "bg-blue-500" },
    { title: "Quizzes Completed", value: "12", icon: Award, color: "bg-green-500" },
    { title: "Average Score", value: "78%", icon: BarChart, color: "bg-yellow-500" },
    { title: "Total Users", value: "156", icon: Users, color: "bg-purple-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {session?.user?.name}</span>
              <span className="px-2 py-1 bg-[#0536E5] text-white text-xs rounded-full">{session?.user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg text-white mr-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-[#0536E5]/10 flex items-center justify-center mr-4">
                    <BookOpen className="h-5 w-5 text-[#0536E5]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed Web Development Quiz</p>
                    <p className="text-xs text-gray-500">Score: 85%</p>
                  </div>
                  <div className="text-xs text-gray-500">2 days ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Quizzes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Available Quizzes</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Web Development",
                "Mobile Development",
                "Graphic Design",
                "Video Editing",
                "SEO",
                "Digital Marketing",
              ].map((quiz, index) => (
                <Link
                  key={index}
                  href={`/quiz?course=${quiz.toLowerCase().replace(" ", "-")}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-[#0536E5] hover:shadow-md transition-all"
                >
                  <h3 className="font-medium text-gray-900">{quiz}</h3>
                  <p className="text-sm text-gray-500 mt-1">10 questions • 15 minutes</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
