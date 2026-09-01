'use client'

import { HomeHero } from '@/components/sections/home/HomeHero'
import { HomeSidebar } from '@/components/sections/home/HomeSidebar'
import { RegionCards } from '@/components/sections/home/RegionCards'
import { ProductRail } from '@/components/sections/home/ProductRail'
import { FeaturedCollections } from '@/components/sections/home/FeaturedCollections'
import { TrustBadges } from '@/components/sections/home/TrustBadges'
import { CategoryTiles } from '@/components/sections/home/CategoryTiles'
import { ShopByCountry } from '@/components/sections/home/ShopByCountry'
import { DietaryStrip } from '@/components/sections/home/DietaryStrip'
import { BrandStrip } from '@/components/sections/home/BrandStrip'
import { TestimonialStrip } from '@/components/sections/home/TestimonialStrip'
import { StoryBanner } from '@/components/sections/home/StoryBanner'
import { NewsletterBar } from '@/components/sections/home/NewsletterBar'
import { BannerSlot } from '@/components/sections/home/BannerSlot'
import { ExperienceCarousel } from '@/components/sections/home/ExperienceCarousel'
import { CollectionCards } from '@/components/sections/CollectionCards'
import type { CountryCount } from '@/components/sections/home/ShopByCountry'
import type { DietaryCount } from '@/components/sections/home/DietaryStrip'
import type { Product, Category, ProductCollection, Testimonial, Banner } from '@/payload-types'

/** Banners grouped by their CMS `placement` value. */
export type BannerSlots = Record<string, Banner[]>

interface HomePageClientProps {
  bestSellers: Product[]
  /** Rows of tiles the Best Sellers rail renders at xl. */
  bestSellerRows: number
  newArrivals: Product[]
  /** Rows of tiles the New Arrivals rail renders at xl. */
  newArrivalRows: number
  /** Compact product list for the sticky sidebar. */
  sidebarPicks: Product[]
  regionCategories: Category[]
  featuredCollections: ProductCollection[]
  categoryCollections: ProductCollection[]
  countries: CountryCount[]
  dietaryFacets: DietaryCount[]
  testimonials: Testimonial[]
  banners: BannerSlots
}

export function HomePageClient({
  bestSellers,
  bestSellerRows,
  newArrivals,
  newArrivalRows,
  sidebarPicks,
  regionCategories,
  featuredCollections,
  categoryCollections,
  countries,
  dietaryFacets,
  testimonials,
  banners,
}: HomePageClientProps) {
  return (
    <>
      {/* Hero and newsletter stay full-bleed; everything between shares a
          two-column grid with the sticky sidebar. The container matches the
          footer's (px-6 lg:px-16, uncapped) so the navbar, the storefront and
          the footer all sit on the same left and right edges. */}
      <HomeHero />

      <div className="bg-cream">
        <div className="px-6 lg:px-16 flex gap-5 xl:gap-7 py-4 md:py-6">
          <HomeSidebar
            regionCategories={regionCategories}
            collections={[...featuredCollections, ...categoryCollections]}
            dietaryFacets={dietaryFacets}
            picks={sidebarPicks}
          />

          <div className="min-w-0 flex-1">
            <BannerSlot banners={banners['below-hero'] ?? []} />

            <RegionCards categories={regionCategories} />

            <ProductRail
              title="Best Sellers"
              products={bestSellers}
              href="/products?featured=true"
              rows={bestSellerRows}
            />

            <BannerSlot banners={banners['after-best-sellers'] ?? []} />

            <FeaturedCollections collections={featuredCollections} />

            <TrustBadges />

            <ProductRail
              title="New Arrivals"
              products={newArrivals}
              href="/products?sort=-createdAt"
              markNew
              rows={newArrivalRows}
            />

            <BannerSlot banners={banners['after-new-arrivals'] ?? []} />

            {/* Restored from the previous homepage */}
            <CollectionCards
              collections={[...featuredCollections, ...categoryCollections]}
              padded={false}
            />

            <ShopByCountry countries={countries} />

            <DietaryStrip facets={dietaryFacets} />

            <CategoryTiles collections={categoryCollections} />

            <BrandStrip />

            {/* Restored from the previous homepage */}
            <ExperienceCarousel />

            <TestimonialStrip testimonials={testimonials} />

            <StoryBanner />

            <BannerSlot banners={banners['before-newsletter'] ?? []} />
          </div>
        </div>
      </div>

      <NewsletterBar />
    </>
  )
}
