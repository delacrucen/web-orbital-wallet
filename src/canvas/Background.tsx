/**
 * Fixed background layer that sits BEHIND the canvas (z-0). The phone canvas
 * (z-10) renders over this with a transparent clear, and the marketing copy
 * (z-20) sits over both. Sections must stay transparent so the phone shows
 * through.
 *
 * For now: a dark base with a soft red brand glow up top (echoes the app's
 * coral home screen). Phase 4 replaces/augments this with the starfield.
 */
export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#05050a]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_-15%,rgba(176,40,40,0.55)_0%,rgba(42,13,16,0.35)_38%,rgba(5,5,10,0)_70%)]" />
    </div>
  )
}
