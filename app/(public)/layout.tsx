// app/(public)/layout.tsx
// ─────────────────────────────────────────────────────
// Wraps ONLY public pages (not admin pages)
// Admin pages have their own layout with Sidebar
// ─────────────────────────────────────────────────────
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
