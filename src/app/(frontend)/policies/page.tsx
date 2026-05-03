import Link from 'next/link'
import type { Metadata } from 'next'
import { Container, Eyebrow, Heading, ProseText, Divider } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Policies — Delicious Planet',
  description:
    'Terms of service, privacy policy, returns, cancellation, and B2B terms for Delicious Planet.',
}

const policies = [
  {
    id: 'terms',
    title: 'Terms of Service',
    summary:
      'By accessing the Delicious Planet website and placing orders, you agree to our terms of service. These terms govern your use of our platform and purchasing relationship.',
    points: [
      'All prices are displayed in the selected currency and may vary by region.',
      'Delicious Planet reserves the right to update product listings and pricing without prior notice.',
      'Orders are subject to availability and confirmation of payment.',
      'We reserve the right to cancel orders where products are unavailable or where pricing errors have occurred.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    summary:
      'Your personal data is handled in accordance with applicable data protection regulations. We collect only the information necessary to fulfil your orders and improve your experience.',
    points: [
      'Personal data collected includes name, email, delivery address, and payment information.',
      'We do not sell personal data to third parties.',
      'Data is retained for as long as required to fulfil legal and operational obligations.',
      'You may request access to or deletion of your personal data by contacting us.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refund Policy',
    summary:
      'We are committed to the quality of every product we ship. If you receive a damaged or incorrect item, please contact us within 48 hours of delivery.',
    points: [
      'Returns are accepted for damaged or incorrectly dispatched items only.',
      'Perishable and temperature-controlled products cannot be returned once delivered.',
      'Refunds are processed to the original payment method within 7–10 business days.',
      'For B2B orders, returns are subject to the terms agreed at the time of order.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    summary:
      'Orders may be cancelled before dispatch. Once an order has been dispatched, cancellations cannot be processed.',
    points: [
      'To cancel an order, contact us as soon as possible after placing it.',
      'Cancellations are not guaranteed once order processing has begun.',
      'B2B and contract orders are subject to separate cancellation terms.',
    ],
  },
  {
    id: 'b2b-terms',
    title: 'B2B Terms',
    summary:
      'Business-to-business supply agreements are governed by individually negotiated terms. The following general principles apply unless otherwise specified in a written agreement.',
    points: [
      'Volume pricing, lead times, and payment terms are confirmed in writing prior to first delivery.',
      'Minimum order quantities apply and vary by product category.',
      'Supply continuity commitments are subject to producer availability and logistics conditions.',
      'Quality disputes must be raised within 48 hours of delivery with photographic documentation.',
    ],
  },
]

function PolicySection({ id, title, summary, points }: (typeof policies)[number]) {
  return (
    <div id={id} className="scroll-mt-32">
      <Divider variant="hairline" tone="mist" className="mb-8 sm:mb-10" />
      <Eyebrow tone="forest" withLine={false} className="mb-4">
        {title}
      </Eyebrow>
      <ProseText size="md" className="m-0 mb-6">
        {summary}
      </ProseText>
      {points.length > 0 && (
        <ul className="list-none m-0 p-0 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-green mt-2 shrink-0" />
              <ProseText as="span" size="sm" tone="muted">
                {point}
              </ProseText>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PoliciesPage() {
  return (
    <>
      <header className="relative bg-obsidian overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <Container size="lg" className="relative py-12 sm:py-16 md:py-20 lg:py-24">
          <Eyebrow tone="gold" className="mb-4">
            Legal
          </Eyebrow>
          <Heading as="h1" variant="display" className="text-cream m-0">
            Policies
          </Heading>
          <ProseText size="md" tone="cream" className="mt-4 mb-0 max-w-lg">
            Structured policies ensure clarity and consistency across transactions.
          </ProseText>
        </Container>
      </header>

      <section className="bg-cream py-12 sm:py-16 md:py-20 lg:py-24">
        <Container size="md">
          <nav className="flex flex-wrap gap-x-5 gap-y-3 mb-12 sm:mb-16 pb-6 sm:pb-8 border-b border-mist/60">
            {policies.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="text-[13px] sm:text-sm text-stone hover:text-forest-green transition-colors no-underline"
              >
                {p.title}
              </a>
            ))}
          </nav>

          <div className="space-y-10 sm:space-y-12">
            {policies.map((policy) => (
              <PolicySection key={policy.id} {...policy} />
            ))}

            <div className="scroll-mt-32">
              <Divider variant="hairline" tone="mist" className="mb-8 sm:mb-10" />
              <Eyebrow tone="forest" withLine={false} className="mb-4">
                Questions
              </Eyebrow>
              <ProseText size="md">
                For any questions regarding these policies, please{' '}
                <Link href="/contact" className="text-forest-green no-underline hover:underline">
                  contact us
                </Link>
                . Response timelines vary depending on inquiry category.
              </ProseText>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
