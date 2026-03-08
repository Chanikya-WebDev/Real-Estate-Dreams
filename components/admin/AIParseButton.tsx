// components/admin/AIParseButton.tsx
// components/admin/AIParseButton.tsx
'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  onParsed: (data: Record<string, any>) => void
}

type Phase = 'idle' | 'extracting' | 'searching' | 'waiting' | 'building' | 'done' | 'error'

const PHASES: { key: Phase; label: string; sub: string }[] = [
  { key: 'extracting', label: '🤖 Extracting project data with AI...', sub: 'Reading name, price, amenities, plot details' },
  { key: 'searching',  label: '🧠 Understanding project text...',        sub: 'Extracting locality, pricing and amenity context' },
  { key: 'waiting',    label: '⏳ Finalizing structured fields...',      sub: 'Generating clean JSON response for your form' },
  { key: 'building',   label: '🗂️ Preparing SEO fields...',             sub: 'Creating SEO title, description and keywords' },
]

// ✅ This line must have the full array — NOT end after the = sign
const PHASE_DURATIONS = [4000, 8000, 25000, 4000]


export default function AIParseButton({ onParsed }: Props) {
  const [open,         setOpen]         = useState(false)
  const [text,         setText]         = useState('')
  const [phase,        setPhase]        = useState<Phase>('idle')
  const [phaseIndex,   setPhaseIndex]   = useState(0)
  const [errMsg,       setErrMsg]       = useState('')
  const [filledFields, setFilledFields] = useState<string[]>([])
  const [retryCountdown, setRetryCountdown] = useState(0)

  // ✅ 'waiting' is now part of the loading state
  const loading = phase === 'extracting' || phase === 'searching' || phase === 'waiting' || phase === 'building'

  // Cycle through phase labels while API runs in background
  useEffect(() => {
    if (!loading) return
    if (phaseIndex >= PHASES.length - 1) return

    const timer = setTimeout(() => {
      setPhaseIndex((i) => i + 1)
      setPhase(PHASES[phaseIndex + 1].key)
    }, PHASE_DURATIONS[phaseIndex])

    return () => clearTimeout(timer)
  }, [loading, phaseIndex])

  // Countdown timer shown during 'waiting' phase
  useEffect(() => {
    if (phase !== 'waiting') { setRetryCountdown(0); return }
    setRetryCountdown(22)
    const interval = setInterval(() => {
      setRetryCountdown((n) => {
        if (n <= 1) { clearInterval(interval); return 0 }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  async function handleParse() {
    if (!text.trim()) return
    setPhase('extracting')
    setPhaseIndex(0)
    setErrMsg('')
    setFilledFields([])

    try {
      const res  = await fetch('/api/admin/ai-parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rawText: text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Parse failed')

      const filled = Object.entries(json.data)
        .filter(([, v]) => v !== null && v !== undefined && v !== '' &&
          !(Array.isArray(v) && (v as any[]).length === 0))
        .map(([k]) => k)
      setFilledFields(filled)
      if (json.warning) {
        setErrMsg(json.warning)
      }

      setPhase('done')
      onParsed(json.data)

      setTimeout(() => {
        setOpen(false)
        setText('')
        setPhase('idle')
        setPhaseIndex(0)
        setFilledFields([])
      }, 2500)

    } catch (e: any) {
      setPhase('error')
      setErrMsg(e.message)
    }
  }

  function handleCancel() {
    setOpen(false)
    setText('')
    setPhase('idle')
    setPhaseIndex(0)
    setErrMsg('')
  }

  const currentPhaseInfo = PHASES[phaseIndex]

  return (
    <div className="mb-6 border-2 border-purple-200 rounded-xl overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => !loading && setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles size={17} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-sm">✨ AI Auto-Fill</p>
            <p className="text-xs text-gray-500">
              Paste brochure / WhatsApp text → AI fills all fields + finds location on map
            </p>
          </div>
        </div>
        {open
          ? <ChevronUp   size={18} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
        }
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="p-5 bg-white space-y-4">

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            placeholder={`Paste raw project details here — any format works:\n\n• WhatsApp forwarded messages\n• Brochure copy-paste text\n• Agent's description\n• Mix of any details\n\nExample:\nSree Laxmi Balaji Township - Premium Villa Plots\nLocation: Shadnagar\nPlot sizes from 165 sq.yards | 46 acres | 578 plots\nPrice: ₹23,000/sq.yd\nRERA: P02400009778\nAmenities: Clubhouse, Swimming Pool, 24/7 Security...\n5 min from ORR, near Shadnagar bus stand`}
            rows={9}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none disabled:opacity-60 disabled:bg-gray-50 transition"
          />

          {/* ── Progress ── */}
          {loading && (
            <div className="space-y-3">

              {/* Step dots */}
              <div className="flex items-center gap-2">
                {PHASES.map((p, i) => (
                  <div key={p.key} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < phaseIndex   ? 'bg-green-500 text-white' :
                      i === phaseIndex ? 'bg-purple-600 text-white animate-pulse' :
                                         'bg-gray-200 text-gray-400'
                    }`}>
                      {i < phaseIndex ? '✓' : i + 1}
                    </div>
                    {i < PHASES.length - 1 && (
                      <div className={`h-0.5 w-6 rounded transition-all ${i < phaseIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Current phase card */}
              <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
                phase === 'waiting'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <Loader2 size={16} className={`animate-spin flex-shrink-0 mt-0.5 ${
                  phase === 'waiting' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${phase === 'waiting' ? 'text-yellow-800' : 'text-blue-800'}`}>
                    {currentPhaseInfo?.label}
                    {phase === 'waiting' && retryCountdown > 0 && (
                      <span className="ml-2 font-mono text-yellow-700">({retryCountdown}s)</span>
                    )}
                  </p>
                  <p className={`text-xs mt-0.5 ${phase === 'waiting' ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {currentPhaseInfo?.sub}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                ⏳ Gemini is generating structured project data — usually takes 5–20 seconds.
              </p>
            </div>
          )}

          {/* ── Success ── */}
          {phase === 'done' && (
            <div className="flex items-start gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">
                  ✅ {filledFields.length} fields filled successfully!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Includes: coordinates, map embed, SEO title, description, amenities & more. Review and save.
                </p>
                {errMsg && (
                  <p className="text-xs text-amber-700 mt-2">{errMsg}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {phase === 'error' && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Failed to parse</p>
                <p className="text-xs text-red-600 mt-0.5">{errMsg}</p>
              </div>
            </div>
          )}

          {/* ── Buttons ── */}
          {!loading && phase !== 'done' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleParse}
                disabled={!text.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition shadow"
              >
                <Sparkles size={15} />
                Auto-Fill All Fields
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Tags: what gets filled ── */}
          {phase === 'idle' && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Fields AI fills automatically:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Name', 'City', 'Address', 'Plot sizes', 'Total area',
                  'Price', 'Amenities', 'Nearby landmarks', 'Description',
                  'SEO title', 'Meta description', 'Latitude', 'Longitude',
                  'Google Maps embed'
                ].map((f) => (
                  <span key={f} className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
