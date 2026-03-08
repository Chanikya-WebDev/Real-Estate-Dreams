// components/public/WhatsAppButton.tsx
'use client'
import { useState } from 'react'

interface Props {
  projectName:  string
  city:         string
  priceDisplay: string | null
}

export default function WhatsAppButton({ projectName, city, priceDisplay }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918008461987'

  const message = encodeURIComponent(
    `Hi GEM Group! 👋\n\nI am interested in *${projectName}* in *${city}*.\n\n` +
    `📍 Project: ${projectName}\n🏙️ City: ${city}\n` +
    `💰 Price: ${priceDisplay ?? 'Please share pricing details'}\n\n` +
    `Please share more details and available plot sizes. I would like to book a free site visit.`
  )

  return (
    <>
      <a
        href={`tel:+${phone}`}
        className="fixed bottom-40 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 md:bottom-24 md:right-6 md:h-14 md:w-14"
        aria-label="Call now"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 md:h-7 md:w-7">
          <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 4a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.24 1.02z" />
        </svg>
      </a>

      {/* Floating button on all screens (mobile + desktop) */}
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 md:bottom-6 md:right-6 md:h-14 md:w-14"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" className="w-7 h-7">
          <path d="M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.338.635 4.626 1.839 6.627L2.667 29.333l6.917-1.81A13.27 13.27 0 0 0 16.003 29.333C23.37 29.333 29.333 23.364 29.333 16S23.37 2.667 16.003 2.667zm0 2.4c5.88 0 10.664 4.784 10.664 10.664 0 5.88-4.784 10.664-10.664 10.664a10.62 10.62 0 0 1-5.434-1.492l-.39-.237-4.104 1.074 1.097-4.003-.258-.407A10.62 10.62 0 0 1 5.34 16c0-5.88 4.783-10.664 10.663-10.664zm-3.03 5.197c-.22 0-.575.082-.877.41-.301.328-1.15 1.124-1.15 2.74s1.178 3.18 1.342 3.4c.165.218 2.31 3.527 5.603 4.806 2.77 1.093 3.333.875 3.934.821.601-.055 1.94-.793 2.213-1.558.274-.766.274-1.422.192-1.558-.082-.136-.3-.218-.63-.382s-1.94-.957-2.24-1.066c-.3-.11-.52-.164-.74.163-.22.328-.85 1.066-.986 1.285-.136.218-.273.245-.602.082-.329-.164-1.389-.512-2.647-1.634-.978-.873-1.638-1.95-1.83-2.279-.191-.328-.02-.506.144-.669.148-.148.329-.382.493-.574.164-.191.219-.328.328-.546.11-.218.055-.41-.027-.574-.082-.163-.73-1.776-1.011-2.432-.259-.62-.524-.537-.74-.547a13.37 13.37 0 0 0-.63-.013z" />
        </svg>
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      </a>

      <div className={`fixed bottom-24 right-6 z-50 hidden whitespace-nowrap rounded-xl bg-gray-900 px-4 py-2 text-sm text-white shadow-lg transition-all duration-200 md:block ${
        showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        💬 Chat with us on WhatsApp
        <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-gray-900 rotate-45" />
      </div>
    </>
  )
}
