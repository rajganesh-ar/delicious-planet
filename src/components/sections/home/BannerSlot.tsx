import { PromoBanner } from './PromoBanner'
import type { Banner } from '@/payload-types'

interface BannerSlotProps {
  banners: Banner[]
}

/**
 * Renders every banner an editor pinned to one homepage slot. `split` banners
 * pair up two-across; `wide` and `strip` stack full width.
 */
export function BannerSlot({ banners }: BannerSlotProps) {
  if (banners.length === 0) return null

  const splits = banners.filter((b) => b.variant === 'split')
  const rest = banners.filter((b) => b.variant !== 'split')

  return (
    <section className="py-4 md:py-6 flex flex-col gap-3 md:gap-4">
      {rest.map((banner) => (
        <PromoBanner key={banner.id} banner={banner} />
      ))}

      {splits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {splits.map((banner) => (
            <PromoBanner key={banner.id} banner={banner} />
          ))}
        </div>
      )}
    </section>
  )
}
