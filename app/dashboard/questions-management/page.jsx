"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Check, Plus, Search, Trash, Edit, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QuestionsManagementPage() {
  const { data: session } = useSession()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [questionsPerPage] = useState(10)
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const emptyQuestion = {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    subject: "",
    difficultyLevel: "medium",
    explanation: "",
    marks: 1,
  }

  const [newQuestion, setNewQuestion] = useState(emptyQuestion)

  useEffect(() => {
    fetchQuestions()
  }, [subjectFilter, currentPage, sortField, sortDirection])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      // Build the API URL with query parameters
      let url = `/api/questions?page=${currentPage}&limit=${questionsPerPage}&sortField=${sortField}&sortDirection=${sortDirection}`

      if (subjectFilter && subjectFilter !== "all") {
        url += `&subject=${subjectFilter}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching questions: ${response.statusText}`)
      }

      const data = await response.json()

      setQuestions(data.questions || [])
      setTotalQuestions(data.pagination.total)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching questions:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to load questions: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    // Validate form
    if (!newQuestion.question || !newQuestion.subject || newQuestion.options.some((option) => !option)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuestion),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add question")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: data.message || "Question added successfully",
      })

      // Reset form and close dialog
      setNewQuestion(emptyQuestion)
      setIsAddDialogOpen(false)

      // Refresh the questions list
      fetchQuestions()
    } catch (error) {
      console.error("Error adding question:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to add question: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return

    // Validate form
    if (!selectedQuestion.question || !selectedQuestion.subject || selectedQuestion.options.some((option) => !option)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/questions/${selectedQuestion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedQuestion),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update question")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: data.message || "Question updated successfully",
      })

      setIsEditDialogOpen(false)

      // Refresh the questions list
      fetchQuestions()
    } catch (error) {
      console.error("Error updating question:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to update question: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/questions/${selectedQuestion.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete question")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: data.message || "Question deleted successfully",
      })

      setIsDeleteDialogOpen(false)

      // Refresh the questions list
      fetchQuestions()
    } catch (error) {
      console.error("Error deleting question:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Failed to delete question: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionChange = (index, value, isEdit = false) => {
    if (isEdit) {
      const newOptions = [...selectedQuestion.options]
      newOptions[index] = value
      setSelectedQuestion({ ...selectedQuestion, options: newOptions })
    } else {
      const newOptions = [...newQuestion.options]
      newOptions[index] = value
      setNewQuestion({ ...newQuestion, options: newOptions })
    }
  }

  const formatSubject = (subject) => {
    return subject
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredQuestions = questions.filter((question) => {
    return question.question.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Heading title="Questions Management" description="Add, edit, and manage questions for tests" />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Question List</TabsTrigger>
          <TabsTrigger value="add">Add Question</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-auto">
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
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("question")}>
                    Question {renderSortIcon("question")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("subject")}>
                    Subject {renderSortIcon("subject")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("difficultyLevel")}>
                    Difficulty {renderSortIcon("difficultyLevel")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("successRate")}>
                    Success Rate {renderSortIcon("successRate")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Loading questions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No questions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium max-w-[300px] truncate">{question.question}</TableCell>
                      <TableCell>{formatSubject(question.subject)}</TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(question.difficultyLevel)}>
                          {question.difficultyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {question.successRate !== undefined
                          ? `${question.successRate}% (${question.totalAttempts || 0} attempts)`
                          : "No attempts yet"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredQuestions.length} of {totalQuestions} questions
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>
                Create a new question for tests. Questions will be automatically available for tests in the selected
                subject.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <Label>Options</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <RadioGroup
                      value={newQuestion.correctAnswer.toString()}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, correctAnswer: Number.parseInt(value) })
                      }
                      className="flex items-center"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    </RadioGroup>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">Select the radio button next to the correct answer.</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={newQuestion.subject}
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, subject: value })}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="graphic-design">Graphic Design</SelectItem>
                      <SelectItem value="video-editing">Video Editing</SelectItem>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                  <Select
                    value={newQuestion.difficultyLevel}
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, difficultyLevel: value })}
                  >
                    <SelectTrigger id="difficultyLevel">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain the correct answer"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number.parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setNewQuestion(emptyQuestion)} disabled={isSubmitting}>
                Reset
              </Button>
              <Button onClick={handleAddQuestion} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Add Question
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question details. This will affect all tests that use this question.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-question">Question</Label>
                <Textarea
                  id="edit-question"
                  placeholder="Enter your question"
                  value={selectedQuestion.question}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, question: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <Label>Options</Label>
                {selectedQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <RadioGroup
                      value={selectedQuestion.correctAnswer.toString()}
                      onValueChange={(value) =>
                        setSelectedQuestion({ ...selectedQuestion, correctAnswer: Number.parseInt(value) })
                      }
                      className="flex items-center"
                    >
                      <RadioGroupItem value={index.toString()} id={`edit-option-${index}`} />
                    </RadioGroup>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value, true)}
                      className="flex-1"
                    />
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">Select the radio button next to the correct answer.</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-subject">Subject</Label>
                  <Select
                    value={selectedQuestion.subject}
                    onValueChange={(value) => setSelectedQuestion({ ...selectedQuestion, subject: value })}
                  >
                    <SelectTrigger id="edit-subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="graphic-design">Graphic Design</SelectItem>
                      <SelectItem value="video-editing">Video Editing</SelectItem>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-difficultyLevel">Difficulty Level</Label>
                  <Select
                    value={selectedQuestion.difficultyLevel}
                    onValueChange={(value) => setSelectedQuestion({ ...selectedQuestion, difficultyLevel: value })}
                  >
                    <SelectTrigger id="edit-difficultyLevel">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-explanation">Explanation (Optional)</Label>
                <Textarea
                  id="edit-explanation"
                  placeholder="Explain the correct answer"
                  value={selectedQuestion.explanation}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, explanation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-marks">Marks</Label>
                <Input
                  id="edit-marks"
                  type="number"
                  min="1"
                  value={selectedQuestion.marks}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, marks: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditQuestion} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="py-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <p className="font-medium">{selectedQuestion.question}</p>
                <div className="mt-2 flex items-center">
                  <Badge className={getDifficultyColor(selectedQuestion.difficultyLevel)}>
                    {selectedQuestion.difficultyLevel}
                  </Badge>
                  <span className="ml-2 text-sm text-gray-500">{formatSubject(selectedQuestion.subject)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center text-amber-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="text-sm">This will remove the question from all tests that use it.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Question
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
