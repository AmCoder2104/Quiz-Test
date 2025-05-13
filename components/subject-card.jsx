"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Globe, Paintbrush, Video, BarChart, Megaphone, ArrowRight } from "lucide-react"

export default function SubjectCard({ subject }) {
  const router = useRouter()

  // Map of subject IDs to their respective icons
  const iconMap = {
    "mobile-development": Smartphone,
    "web-development": Globe,
    "graphic-design": Paintbrush,
    "video-editing": Video,
    "digital-marketing": Megaphone,
    "data-science": BarChart,
  }

  // Get the icon component for this subject
  const IconComponent = iconMap[subject.id] || Globe

  const handleStartTest = () => {
    router.push(`/test/${subject.id}`)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-bold">{subject.title}</h3>
        <p className="text-muted-foreground">{subject.description}</p>
      </CardContent>
      <CardFooter className="bg-muted/50 p-6">
        <Button onClick={handleStartTest} className="w-full">
          Start Test
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
