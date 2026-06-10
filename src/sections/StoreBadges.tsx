import appleBadge from '../assets/images/logos/apple-download.svg'
import googleBadge from '../assets/images/logos/google-download.png'

// Wire these to the real store listings when available.
const APP_STORE_URL = '#'
const PLAY_STORE_URL = '#'

/**
 * Official App Store + Google Play download badges, rendered at equal height.
 * The `gap-4` between them clears both brands' clear-space guidelines (Google's
 * is the stricter — ≥ ¼ of the badge height; 16px against a 48px badge).
 */
export function StoreBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a
        href={APP_STORE_URL}
        aria-label="Descargar en el App Store"
        className="inline-block transition-opacity hover:opacity-90"
      >
        <img
          src={appleBadge}
          alt="Descargar en el App Store"
          className="h-12 w-auto"
        />
      </a>
      <a
        href={PLAY_STORE_URL}
        aria-label="Disponible en Google Play"
        className="inline-block transition-opacity hover:opacity-90"
      >
        <img
          src={googleBadge}
          alt="Disponible en Google Play"
          className="h-12 w-auto"
        />
      </a>
    </div>
  )
}
