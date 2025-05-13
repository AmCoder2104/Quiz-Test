"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Check, ClipboardEdit, Eye, MoreHorizontal, Plus, Search, Trash } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function QuestionsPage() {
  const { data: session } = useSession()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    subject: "",
    difficultyLevel: "medium",
    explanation: "",
  })

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll use mock data
    const mockQuestions = [
      {
        id: 1,
        question: "Which of the following is NOT a mobile app development framework?",
        options: ["React Native", "Flutter", "Django", "Xamarin"],
        correctAnswer: 2,
        subject: "mobile-development",
        difficultyLevel: "medium",
        successRate: 65,
        totalAttempts: 120,
        createdBy: "John Doe",
        createdAt: "2023-05-10T10:30:00Z",
      },
      {
        id: 2,
        question: "What programming language is primarily used for iOS development?",
        options: ["Java", "Swift", "Kotlin", "C#"],
        correctAnswer: 1,
        subject: "mobile-development",
        difficultyLevel: "easy",
        successRate: 78,
        totalAttempts: 150,
        createdBy: "Jane Smith",
        createdAt: "2023-05-12T14:20:00Z",
      },
      {
        id: 3,
        question: "Which of the following is a JavaScript framework?",
        options: ["Django", "Flask", "Ruby on Rails", "Vue.js"],
        correctAnswer: 3,
        subject: "web-development",
        difficultyLevel: "easy",
        successRate: 82,
        totalAttempts: 200,
        createdBy: "Eva Wilson",
        createdAt: "2023-05-08T09:15:00Z",
      },
      {
        id: 4,
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
        correctAnswer: 2,
        subject: "web-development",
        difficultyLevel: "easy",
        successRate: 90,
        totalAttempts: 180,
        createdBy: "John Doe",
        createdAt: "2023-05-15T11:10:00Z",
      },
      {
        id: 5,
        question: "Which color model is used for digital design?",
        options: ["CMYK", "RGB", "HSL", "Both B and C"],
        correctAnswer: 3,
        subject: "graphic-design",
        difficultyLevel: "medium",
        successRate: 60,
        totalAttempts: 90,
        createdBy: "Alice Brown",
        createdAt: "2023-05-14T13:25:00Z",
      },
    ]

    setQuestions(mockQuestions)
    setLoading(false)
  }, [])

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "" || question.subject === subjectFilter

    return matchesSearch && matchesSubject
  })

  const handleCreateQuestion = () => {
    // Validate form
    if (!newQuestion.question || !newQuestion.subject || newQuestion.options.some((option) => !option)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // In a real application, you would call your API to create the question
    // For now, we'll just update the local state
    const createdQuestion = {
      id: questions.length + 1,
      ...newQuestion,
      successRate: 0,
      totalAttempts: 0,
      createdBy: session?.user?.name || "Unknown",
      createdAt: new Date().toISOString(),
    }

    setQuestions([...questions, createdQuestion])

    toast({
      title: "Question created",
      description: "The question has been created successfully.",
    })

    // Reset form and close dialog
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      subject: "",
      difficultyLevel: "medium",
      explanation: "",
    })
    setIsCreateDialogOpen(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Question Management" description="Create and manage questions" />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Question
        </Button>
      </div>

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
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No questions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">{question.question}</TableCell>
                  <TableCell>{formatSubject(question.subject)}</TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficultyLevel)}>{question.difficultyLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    {question.successRate}% ({question.totalAttempts} attempts)
                  </TableCell>
                  <TableCell>{formatDate(question.createdAt)}</TableCell>
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
                        <DropdownMenuItem>
                          <ClipboardEdit className="mr-2 h-4 w-4" />
                          Edit question
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete question
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Create a new question for tests. Questions will be automatically available for tests in the selected
              subject.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: Number.parseInt(value) })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuestion}>
              <Check className="mr-2 h-4 w-4" />
              Create Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
