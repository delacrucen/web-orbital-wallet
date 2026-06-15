/**
 * Tiny shared open/close state for the "Descargar App" modal, so any trigger
 * (header CTA, footer CTA) can open the single modal instance. Same external-
 * store pattern as the scroll/nav bridges — read via useSyncExternalStore.
 */

type Listener = () => void

let isOpen = false
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l()
}

export const downloadModal = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot(): boolean {
    return isOpen
  },
  set(next: boolean) {
    if (next === isOpen) return
    isOpen = next
    emit()
  },
  open() {
    downloadModal.set(true)
  },
  close() {
    downloadModal.set(false)
  },
}
