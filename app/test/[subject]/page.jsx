"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Flag, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import ResultsModal from "./results-modal"

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const subject = params.subject

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState([])
  const [flagged, setFlagged] = useState([])
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes
  const [showResult, setShowResult] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [results, setResults] = useState(null)
  const [testStartTime, setTestStartTime] = useState(null)

  // Check authentication status
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      if (status !== "authenticated") return

      try {
        setLoading(true)
        console.log(`Fetching questions for subject: ${subject}`)
        const response = await fetch(`/api/questions?subject=${subject}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API Response:", data)

        // Check if we got questions or if we got a questions property in the response
        const questionsArray = Array.isArray(data) ? data : data.questions || []

        console.log(`Received ${questionsArray.length} questions`)
        setDebugInfo({
          responseStatus: response.status,
          responseData: data,
          questionsCount: questionsArray.length,
          subject: subject,
        })

        if (questionsArray.length === 0) {
          setError("No questions available for this subject. Please try another subject.")
        } else {
          setQuestions(questionsArray)
          setSelected(Array(questionsArray.length).fill(null))
          setFlagged(Array(questionsArray.length).fill(false))
          setTestStartTime(new Date())
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching questions:", err)
        setError(`Failed to load questions: ${err.message}. Please try again later.`)
        setDebugInfo({
          error: err.message,
          stack: err.stack,
          subject: subject,
        })
        setLoading(false)
      }
    }

    if (session && subject) {
      fetchQuestions()
    }
  }, [subject, session, status])

  // Timer effect
  useEffect(() => {
    if (loading || questions.length === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, questions])

  const handleOptionSelect = (index) => {
    const newSelected = [...selected]
    newSelected[current] = index
    setSelected(newSelected)
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
    }
  }

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1)
    }
  }

  const handleQuestionSelect = (index) => {
    setCurrent(index)
  }

  const handleFlagQuestion = () => {
    const newFlagged = [...flagged]
    newFlagged[current] = !newFlagged[current]
    setFlagged(newFlagged)
  }

  const handleReviewTest = () => {
    // Instead of showing the review screen, directly submit the test
    handleSubmitTest()
  }

  const handleSubmitTest = async () => {
    // Calculate results
    let score = 0
    const questionResults = questions.map((question, index) => {
      const isCorrect = selected[index] === question.correctAnswer
      if (isCorrect) score++

      return {
        question: question.question,
        selectedAnswer: selected[index] !== null ? question.options[selected[index]] : null,
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
      }
    })

    const endTime = new Date()
    const timeTaken = Math.floor((endTime - testStartTime) / 1000)

    const resultsData = {
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      timeTaken,
      questionResults,
      unanswered: selected.filter((s) => s === null).length,
      startTime: testStartTime,
      endTime,
    }

    setResults(resultsData)

    // Save test results to database
    try {
      console.log("Preparing to save test results")

      // Prepare data for API
      const testAttemptData = {
        testId: subject, // Use the subject as the test identifier
        score: resultsData.percentage,
        totalQuestions: questions.length,
        correctAnswers: score,
        startTime: testStartTime.toISOString(),
        answers: questions.map((question, index) => ({
          question: question._id || question.id || `question-${index}`,
          selectedOption: selected[index],
          isCorrect: selected[index] === question.correctAnswer,
        })),
        device: navigator.userAgent,
        browser: getBrowserInfo(),
      }

      console.log("Sending test attempt data:", testAttemptData)

      const response = await fetch("/api/test-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testAttemptData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Failed to save test results:", responseData)
        throw new Error(responseData.error || "Failed to save test results")
      } else {
        console.log("Test results saved successfully:", responseData)
      }
    } catch (error) {
      console.error("Error saving test results:", error)
    }

    setShowResult(true)
    setShowReview(false)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const formatTimeTaken = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatSubjectTitle = (subjectId) => {
    return subjectId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent
    let browserName = "Unknown"

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome"
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox"
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari"
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera"
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge"
    }

    return browserName
  }

  const getTimeClass = () => {
    if (timeLeft < 60) return "text-red-500 animate-pulse"
    if (timeLeft < 300) return "text-amber-500"
    return "text-white"
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading questions for {formatSubjectTitle(subject)}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-[#0537E7] text-white rounded-lg font-medium hover:bg-[#042EB5]"
        >
          Return Home
        </button>

        {process.env.NODE_ENV === "development" && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-2xl mx-auto">
            <h3 className="font-bold mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              Debug Information
            </h3>
            <pre className="text-xs overflow-auto p-2 bg-gray-800 text-white rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
        <p className="mb-6">There are no questions available for this subject yet.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-[#0537E7] text-white rounded-lg font-medium hover:bg-[#042EB5]"
        >
          Return Home
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">Try running the seed route to populate questions for this subject:</p>
          <a
            href="/api/seed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
          >
            Run Seed Route
          </a>
        </div>

        {process.env.NODE_ENV === "development" && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-2xl mx-auto">
            <h3 className="font-bold mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              Debug Information
            </h3>
            <pre className="text-xs overflow-auto p-2 bg-gray-800 text-white rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  // Review Screen
  if (showReview) {
    return (
      <div className="min-h-screen bg-white p-6 md:p-8">
        <nav className="bg-[#0537E7] text-white rounded-xl shadow-lg mb-8 p-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold">Review Your Answers</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`bg-white/20 px-4 py-2 rounded-lg flex items-center ${getTimeClass()}`}>
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="bg-[#0537E7] bg-opacity-5 p-6 border-b border-gray-200">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Review Your Answers</h2>
              <p className="text-gray-600 mt-2">
                Please review your answers before submitting. You can go back to any question to change your answer.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selected[index] === null ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"
                    } ${flagged[index] ? "ring-2 ring-red-400" : ""}`}
                    onClick={() => {
                      setCurrent(index)
                      setShowReview(false)
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">Question {index + 1}</span>
                      {flagged[index] && <Flag className="h-4 w-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{question.question}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selected[index] === null ? "bg-amber-200 text-amber-800" : "bg-green-200 text-green-800"
                        }`}
                      >
                        {selected[index] === null ? "Not answered" : "Answered"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-6 py-3 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Return to Test
                </button>

                <button
                  onClick={() => handleSubmitTest()}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-[#0537E7] hover:bg-[#042EB5] shadow-md flex items-center justify-center"
                >
                  Submit Test
                  <CheckCircle className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Test Summary</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="text-green-700 font-bold text-xl">{selected.filter((s) => s !== null).length}</div>
                  <div className="text-green-600 text-sm">Answered</div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="text-amber-700 font-bold text-xl">{selected.filter((s) => s === null).length}</div>
                  <div className="text-amber-600 text-sm">Unanswered</div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="text-red-700 font-bold text-xl">{flagged.filter(Boolean).length}</div>
                  <div className="text-red-600 text-sm">Flagged</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion</span>
                  <span>{Math.round((selected.filter((s) => s !== null).length / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0537E7] h-2 rounded-full"
                    style={{ width: `${(selected.filter((s) => s !== null).length / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* Top Navigation Bar */}
      <nav className="bg-[#0537E7] text-white rounded-xl shadow-lg mb-8 p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">{formatSubjectTitle(subject)} Certification</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`bg-white/20 px-4 py-2 rounded-lg flex items-center ${getTimeClass()}`}>
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>

            <div className="hidden md:block bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-medium">
                Question: {current + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Question Navigator */}
          <div className="lg:w-1/4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sticky top-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-[#0537E7] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Question Navigator
              </h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selected[index] !== null
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : flagged[index]
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : current === index
                            ? "bg-[#0537E7] text-white hover:bg-[#042EB5]"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-[#0537E7] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Your Progress
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Answered</span>
                    <span className="font-medium text-green-600">{selected.filter((s) => s !== null).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unanswered</span>
                    <span className="font-medium text-amber-600">{selected.filter((s) => s === null).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Flagged</span>
                    <span className="font-medium text-red-600">{flagged.filter(Boolean).length}</span>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{Math.round((selected.filter((s) => s !== null).length / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#0537E7] h-2 rounded-full"
                      style={{ width: `${(selected.filter((s) => s !== null).length / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitTest}
                  className="w-full mt-4 px-4 py-2 bg-[#0537E7] bg-opacity-10 text-[#0537E7] rounded-lg font-medium hover:bg-opacity-20 transition flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Test
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Question Header */}
              <div className="bg-[#0537E7] bg-opacity-5 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0537E7] bg-[#0537E7] bg-opacity-10 px-3 py-1 rounded-full">
                    Question {current + 1} of {questions.length}
                  </span>
                  <button
                    onClick={handleFlagQuestion}
                    className={`text-sm px-3 py-1 rounded-full flex items-center ${
                      flagged[current] ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    {flagged[current] ? "Flagged" : "Flag for review"}
                  </button>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{questions[current].question}</h2>
              </div>

              {/* Options */}
              <div className="p-6">
                <div className="space-y-4">
                  {questions[current].options.map((option, i) => (
                    <button
                      key={i}
                      className={`w-full text-left p-5 rounded-lg border transition-all duration-200 flex items-start ${
                        selected[current] === i
                          ? "border-[#0537E7] bg-[#0537E7] bg-opacity-5 shadow-inner"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleOptionSelect(i)}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-4 mt-0.5 flex-shrink-0 border ${
                          selected[current] === i
                            ? "bg-[#0537E7] border-[#0537E7] text-white"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-gray-700">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={current === 0}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center ${
                    current === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {current < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-lg font-medium text-white bg-[#0537E7] hover:bg-[#042EB5] shadow-md flex items-center justify-center"
                  >
                    <span>Next Question</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-3 rounded-lg font-medium text-white bg-[#0537E7] hover:bg-[#042EB5] shadow-md flex items-center justify-center"
                  >
                    <span>Submit Test</span>
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            </div>

            {/* Quiz Help Card */}
            <div className="mt-6 bg-[#0537E7] bg-opacity-5 border border-[#0537E7] border-opacity-20 rounded-xl p-5">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#0537E7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Exam Guidelines
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-[#0537E7] mr-2">•</span>
                  <span>Select one answer for each question</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0537E7] mr-2">•</span>
                  <span>Flag questions you want to review later</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0537E7] mr-2">•</span>
                  <span>Use the question navigator to jump between questions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0537E7] mr-2">•</span>
                  <span>Review all answers before final submission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResult && <ResultsModal onClose={() => router.push("/")} />}
    </div>
  )
}

const ArrowLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
)
