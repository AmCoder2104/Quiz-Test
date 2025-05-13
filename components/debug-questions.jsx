"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DebugQuestions() {
  const [subject, setSubject] = useState("mobile-development")
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/questions?subject=${subject}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setQuestions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Debug Questions API</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile-development">Mobile Development</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="graphic-design">Graphic Design</SelectItem>
                <SelectItem value="video-editing">Video Editing</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchQuestions} disabled={loading}>
              {loading ? "Loading..." : "Fetch Questions"}
            </Button>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">Error: {error}</div>}

          <div className="mt-4">
            <h3 className="font-medium mb-2">Results ({questions.length} questions):</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[400px] text-sm">
              {JSON.stringify(questions, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
