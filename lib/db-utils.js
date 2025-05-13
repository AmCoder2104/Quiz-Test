import dbConnect from "@/lib/mongoose"
import Question from "@/models/Question" // Make sure this path matches your actual file name (case-sensitive)

// This is a utility file for database operations
// You can use this to seed your database with initial data

export async function seedDatabase() {
  try {
    // Connect to the database
    await dbConnect()

    // Check if collection already has data
    const count = await Question.countDocuments()
    if (count > 0) {
      console.log("Database already seeded")
      return
    }

    // Sample questions for each subject
    const sampleQuestions = [
      // Mobile Development questions
      {
        question: "Which of the following is NOT a mobile app development framework?",
        options: ["React Native", "Flutter", "Django", "Xamarin"],
        correctAnswer: 2,
        subject: "mobile-development",
      },
      {
        question: "What programming language is primarily used for iOS development?",
        options: ["Java", "Swift", "Kotlin", "C#"],
        correctAnswer: 1,
        subject: "mobile-development",
      },
      {
        question: "Which company developed the Android operating system?",
        options: ["Apple", "Microsoft", "Google", "Samsung"],
        correctAnswer: 2,
        subject: "mobile-development",
      },

      // Web Development questions
      {
        question: "Which of the following is a JavaScript framework?",
        options: ["Django", "Flask", "Ruby on Rails", "Vue.js"],
        correctAnswer: 3,
        subject: "web-development",
      },
      {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
        correctAnswer: 2,
        subject: "web-development",
      },
      {
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: 1,
        subject: "web-development",
      },

      // Graphic Design questions
      {
        question: "Which color model is used for digital design?",
        options: ["CMYK", "RGB", "HSL", "Both B and C"],
        correctAnswer: 3,
        subject: "graphic-design",
      },
      {
        question: "Which software is NOT primarily used for graphic design?",
        options: ["Adobe Photoshop", "Adobe Illustrator", "Microsoft Excel", "CorelDRAW"],
        correctAnswer: 2,
        subject: "graphic-design",
      },
      {
        question: "What file format supports transparency?",
        options: ["JPEG", "PNG", "BMP", "GIF"],
        correctAnswer: 1,
        subject: "graphic-design",
      },

      // Video Editing questions
      {
        question: "Which of the following is NOT a video editing software?",
        options: ["Adobe Premiere Pro", "Final Cut Pro", "Microsoft Word", "DaVinci Resolve"],
        correctAnswer: 2,
        subject: "video-editing",
      },
      {
        question: "What does FPS stand for in video editing?",
        options: [
          "Frames Per Second",
          "Final Production Stage",
          "Fast Processing System",
          "Format Processing Standard",
        ],
        correctAnswer: 0,
        subject: "video-editing",
      },
      {
        question: "Which video format is commonly used for high-quality video with small file size?",
        options: ["AVI", "MP4", "MOV", "WMV"],
        correctAnswer: 1,
        subject: "video-editing",
      },
    ]

    // Insert sample questions
    await Question.insertMany(sampleQuestions)
    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
