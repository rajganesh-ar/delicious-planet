'use client'

import { HomeHero } from '@/components/sections/home/HomeHero'
import { HomeSidebar } from '@/components/sections/home/HomeSidebar'
import { RegionCards } from '@/components/sections/home/RegionCards'
import { ProductRail } from '@/components/sections/home/ProductRail'
import { TrustBadges } from '@/components/sections/home/TrustBadges'
import { ShopByCountry } from '@/components/sections/home/ShopByCountry'
import { DietaryStrip } from '@/components/sections/home/DietaryStrip'
import { BrandStrip } from '@/components/sections/home/BrandStrip'
import { TestimonialStrip } from '@/components/sections/home/TestimonialStrip'
import { StoryBanner } from '@/components/sections/home/StoryBanner'
import { NewsletterBar } from '@/components/sections/home/NewsletterBar'
import { BannerSlot } from '@/components/sections/home/BannerSlot'
import { ExperienceCarousel } from '@/components/sections/home/ExperienceCarousel'
import { CategoryCards } from '@/components/sections/CategoryCards'
import type { Region } from '@/lib/regions'
import type { BrandMark } from '@/lib/brand-marks'
import type { CountryCount } from '@/components/sections/home/ShopByCountry'
import type { DietaryCount } from '@/components/sections/home/DietaryStrip'
import type { Product, Category, Testimonial, Banner } from '@/payload-types'

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
  /** Departments, for the sidebar and the single Shop by Category carousel. */
  categories: Category[]
  /** Resolved region cards — CMS rows merged over the bundled defaults. */
  regions: Region[]
  countries: CountryCount[]
  dietaryFacets: DietaryCount[]
  testimonials: Testimonial[]
  banners: BannerSlots
  /** Resolved brand marks — CMS logos, falling back to bundled artwork. */
  brandMarks: BrandMark[]
}

export function HomePageClient({
  bestSellers,
  bestSellerRows,
  newArrivals,
  newArrivalRows,
  sidebarPicks,
  categories,
  regions,
  countries,
  dietaryFacets,
  testimonials,
  banners,
  brandMarks,
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
            categories={categories}
            regions={regions}
            dietaryFacets={dietaryFacets}
            picks={sidebarPicks}
          />

          <div className="min-w-0 flex-1">
            <BannerSlot banners={banners['below-hero'] ?? []} />

            <RegionCards regions={regions} />

            <ProductRail
              title="Best Sellers"
              products={bestSellers}
              href="/products?featured=true"
              rows={bestSellerRows}
            />

            <BannerSlot banners={banners['after-best-sellers'] ?? []} />

            {/* The one category section on the page — every department, in the
                order the CMS sorts them. `padded` is off because the storefront
                column already supplies the horizontal gutters. */}
            <CategoryCards categories={categories} padded={false} />

            <TrustBadges />

            <ProductRail
              title="New Arrivals"
              products={newArrivals}
              href="/products?sort=-createdAt"
              markNew
              rows={newArrivalRows}
            />

            <BannerSlot banners={banners['after-new-arrivals'] ?? []} />

            <ShopByCountry countries={countries} />

            <DietaryStrip facets={dietaryFacets} />

            <BrandStrip marks={brandMarks} />

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
