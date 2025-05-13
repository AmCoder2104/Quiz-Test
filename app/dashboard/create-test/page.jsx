"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Check, Plus, Minus, Clock, HelpCircle, AlertCircle, Loader2 } from "lucide-react"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreateTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [questionCounts, setQuestionCounts] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    subjects: [],
    randomizeQuestions: true,
    negativeMarking: {
      enabled: false,
      value: 0,
    },
    allowedAttempts: 1,
    startTime: "",
    endTime: "",
    isActive: true,
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setLoadingSubjects(true)
    setError(null)
    try {
      const response = await fetch("/api/subjects/stats")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", response.status, errorText)
        throw new Error(`Error fetching subjects: ${response.statusText || "Failed to fetch"}`)
      }

      const data = await response.json()
      console.log("Fetched subjects:", data)
      setSubjects(data || [])

      // Initialize question counts
      const counts = {}
      data.forEach((subject) => {
        counts[subject.id] = 0
      })
      setQuestionCounts(counts)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to load subjects: ${error.message}`,
        variant: "destructive",
      })

      // Fallback to mock data for development
      const mockSubjects = [
        { id: "mobile-development", name: "Mobile Development", count: 25 },
        { id: "web-development", name: "Web Development", count: 32 },
        { id: "graphic-design", name: "Graphic Design", count: 18 },
        { id: "video-editing", name: "Video Editing", count: 15 },
        { id: "digital-marketing", name: "Digital Marketing", count: 10 },
        { id: "data-science", name: "Data Science", count: 10 },
      ]
      setSubjects(mockSubjects)

      // Initialize question counts with mock data
      const counts = {}
      mockSubjects.forEach((subject) => {
        counts[subject.id] = 0
      })
      setQuestionCounts(counts)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleSubjectSelection = (subjectId) => {
    const currentSubjects = [...testData.subjects]
    const index = currentSubjects.indexOf(subjectId)

    if (index === -1) {
      // Add subject
      currentSubjects.push(subjectId)
    } else {
      // Remove subject
      currentSubjects.splice(index, 1)
    }

    setTestData({ ...testData, subjects: currentSubjects })
  }

  const handleQuestionCountChange = (subjectId, count) => {
    setQuestionCounts({
      ...questionCounts,
      [subjectId]: count,
    })
  }

  const getTotalQuestions = () => {
    return Object.values(questionCounts).reduce((sum, count) => sum + Number.parseInt(count || 0), 0)
  }

  const calculateTotalMarks = () => {
    // For simplicity, we'll assume each question is worth 1 mark
    return getTotalQuestions()
  }

  const handleCreateTest = async () => {
    // Validate form
    if (!testData.title) {
      toast({
        title: "Validation Error",
        description: "Please provide a test title.",
        variant: "destructive",
      })
      return
    }

    if (testData.subjects.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one subject.",
        variant: "destructive",
      })
      return
    }

    if (getTotalQuestions() === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one question for each selected subject.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Submitting test data:", {
        ...testData,
        questionCounts,
        totalMarks: calculateTotalMarks(),
      })

      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testData,
          questionCounts,
          totalMarks: calculateTotalMarks(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create test")
      }

      const data = await response.json()
      console.log("Test created:", data)

      toast({
        title: "Success",
        description: data.message || "Test created successfully",
      })

      // Redirect to tests page
      router.push("/dashboard/tests")
    } catch (error) {
      console.error("Error creating test:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to create test: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Heading title="Create Test" description="Create a new test for students to take" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
              <CardDescription>Provide basic information about the test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  placeholder="Enter test title"
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter test description"
                  value={testData.description}
                  onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Badge variant="outline" className="ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {testData.duration} min
                    </Badge>
                  </div>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="180"
                    value={testData.duration}
                    onChange={(e) => setTestData({ ...testData, duration: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passingMarks">Passing Percentage</Label>
                    <Badge variant="outline" className="ml-2">
                      {testData.passingMarks}%
                    </Badge>
                  </div>
                  <Slider
                    id="passingMarks"
                    min={0}
                    max={100}
                    step={5}
                    value={[testData.passingMarks]}
                    onValueChange={(value) => setTestData({ ...testData, passingMarks: value[0] })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowedAttempts">Allowed Attempts</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set to 0 for unlimited attempts</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="allowedAttempts"
                  type="number"
                  min="0"
                  max="10"
                  value={testData.allowedAttempts}
                  onChange={(e) => setTestData({ ...testData, allowedAttempts: Number.parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Set to 0 for unlimited attempts</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => document.querySelector('[data-value="questions"]').click()}>
                Next: Select Questions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Questions</CardTitle>
              <CardDescription>Choose subjects and specify the number of questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSubjects ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <span>Loading subjects...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label>Available Subjects</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map((subject) => (
                      <Card
                        key={subject.id}
                        className={`cursor-pointer transition-all ${
                          testData.subjects.includes(subject.id) ? "border-primary" : ""
                        }`}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            <Switch
                              checked={testData.subjects.includes(subject.id)}
                              onCheckedChange={() => handleSubjectSelection(subject.id)}
                            />
                          </div>
                          <CardDescription>{subject.count} questions available</CardDescription>
                        </CardHeader>
                        {testData.subjects.includes(subject.id) && (
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleQuestionCountChange(subject.id, Math.max(0, questionCounts[subject.id] - 1))
                                  }
                                  disabled={questionCounts[subject.id] <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="mx-3 min-w-[2rem] text-center">{questionCounts[subject.id]}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleQuestionCountChange(
                                      subject.id,
                                      Math.min(subject.count, questionCounts[subject.id] + 1),
                                    )
                                  }
                                  disabled={questionCounts[subject.id] >= subject.count}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Badge variant="outline">
                                {questionCounts[subject.id]} / {subject.count}
                              </Badge>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Test Summary</h3>
                    <p className="text-sm text-muted-foreground">Selected questions and marks</p>
                  </div>
                  <Badge className="text-lg px-3 py-1">{getTotalQuestions()} Questions</Badge>
                </div>

                <div className="mt-4 space-y-2">
                  {testData.subjects.map((subjectId) => {
                    const subject = subjects.find((s) => s.id === subjectId)
                    if (!subject) return null

                    return (
                      <div key={subjectId} className="flex items-center justify-between text-sm">
                        <span>{subject.name}</span>
                        <span>{questionCounts[subjectId]} questions</span>
                      </div>
                    )
                  })}

                  <div className="pt-2 mt-2 border-t flex items-center justify-between font-medium">
                    <span>Total Marks</span>
                    <span>{calculateTotalMarks()} marks</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => document.querySelector('[data-value="basic"]').click()}>
                Back
              </Button>
              <Button onClick={() => document.querySelector('[data-value="settings"]').click()}>
                Next: Test Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Settings</CardTitle>
              <CardDescription>Configure additional test settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="randomize">Randomize Questions</Label>
                  <p className="text-sm text-muted-foreground">Shuffle questions for each student</p>
                </div>
                <Switch
                  id="randomize"
                  checked={testData.randomizeQuestions}
                  onCheckedChange={(checked) => setTestData({ ...testData, randomizeQuestions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="negative-marking">Negative Marking</Label>
                  <p className="text-sm text-muted-foreground">Deduct marks for incorrect answers</p>
                </div>
                <Switch
                  id="negative-marking"
                  checked={testData.negativeMarking.enabled}
                  onCheckedChange={(checked) =>
                    setTestData({
                      ...testData,
                      negativeMarking: {
                        ...testData.negativeMarking,
                        enabled: checked,
                      },
                    })
                  }
                />
              </div>

              {testData.negativeMarking.enabled && (
                <div className="pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="negative-value">Deduction Value</Label>
                      <Badge variant="outline">{testData.negativeMarking.value} marks</Badge>
                    </div>
                    <Slider
                      id="negative-value"
                      min={0}
                      max={1}
                      step={0.25}
                      value={[testData.negativeMarking.value]}
                      onValueChange={(value) =>
                        setTestData({
                          ...testData,
                          negativeMarking: {
                            ...testData.negativeMarking,
                            value: value[0],
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Amount of marks to deduct for each incorrect answer</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Test Status</Label>
                    <p className="text-sm text-muted-foreground">Make test available to students</p>
                  </div>
                  <Switch
                    id="active"
                    checked={testData.isActive}
                    onCheckedChange={(checked) => setTestData({ ...testData, isActive: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time (Optional)</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={testData.startTime}
                      onChange={(e) => setTestData({ ...testData, startTime: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">When the test becomes available</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time (Optional)</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={testData.endTime}
                      onChange={(e) => setTestData({ ...testData, endTime: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">When the test becomes unavailable</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => document.querySelector('[data-value="questions"]').click()}>
                Back
              </Button>
              <Button onClick={handleCreateTest} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Test
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {getTotalQuestions() === 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">No questions selected</h4>
                <p className="text-sm">Please select at least one question from the available subjects.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
