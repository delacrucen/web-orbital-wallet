import appleBadge from '../assets/images/logos/apple-download.svg'
import googleBadge from '../assets/images/logos/google-download.png'
import { APP_STORES } from '../config/appStores'

/**
 * Official App Store + Google Play download badges, rendered at equal height.
 * The `gap-4` between them clears both brands' clear-space guidelines (Google's
 * is the stricter — ≥ ¼ of the badge height; 16px against a 48px badge).
 */
export function StoreBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a
        href={APP_STORES.ios}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Descargar en el App Store"
        className="inline-block transition-opacity hover:opacity-90"
      >
        <img
          src={appleBadge}
          alt="Descargar en el App Store"
          className="h-10 w-auto sm:h-12"
        />
      </a>
      <a
        href={APP_STORES.android}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Disponible en Google Play"
        className="inline-block transition-opacity hover:opacity-90"
      >
        <img
          src={googleBadge}
          alt="Disponible en Google Play"
          className="h-10 w-auto sm:h-12"
        />
      </a>
    </div>
  )
}
