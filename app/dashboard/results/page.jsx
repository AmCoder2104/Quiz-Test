"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Download, Eye, MoreHorizontal, Search, Loader2 } from "lucide-react"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ResultsPage() {
  const { data: session, status } = useSession()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      if (status !== "authenticated") return

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching test results...")
        const response = await fetch("/api/test-attempts")

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log("Received test results:", data)

        // Transform the data to match our component's expected format
        const formattedResults = data.results.map((result) => {
          // Handle different test data structures
          const testTitle =
            typeof result.test === "string" ? formatSubject(result.test) : result.test?.title || "Unknown Test"

          const testSubject = typeof result.test === "string" ? result.test : result.test?.subject || "unknown"

          return {
            id: result.id,
            user: {
              id: result.user?.id || "unknown",
              name: result.user?.name || "Unknown User",
              email: result.user?.email || "unknown@example.com",
            },
            test: {
              id: typeof result.test === "string" ? result.test : result.test?.id || "unknown",
              title: testTitle,
              subject: testSubject,
            },
            score: result.score,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            startTime: result.startTime,
            endTime: result.endTime,
            status: result.status || "completed",
            passed: result.score >= 60, // Assuming 60% is passing
          }
        })

        setResults(formattedResults)
      } catch (error) {
        console.error("Failed to fetch results:", error)
        setError(error.message)
        toast({
          title: "Error fetching results",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchResults()
    }
  }, [session, status])

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.test.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = subjectFilter === "" || result.test.subject === subjectFilter

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "passed" && result.passed) ||
      (statusFilter === "failed" && !result.passed)

    return matchesSearch && matchesSubject && matchesStatus
  })

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      console.error("Error formatting date:", e)
      return "Invalid Date"
    }
  }

  const formatSubject = (subject) => {
    if (!subject) return "Unknown"

    return subject
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A"

    try {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const durationMs = end - start
      const minutes = Math.floor(durationMs / 60000)

      return `${minutes} min`
    } catch (e) {
      console.error("Error calculating duration:", e)
      return "N/A"
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Test Results"
          description={session?.user?.role === "candidate" ? "Your test results" : "View all test results"}
        />
        {(session?.user?.role === "admin" || session?.user?.role === "examiner") && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              <SelectItem value="mobile-development">Mobile Development</SelectItem>
              <SelectItem value="web-development">Web Development</SelectItem>
              <SelectItem value="graphic-design">Graphic Design</SelectItem>
              <SelectItem value="video-editing">Video Editing</SelectItem>
              <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
              <SelectItem value="data-science">Data Science</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {(session?.user?.role === "admin" || session?.user?.role === "examiner") && <TableHead>User</TableHead>}
              <TableHead>Test</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={session?.user?.role === "candidate" ? 7 : 8} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading results...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={session?.user?.role === "candidate" ? 7 : 8} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((result) => (
                <TableRow key={result.id}>
                  {(session?.user?.role === "admin" || session?.user?.role === "examiner") && (
                    <TableCell className="font-medium">{result.user.name}</TableCell>
                  )}
                  <TableCell>{result.test.title}</TableCell>
                  <TableCell>{formatSubject(result.test.subject)}</TableCell>
                  <TableCell>
                    {result.score}% ({result.correctAnswers}/{result.totalQuestions})
                  </TableCell>
                  <TableCell>
                    <Badge className={result.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {result.passed ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(result.endTime)}</TableCell>
                  <TableCell>{calculateDuration(result.startTime, result.endTime)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        {(session?.user?.role === "admin" || session?.user?.role === "examiner") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download report
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
