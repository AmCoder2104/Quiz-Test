"use client"

import Image from "next/image"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { useSession } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-sm w-full top-0 left-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        {/* Logo section */}
        <div className="flex items-center">
          <Image 
            src="/logo-edify.webp" 
            alt="Company Logo" 
            width={130} 
            height={50} 
            className="h-8 w-auto"
          />
        </div>

        <div className="flex items-center space-x-6">
          <ul className="hidden md:flex space-x-6 text-[#0536E5] text-[16px] font-semibold">
            {session?.user?.role === "admin" && (
              <li>
                <Link href="/dashboard" className="hover:underline underline-offset-4">
                  Dashboard
                </Link>
              </li>
            )} 
          </ul>
          <UserMenu /> 
        </div>

    
      </div>
    </div>
  </nav>
  )
}
