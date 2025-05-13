"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

export default function MarketingCards() {
  const router = useRouter()

  // Updated cardsData with subject identifiers that match your database
  const cardsData = [
    {
      text: "Test your knowledge of mobile app development frameworks and concepts.",
      subject: "mobile-development",
      title: "Mobile Development",
    },
    {
      text: "Challenge yourself with questions about web technologies and frameworks.",
      subject: "web-development",
      title: "Web Development",
    },
    {
      text: "Evaluate your understanding of design principles and tools.",
      subject: "graphic-design",
      title: "Graphic Design",
    },
    {
      text: "Test your knowledge of video editing techniques and software.",
      subject: "video-editing",
      title: "Video Editing",
    },
    {
      text: "Assess your understanding of digital marketing strategies.",
      subject: "digital-marketing",
      title: "Digital Marketing",
    },
    {
      text: "Test your knowledge of data science and analytics concepts.",
      subject: "data-science",
      title: "Data Science",
    },
  ]

  // Function to handle card click and navigate to the test page
  const handleCardClick = (subject) => {
    router.push(`/test/${subject}`)
  }

  return (
    <>
      <div className="min-h-screen bg-[#0537E7] flex flex-col items-center justify-start px-4 py-20 rounded-tr-[150px] rounded-bl-[150px]">
        {/* Centered animated heading */}
        <h1 className="text-center text-5xl font-semibold text-white mb-11">
          {"Quizzes Selection".split("").map((char, index) => (
            <span
              key={index}
              className="inline-block opacity-0 transition-opacity duration-700"
              style={{
                animation: `fadeIn 0.3s ease forwards`,
                animationDelay: `${index * 0.03}s`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>

        {/* Cards Section */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardsData.map((card, index) => (
              <div
                key={index}
                className="group relative cursor-pointer overflow-hidden px-6 pt-10 bg-white pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-lg"
                onClick={() => handleCardClick(card.subject)}
              >
                <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-blue-500 transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400">
                    <Image src="/Adobe Express - file.png" width={60} height={60} alt={card.title} />
                  </span>
                  <div className="pt-5 text-lg font-bold text-gray-800 transition-all duration-300 group-hover:text-white">
                    <h3>{card.title}</h3>
                  </div>
                  <div className="space-y-6 pt-3 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90">
                    <p>{card.text}</p>
                  </div>
                  <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                      <span className="text-sky-500 transition-all duration-300 group-hover:text-white cursor-pointer">
                        Start Test &rarr;
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animation CSS */}
        <style jsx>{`
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          } 
        `}</style>
      </div>
    </>
  )
}
