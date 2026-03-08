'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-blue-800 sm:text-xl">
          <span className="inline-flex items-center gap-2">
            <span>DreamPlots</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">Realty</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {[
            ['Home', '/'],
            ['Projects', '/search'],
            ['Hyderabad', '/hyderabad'],
            ['Bangalore', '/bangalore'],
            ['Vijayawada', '/vijayawada'],
            ['Vizag', '/vizag'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-semibold text-slate-700 transition hover:text-blue-700">
              {label}
            </Link>
          ))}
          <a href="tel:+918008461987" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
            <Phone size={16} />
            Call Us
          </a>
        </div>

        <button
          className="rounded-lg p-2 text-slate-800 hover:bg-blue-50 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-blue-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50">Home</Link>
            <Link href="/search" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50">Projects</Link>
            <Link href="/hyderabad" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50">Hyderabad</Link>
            <Link href="/bangalore" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50">Bangalore</Link>
            <Link href="/vijayawada" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50">Vijayawada</Link>
            <Link href="/vizag" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50">Vizag</Link>
            <a href="tel:+918008461987" className="mt-2 rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-semibold text-white">📞 Call Us</a>
          </div>
        </div>
      )}
    </nav>
  )
}
