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

export default function TestsPage() {
  const { data: session } = useSession()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    subject: "",
    duration: 30,
    passingMarks: 40,
    totalMarks: 100,
  })

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll use mock data
    const mockTests = [
      {
        id: 1,
        title: "Mobile Development Basics",
        subject: "mobile-development",
        description: "Test your knowledge of mobile app development fundamentals",
        duration: 30,
        totalMarks: 100,
        passingMarks: 40,
        questionCount: 15,
        isActive: true,
        createdBy: "John Doe",
        createdAt: "2023-05-10T10:30:00Z",
      },
      {
        id: 2,
        title: "Advanced Web Development",
        subject: "web-development",
        description: "Test your knowledge of advanced web development concepts",
        duration: 45,
        totalMarks: 100,
        passingMarks: 60,
        questionCount: 20,
        isActive: true,
        createdBy: "Jane Smith",
        createdAt: "2023-05-12T14:20:00Z",
      },
      {
        id: 3,
        title: "Graphic Design Principles",
        subject: "graphic-design",
        description: "Test your understanding of graphic design principles",
        duration: 25,
        totalMarks: 80,
        passingMarks: 50,
        questionCount: 12,
        isActive: false,
        createdBy: "Eva Wilson",
        createdAt: "2023-05-08T09:15:00Z",
      },
      {
        id: 4,
        title: "Video Editing Techniques",
        subject: "video-editing",
        description: "Test your knowledge of video editing techniques",
        duration: 40,
        totalMarks: 100,
        passingMarks: 45,
        questionCount: 18,
        isActive: true,
        createdBy: "John Doe",
        createdAt: "2023-05-15T11:10:00Z",
      },
    ]

    setTests(mockTests)
    setLoading(false)
  }, [])

  const filteredTests = tests.filter((test) => {
    return (
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleCreateTest = () => {
    // Validate form
    if (!newTest.title || !newTest.subject || !newTest.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // In a real application, you would call your API to create the test
    // For now, we'll just update the local state
    const createdTest = {
      id: tests.length + 1,
      ...newTest,
      questionCount: 0,
      isActive: true,
      createdBy: session?.user?.name || "Unknown",
      createdAt: new Date().toISOString(),
    }

    setTests([...tests, createdTest])

    toast({
      title: "Test created",
      description: `${newTest.title} has been created successfully.`,
    })

    // Reset form and close dialog
    setNewTest({
      title: "",
      description: "",
      subject: "",
      duration: 30,
      passingMarks: 40,
      totalMarks: 100,
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
        <Heading title="Test Management" description="Create and manage tests" />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{formatSubject(test.subject)}</TableCell>
                  <TableCell>{test.duration} min</TableCell>
                  <TableCell>{test.questionCount}</TableCell>
                  <TableCell>
                    <Badge className={test.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {test.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(test.createdAt)}</TableCell>
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
                          Edit test
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete test
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
            <DialogDescription>
              Create a new test for students to take. You can add questions after creating the test.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Title</Label>
              <Input
                id="title"
                placeholder="Enter test title"
                value={newTest.title}
                onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter test description"
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={newTest.subject} onValueChange={(value) => setNewTest({ ...newTest, subject: value })}>
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
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={newTest.duration}
                  onChange={(e) => setNewTest({ ...newTest, duration: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={newTest.totalMarks}
                  onChange={(e) => setNewTest({ ...newTest, totalMarks: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  min="1"
                  value={newTest.passingMarks}
                  onChange={(e) => setNewTest({ ...newTest, passingMarks: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTest}>
              <Check className="mr-2 h-4 w-4" />
              Create Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
