'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const BookingForm = dynamic(() => import('@/components/public/BookingForm'), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-2xl border border-gray-200 bg-white" />,
})

interface Props {
  projectId: string
  projectName: string
}

export default function DeferredBookingForm({ projectId, projectName }: Props) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (shouldLoad) return

    const runtime = globalThis as any

    const loadForm = () => setShouldLoad(true)
    const usedIdleCallback =
      typeof runtime.requestIdleCallback === 'function' &&
      typeof runtime.cancelIdleCallback === 'function'
    const idleHandle = usedIdleCallback
      ? runtime.requestIdleCallback(loadForm, { timeout: 2500 })
      : globalThis.setTimeout(loadForm, 1200)

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '240px 0px' },
    )

    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      if (usedIdleCallback) {
        runtime.cancelIdleCallback(idleHandle)
      } else {
        globalThis.clearTimeout(idleHandle)
      }
    }
  }, [shouldLoad])

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <BookingForm projectId={projectId} projectName={projectName} />
      ) : (
        <div className="h-96 w-full animate-pulse rounded-2xl border border-gray-200 bg-white" />
      )}
    </div>
  )
}
