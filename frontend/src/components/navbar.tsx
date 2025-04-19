"use client"
import { useState } from "react"
import Link from "next/link"
import { Plane, Calendar, User, Menu, X, LogIn, Globe, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NextRouter, useRouter } from "next/router"
import { useSession } from "next-auth/react"
// import { Input } from "@/components/ui/input"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router:NextRouter = useRouter()
  const { data: sessionData } = useSession()
  console.log(sessionData)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-sky-500" />
          <span className="text-xl font-bold text-sky-700">SkyVoyage</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-sky-500 transition-colors">
            Home
          </Link>
          <Link href="/flights" className="text-sm font-medium hover:text-sky-500 transition-colors">
            Flights
          </Link>
          <Link href="/bookings" className="text-sm font-medium hover:text-sky-500 transition-colors">
            My Bookings
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-sky-500 transition-colors">
            About Us
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={()=> {router.push("/account/auth")}}>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign in</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={()=> {router.push("/account/auth?signup")}}>
                <User className="mr-2 h-4 w-4" />
                <span>Sign Up</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>My Payments</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Globe className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-sky-500 hover:bg-sky-600">Book Now</Button>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container divide-y">
            <nav className="flex flex-col py-4">
              <Link
                href="/"
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-sky-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/flights"
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-sky-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Plane className="h-4 w-4" />
                Flights
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-sky-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                My Bookings
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-sky-500"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
            </nav>
            <div className="py-4">
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button variant="outline" className="justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
                <Button className="bg-sky-500 hover:bg-sky-600">Book Now</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
