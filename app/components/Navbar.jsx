"use client"

import Image from "next/image"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { useSession } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="text-white absolute w-full top-0 left-0 z-10">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link href="/">
          <Image src="/logo-edify.webp" alt="logo" height={130} width={130} />
        </Link>

        {/* Desktop Menu */}
        <div className="flex items-center space-x-6">
          <ul className="hidden md:flex space-x-6 text-[#0536E5] text-[16px] font-semibold">
            <li>
              <Link href="/" className="hover:underline underline-offset-4">
                Home
              </Link>
            </li>
            {session?.user?.role === "admin" && (
              <li>
                <Link href="/dashboard" className="hover:underline underline-offset-4">
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link href="/about" className="hover:underline underline-offset-4">
                About
              </Link>
            </li>
          </ul>
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}
