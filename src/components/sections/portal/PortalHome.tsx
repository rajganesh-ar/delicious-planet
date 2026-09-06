import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { BAND, Cta, Eyebrow, GUTTER, Point, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

/**
 * The partner portal's front door.
 *
 * Two audiences who arrive for opposite reasons — someone with product to sell
 * us, and someone who wants to cook with what we already carry — so the page
 * is two doors rather than one funnel. Each states plainly what it costs in
 * time and what happens after, because the commonest reason a long application
 * is abandoned is not knowing either.
 *
 * A server component: nothing here is interactive, so nothing here needs to
 * ship as JavaScript. styles.css declares unlayered `a`, `h1`–`h6` and `p`
 * rules that outrank Tailwind's layered utilities — colour on child spans,
 * margins with `!`.
 */

const DOORS = [
  {
    eyebrow: 'For producers & suppliers',
    title: 'Register as a vendor',
    lede: 'A structured application covering your company, what you supply, your compliance and your export readiness — everything our evaluation stage would otherwise ask for by email.',
    points: [
      'Seven steps, about fifteen minutes',
      'Answers saved as you move between steps',
      'A reference on submission, so you can follow progress',
    ],
    cta: { label: 'Start an application', href: '/portal/vendor' },
    secondary: { label: 'Check an existing one', href: '/portal/vendor/status' },
  },
  {
    eyebrow: 'For chefs & recipe developers',
    title: 'Register as a chef',
    lede: 'Publish recipes built from our catalogue. You pick each ingredient from the products we stock, give it a quantity and a unit, and every line becomes something a reader can order.',
    points: [
      'Three steps, about five minutes',
      'Write drafts privately, submit when you are ready',
      'Your byline, your authorship, reviewed before it goes live',
    ],
    cta: { label: 'Register as a chef', href: '/portal/chef/register' },
    secondary: { label: 'Already registered? Sign in', href: '/login?redirect=%2Fportal%2Fchef' },
  },
]

const ASSURANCES = [
  {
    title: 'Nothing is published without you',
    body: 'A vendor application is never public. A recipe stays private until you submit it and we have read it.',
  },
  {
    title: 'We answer either way',
    body: 'A decision comes by email, including when the answer is no — and, for a recipe, with a note about what would change it.',
  },
  {
    title: 'One login, both sides',
    body: 'A chef account is also a shop account. The same email works at checkout, on your orders and in the portal.',
  },
]

export function PortalHome() {
  return (
    <div className="bg-cream">
      {/* ═══ Masthead ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-9 md:pt-14 md:pb-11')}>
          <FadeIn>
            <Eyebrow tone="light">Partner portal</Eyebrow>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="m-0! mt-3! max-w-3xl">
              <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.25rem)]">
                Two ways to work with us.{' '}
                <span className="text-gold">Both start here.</span>
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="m-0! mt-4! font-sans text-cream/70 text-sm md:text-base leading-relaxed max-w-2xl">
              Whether you have something to supply or something to cook, this is where the
              conversation begins — with a form that asks everything once, rather than a thread that
              asks it six times.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ The two doors ══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {DOORS.map((door, index) => (
            <FadeIn key={door.title} delay={index * 0.07}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm p-5 md:p-7">
                <Eyebrow>{door.eyebrow}</Eyebrow>
                <h2 className="m-0! mt-2.5!">
                  <span className="block font-luxury text-xl md:text-2xl font-semibold text-obsidian leading-tight tracking-tight">
                    {door.title}
                  </span>
                </h2>
                <p className="m-0! mt-3! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
                  {door.lede}
                </p>

                <ul className="list-none m-0 p-0 mt-5 flex flex-col gap-2 flex-1">
                  {door.points.map((point) => (
                    <Point key={point}>{point}</Point>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Cta href={door.cta.href}>{door.cta.label}</Cta>
                  <Link href={door.secondary.href} className="no-underline">
                    <span className="font-sans text-[12.5px] text-forest-green hover:underline underline-offset-2">
                      {door.secondary.label}
                    </span>
                  </Link>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ What either one commits you to ═════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Before you start"
          title="What registering does, and what it does not"
          lede="Three things worth knowing, whichever door you came through."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-3 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {ASSURANCES.map((assurance, index) => (
            <li
              key={assurance.title}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-forest-green/60 leading-none">
                  0{index + 1}
                </span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  {assurance.title}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                {assurance.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ Neither one? ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-forest-green rounded-sm px-6 md:px-10 py-7 md:py-9 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-10">
            <div className="min-w-0">
              <Eyebrow tone="light">Buying rather than supplying?</Eyebrow>
              <span className="block font-luxury text-cream text-xl md:text-2xl font-semibold leading-tight tracking-tight mt-2">
                Restaurants, hotels and retailers go through the trade desk
              </span>
              <p className="m-0! mt-2.5! font-sans text-cream/75 text-[13px] leading-relaxed max-w-xl">
                Volume pricing and terms are agreed there, not here — this portal is for people
                supplying us, and for chefs publishing with us.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/b2b" variant="light">
                B2B solutions
              </Cta>
              <Cta href="/vendors" variant="outline">
                Our supplier standards
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
