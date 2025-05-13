"use client"

import { useEffect } from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import SubjectCard from "@/components/subject-card"

export default function SubjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Updated subjects data to include Digital Marketing and Data Science
  const subjects = [
    {
      id: "mobile-development",
      title: "Mobile Development",
      description: "Test your knowledge of mobile app development frameworks and concepts.",
      icon: "smartphone",
    },
    {
      id: "web-development",
      title: "Web Development",
      description: "Challenge yourself with questions about web technologies and frameworks.",
      icon: "globe",
    },
    {
      id: "graphic-design",
      title: "Graphic Design",
      description: "Evaluate your understanding of design principles and tools.",
      icon: "paintbrush",
    },
    {
      id: "video-editing",
      title: "Video Editing",
      description: "Test your knowledge of video editing techniques and software.",
      icon: "video",
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing",
      description: "Assess your understanding of digital marketing strategies.",
      icon: "megaphone",
    },
    {
      id: "data-science",
      title: "Data Science",
      description: "Test your knowledge of data science and analytics concepts.",
      icon: "bar-chart",
    },
  ]

  if (status === "loading") {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <Heading
        title="Choose a Subject"
        description="Select a subject to test your knowledge"
        className="text-center mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  )
}
