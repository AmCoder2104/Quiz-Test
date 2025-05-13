"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";


const Hero = () => {
  const quizSectionRef = useRef(null);

  const textParts = ["new concepts for", "each question"];
  const [displayedText, setDisplayedText] = useState([]);

  useEffect(() => {
    let currentPartIndex = 0;
    let currentCharIndex = 0;
    const result = [];




    const interval = setInterval(() => {
      if (currentPartIndex >= textParts.length) {
        clearInterval(interval);
        return;
      }

      const currentPart = textParts[currentPartIndex];

      if (currentCharIndex < currentPart.length) {
        result[currentPartIndex] = currentPart.substring(0, currentCharIndex + 1);
        setDisplayedText([...result]);
        currentCharIndex++;
      } else {
        currentPartIndex++;
        currentCharIndex = 0;
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);



  const scrollToQuizSection = () => {
    window.scrollBy({
      top: 800,
      behavior: 'smooth'
    });
  };
 
  return (
    <>
      <div className="relative w-full h-screen bg-white flex items-center justify-center">
        {/* Rope */}
        <div className="absolute left-0 bottom-0 w-32 h-32 border-l-4 border-b-4 border-[#0536E5] rounded-bl-full"></div>

        {/* Main content container with fixed layout */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6">
          {/* Text content with fixed width */}
          <div className="w-full md:w-1/2 relative z-10 ml-10">
            <h1 className="text-3xl font-mono md:text-5xl font-bold text-black leading-tight">
              Learn <br />
              {/* Fixed height container for animated text */}
              <div className="h-[120px] md:h-[140px] flex flex-col justify-center">
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  className="text-[#0536E5]"
                >
                  {displayedText.map((text, index) => (
                    <span key={index}>
                      {text}
                      {index < displayedText.length - 1 && <br />}
                    </span>
                  ))}
                </motion.span>
              </div>
            </h1>
            <p className="text-gray-600 mt-3 text-lg">We help you prepare for exams and quizzes</p>

            <div className="mt-6 flex items-center">
            <a
                href="https://edifycit.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 font-normal text-[#0536E5] cursor-pointer hover:underline"
              >
                <h1 className="bold font-medium text-[23px]"> Know about Edify? </h1>
              </a>

              <div className="relative w-47 h-47 flex items-center justify-center mx-auto -mt-5 mr-10">
                {/* Rotating Circle Text */}
                <svg className="absolute w-full h-full animate-spin-slow" viewBox="0 0 200 200">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                    />
                  </defs>
                  <text fill="blue" fontSize="20" fontWeight="bold">
                    <textPath href="#circlePath">
                      • Start Your Test • Start Your Test • Start Your Test •
                    </textPath>
                  </text>
                </svg>

                {/* Center Button */}
                <button
                  onClick={scrollToQuizSection}
                  className="w-28 h-28 bg-blue-700 text-black rounded-full shadow-lg flex flex-col items-center justify-center z-10"
                >
                  <span className="text-white text-7xl animate-bounce mt-1">↓</span>
                </button>
              </div>

            </div>
          </div>

          {/* Image container with fixed dimensions */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
            <div className="relative w-full max-w-[500px] h-[500px]">
              <Image
                src="/Exams-bro.svg"
                alt="Illustration"
                fill
                style={{ objectFit: "contain" }}
                className="animate-fadeIn"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
} `}
      </style>
    </>
  );
};


export default Hero;