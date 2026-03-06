// components/public/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <h3 className="text-white font-bold text-lg mb-3">YourBrand Realty</h3>
          <p className="text-sm">Trusted real estate partner for plots and villas across Telangana and Andhra Pradesh.</p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Cities</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/hyderabad" className="hover:text-white">Hyderabad</Link></li>
            <li><Link href="/bangalore" className="hover:text-white">Bangalore</Link></li>
            <li><Link href="/vijayawada" className="hover:text-white">Vijayawada</Link></li>
            <li><Link href="/vizag" className="hover:text-white">Vizag</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <p className="text-sm">📞 +91-98765-43210</p>
          <p className="text-sm mt-1">📧 info@yourbrand.com</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 mt-8">
        © {new Date().getFullYear()} YourBrand Realty. All rights reserved.
      </div>
    </footer>
  )
}
