"use client"

import { LoginForm } from "@/components/ui/login-form"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16">
        <div className="mb-8">
          <Link href="/">
            <Image src="/logo-edify.webp" alt="Edify Logo" width={130} height={50} />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <LoginForm />
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block w-1/2 bg-[#0536E5] relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h2 className="text-3xl font-bold mb-4">Welcome to Edify Learning Platform</h2>
            <p className="text-lg opacity-90">
              Test your knowledge with our interactive quizzes and improve your skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
