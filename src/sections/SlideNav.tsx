import { useSyncExternalStore } from 'react'

import { slideNav } from '../scroll/slideNav'

/**
 * Minimal slideshow indicator, bottom-right. Up/down chevrons step between
 * sections; the dots show position and jump on click. Hidden until the section
 * list is known. Mirrors the wheel/arrow pagination in `SmoothScroll`.
 */
export function SlideNav() {
  const { index, count } = useSyncExternalStore(
    slideNav.subscribe,
    slideNav.getSnapshot,
  )

  if (count < 2) return null

  return (
    // Mobile: a horizontal dot row centered at the bottom (carousel style) —
    // swipe drives navigation, so the chevrons are hidden. Desktop: the vertical
    // stack with up/down chevrons, bottom-right.
    <nav
      aria-label="Section navigation"
      className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 select-none flex-row items-center gap-3 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:flex-col"
    >
      <button
        type="button"
        aria-label="Previous section"
        disabled={index === 0}
        onClick={() => slideNav.goTo(index - 1)}
        className="hidden text-ink/40 transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-20 md:block"
      >
        <Chevron direction="up" />
      </button>

      <div className="flex flex-row items-center gap-2.5 md:flex-col">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to section ${i + 1}`}
            aria-current={i === index}
            onClick={() => slideNav.goTo(i)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'scale-125 bg-ink'
                : 'bg-ink/25 hover:bg-ink/50'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Next section"
        disabled={index === count - 1}
        onClick={() => slideNav.goTo(index + 1)}
        className="hidden text-ink/40 transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-20 md:block"
      >
        <Chevron direction="down" />
      </button>
    </nav>
  )
}

function Chevron({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === 'up' ? '' : 'rotate-180'}
      aria-hidden="true"
    >
      <path d="m6 15 6-6 6 6" />
    </svg>
  )
}
