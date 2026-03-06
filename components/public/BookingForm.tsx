// components/public/BookingForm.tsx
// 'use client' — has form state and user interaction
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface FormData {
  name: string
  phone: string
  preferred_time: string
  honeypot: string   // hidden spam trap — bots fill this, humans don't
}

interface Props {
  projectId: string
  projectName: string
}

export default function BookingForm({ projectId, projectName }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    // If honeypot is filled → it's a bot → silently do nothing
    if (data.honeypot) {
      setSubmitted(true)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          name: data.name,
          phone: data.phone,
          preferred_time: data.preferred_time,
          source_url: window.location.href,
          // UTM params from URL
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          referrer: document.referrer,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      // Track in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'site_visit_request', {
          event_category: 'lead',
          event_label: projectName,
          value: 1,
        })
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-bold text-gray-900">Request Received!</h3>
        <p className="text-gray-500 text-sm mt-1">
          We'll call you within 2 hours to confirm your site visit.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

      {/* Honeypot — hidden from users, visible to bots */}
      <input
        type="text"
        {...register('honeypot')}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Name */}
      <div>
        <input
          type="text"
          placeholder="Your Name"
          {...register('name', { required: 'Name is required' })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <input
          type="tel"
          placeholder="Phone Number"
          {...register('phone', {
            required: 'Phone is required',
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Enter a valid 10-digit Indian mobile number',
            },
          })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Preferred Time */}
      <select
        {...register('preferred_time')}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-blue-500"
      >
        <option value="">Preferred Visit Time (optional)</option>
        <option value="Weekday Morning (9am–12pm)">Weekday Morning (9am–12pm)</option>
        <option value="Weekday Afternoon (12pm–4pm)">Weekday Afternoon (12pm–4pm)</option>
        <option value="Weekday Evening (4pm–7pm)">Weekday Evening (4pm–7pm)</option>
        <option value="Weekend Morning">Weekend Morning</option>
        <option value="Weekend Afternoon">Weekend Afternoon</option>
        <option value="Any Time">Any Time</option>
      </select>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition text-sm"
      >
        {loading ? 'Submitting...' : 'Book Free Site Visit'}
      </button>

      <p className="text-gray-400 text-xs text-center">
        No spam. We only call to confirm your visit.
      </p>
    </form>
  )
}
