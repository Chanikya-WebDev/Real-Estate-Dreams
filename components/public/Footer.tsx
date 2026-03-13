import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-blue-100 bg-gradient-to-r from-blue-900 to-indigo-900 py-10 text-blue-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-extrabold text-white">
            {process.env.NEXT_PUBLIC_SITE_NAME} — Your Trusted Real Estate Partner
          </h3>
          <p className="text-sm leading-relaxed text-blue-100">Trusted real estate partner for plots and villas across Telangana and Andhra Pradesh.</p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">Cities</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/hyderabad" className="hover:text-white">Hyderabad</Link></li>
            <li><Link href="/bangalore" className="hover:text-white">Bangalore</Link></li>
            <li><Link href="/vijayawada" className="hover:text-white">Vijayawada</Link></li>
            <li><Link href="/vizag" className="hover:text-white">Vizag</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">Contact</h3>
          <p className="text-sm">📞 +91 80084 61987</p>
          <p className="mt-1 text-sm">📧 golesuresh832@gmail.com</p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-blue-200/80">
        © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.
      </div>
    </footer>
  )
}
