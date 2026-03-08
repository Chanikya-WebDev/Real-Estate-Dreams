'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const WhatsAppButton = dynamic(() => import('@/components/public/WhatsAppButton'), {
  ssr: false,
})

interface Props {
  projectName: string
  city: string
  priceDisplay: string | null
}

export default function DeferredWhatsAppButton({ projectName, city, priceDisplay }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready) return

    const runtime = globalThis as any

    const activate = () => setReady(true)
    const usedIdleCallback =
      typeof runtime.requestIdleCallback === 'function' &&
      typeof runtime.cancelIdleCallback === 'function'
    const idleHandle = usedIdleCallback
      ? runtime.requestIdleCallback(activate, { timeout: 3000 })
      : globalThis.setTimeout(activate, 1500)

    window.addEventListener('pointerdown', activate, { once: true })
    window.addEventListener('keydown', activate, { once: true })
    window.addEventListener('scroll', activate, { once: true })

    return () => {
      if (usedIdleCallback) {
        runtime.cancelIdleCallback(idleHandle)
      } else {
        globalThis.clearTimeout(idleHandle)
      }
      window.removeEventListener('pointerdown', activate)
      window.removeEventListener('keydown', activate)
      window.removeEventListener('scroll', activate)
    }
  }, [ready])

  if (!ready) return null

  return <WhatsAppButton projectName={projectName} city={city} priceDisplay={priceDisplay} />
}
