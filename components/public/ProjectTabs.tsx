'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import type { ProjectWithMedia } from '@/types'

interface Props {
  project: ProjectWithMedia
}

const TABS = ['Gallery', 'Amenities', 'Location'] as const
type Tab = (typeof TABS)[number]
type TabPanelsComponent = ComponentType<{ active: Tab; project: ProjectWithMedia }>

export default function ProjectTabs({ project }: Props) {
  const [active, setActive] = useState<Tab>('Gallery')
  const [Panels, setPanels] = useState<TabPanelsComponent | null>(null)

  const loadPanels = useCallback(async () => {
    if (Panels) return
    const mod = await import('@/components/public/ProjectTabPanels')
    setPanels(() => mod.default)
  }, [Panels])

  useEffect(() => {
    const runtime = globalThis as any
    const usedIdleCallback =
      typeof runtime.requestIdleCallback === 'function' &&
      typeof runtime.cancelIdleCallback === 'function'
    const idleHandle = usedIdleCallback
      ? runtime.requestIdleCallback(() => {
          void loadPanels()
        }, { timeout: 2000 })
      : globalThis.setTimeout(() => {
          void loadPanels()
        }, 1200)

    return () => {
      if (usedIdleCallback) {
        runtime.cancelIdleCallback(idleHandle)
      } else {
        globalThis.clearTimeout(idleHandle)
      }
    }
  }, [loadPanels])

  const onTabClick = (tab: Tab) => {
    if (!Panels) {
      void loadPanels()
    }
    setActive(tab)
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex overflow-x-auto border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabClick(tab)}
            className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${
              active === tab
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {Panels ? (
        <Panels active={active} project={project} />
      ) : (
        <div className="h-64 w-full animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
      )}
    </div>
  )
}
