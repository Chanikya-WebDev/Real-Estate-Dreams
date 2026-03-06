// components/public/Navbar.tsx
// 'use client' because it has mobile menu toggle state
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Brand */}
          <Link href="/" className="text-xl font-bold text-blue-700">
            YourBrand Realty
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-700 transition">
              Home
            </Link>
            <Link href="/search" className="text-gray-600 hover:text-blue-700 transition">
              Projects
            </Link>
            {/* Add city quick links */}
            <Link href="/hyderabad" className="text-gray-600 hover:text-blue-700 transition">
              Hyderabad
            </Link>
            <Link href="/vijayawada" className="text-gray-600 hover:text-blue-700 transition">
              Vijayawada
            </Link>
            <Link href="/vizag" className="text-gray-600 hover:text-blue-700 transition">
              Vizag
            </Link>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              <Phone size={16} />
              Call Us
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3">
          <Link href="/" onClick={() => setOpen(false)} className="text-gray-700 py-2">Home</Link>
          <Link href="/search" onClick={() => setOpen(false)} className="text-gray-700 py-2">Projects</Link>
          <Link href="/hyderabad" onClick={() => setOpen(false)} className="text-gray-700 py-2">Hyderabad</Link>
          <Link href="/vijayawada" onClick={() => setOpen(false)} className="text-gray-700 py-2">Vijayawada</Link>
          <Link href="/vizag" onClick={() => setOpen(false)} className="text-gray-700 py-2">Vizag</Link>
          <a href="tel:+919876543210" className="text-blue-700 font-semibold py-2">📞 Call Us</a>
        </div>
      )}
    </nav>
  )
}
