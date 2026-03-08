'use client'

import { useEffect, useMemo, useState } from 'react'

interface Props {
  images: string[]
  projectName: string
}

export default function HeroDesktopSlider({ images, projectName }: Props) {
  const uniqueImages = useMemo(() => [...new Set(images.filter(Boolean))], [images])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (uniqueImages.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % uniqueImages.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [uniqueImages.length])

  if (uniqueImages.length === 0) return null

  return (
    <div className="absolute inset-0 hidden md:block">
      {uniqueImages.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={`${projectName} hero ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
            index === activeIndex ? 'opacity-90' : 'opacity-0'
          }`}
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      ))}

      {uniqueImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-1.5">
          {uniqueImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show hero image ${index + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                index === activeIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
