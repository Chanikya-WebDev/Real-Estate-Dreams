'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

const BookingForm = dynamic(() => import('@/components/public/BookingForm'), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-2xl border border-gray-200 bg-white" />,
})

interface Props {
  projectId: string
  projectName: string
  city: string
  priceDisplay: string | null
}

export default function FloatingActionButtons({ projectId, projectName, city, priceDisplay }: Props) {
  const [open, setOpen] = useState(false)
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918008461987'

  const waMessage = useMemo(() => {
    return encodeURIComponent(
      `Hi GEM Group! I am interested in ${projectName} in ${city}. ` +
      `Price: ${priceDisplay ?? 'Please share pricing details'}. Please share details and book a site visit.`
    )
  }, [projectName, city, priceDisplay])

  return (
    <>
      <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition hover:scale-105 hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 md:h-14 md:w-14"
          aria-label="Book site visit"
          title="Book Site Visit"
        >
          🗓️
        </button>

        <a
          href={`tel:+${phone}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:scale-105 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 md:h-14 md:w-14"
          aria-label="Call now"
          title="Call"
        >
          📞
        </a>

        <a
          href={`https://wa.me/${phone}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#20ba5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 md:h-14 md:w-14"
          aria-label="WhatsApp chat"
          title="WhatsApp"
        >
          💬
        </a>
      </div>

      <div
        className={`fixed inset-0 z-[70] bg-black/35 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`fixed bottom-0 left-0 right-0 z-[71] max-h-[88vh] rounded-t-2xl bg-white p-4 shadow-2xl transition-transform duration-300 md:left-auto md:right-6 md:bottom-6 md:w-[380px] md:rounded-2xl ${
          open ? 'translate-y-0' : 'translate-y-full md:translate-y-[120%]'
        }`}
        aria-label="Book Site Visit Panel"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Book Free Site Visit</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        {open ? <BookingForm projectId={projectId} projectName={projectName} /> : null}
      </aside>
    </>
  )
}
