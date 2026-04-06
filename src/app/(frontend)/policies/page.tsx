import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Policies — Delicious Planet',
  description:
    'Terms of service, privacy policy, returns, cancellation, and commercial terms for Delicious Planet.',
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
      'For commercial orders, returns are subject to the terms agreed at the time of order.',
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
      'Commercial and contract orders are subject to separate cancellation terms.',
    ],
  },
  {
    id: 'commercial-terms',
    title: 'Commercial Terms',
    summary:
      'Commercial supply agreements are governed by individually negotiated terms. The following general principles apply unless otherwise specified in a written agreement.',
    points: [
      'Volume pricing, lead times, and payment terms are confirmed in writing prior to first delivery.',
      'Minimum order quantities apply and vary by product category.',
      'Supply continuity commitments are subject to producer availability and logistics conditions.',
      'Quality disputes must be raised within 48 hours of delivery with photographic documentation.',
    ],
  },
]

function Section({ id, title, summary, points }: (typeof policies)[number]) {
  return (
    <div id={id} className="border-t border-mist/40 pt-10 scroll-mt-32">
      <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">{title}</p>
      <p className="text-stone text-base leading-relaxed m-0 mb-6">{summary}</p>
      {points.length > 0 && (
        <ul className="list-none m-0 p-0 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
              <span className="text-stone text-sm leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-cream pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-6 lg:px-0">
        {/* Header */}
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">Legal</p>
        <h1 className="font-luxury text-4xl lg:text-[56px] font-light text-obsidian leading-[1.1] tracking-[-0.03em] m-0 mb-4">
          Policies
        </h1>
        <p className="text-stone text-sm m-0 mb-10">
          Structured policies ensure clarity and consistency across transactions.
        </p>

        {/* Jump links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-3 mb-16 border-b border-mist/40 pb-8">
          {policies.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="text-sm text-stone hover:text-gold transition-colors no-underline"
            >
              {p.title}
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          {policies.map((policy) => (
            <Section key={policy.id} {...policy} />
          ))}

          {/* Contact */}
          <div className="border-t border-mist/40 pt-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
              Questions
            </p>
            <p className="text-stone text-base leading-relaxed m-0">
              For any questions regarding these policies, please{' '}
              <Link href="/contact" className="text-gold no-underline hover:underline">
                contact us
              </Link>
              . Response timelines vary depending on inquiry category.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
