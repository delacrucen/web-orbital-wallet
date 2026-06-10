/**
 * Bridge between the scroll engine (`SmoothScroll`) and React nav UI
 * (`SlideNav`). `SmoothScroll` owns the Lenis instance and section list; it
 * registers a `goTo` and pushes the active index/count here. The nav component
 * subscribes via `useSyncExternalStore` to render dots + arrows and to drive
 * navigation on click.
 */

type Listener = () => void

interface SlideNavState {
  /** Active section index. */
  index: number
  /** Total `[data-snap]` sections. */
  count: number
}

let state: SlideNavState = { index: 0, count: 0 }
const listeners = new Set<Listener>()
let goToFn: (index: number) => void = () => {}

function emit() {
  for (const l of listeners) l()
}

export const slideNav = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  /** Stable reference between changes — required by useSyncExternalStore. */
  getSnapshot(): SlideNavState {
    return state
  },
  /** Called by SmoothScroll when index/count change. No-op if unchanged. */
  set(next: Partial<SlideNavState>) {
    if (
      (next.index === undefined || next.index === state.index) &&
      (next.count === undefined || next.count === state.count)
    ) {
      return
    }
    state = { ...state, ...next }
    emit()
  },
  /** SmoothScroll registers its section-scroll handler here. */
  registerGoTo(fn: (index: number) => void) {
    goToFn = fn
  },
  /** UI asks to navigate to a section. */
  goTo(index: number) {
    goToFn(index)
  },
}
