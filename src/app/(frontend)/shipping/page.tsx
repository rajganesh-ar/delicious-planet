import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy — Delicious Planet',
  description:
    'Shipping scope, processing timelines, logistics handling, and delivery variables for Delicious Planet orders.',
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-mist/40 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">{label}</p>
      {children}
    </div>
  )
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-cream pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-6 lg:px-0">
        {/* Header */}
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">Policies</p>
        <h1 className="font-luxury text-4xl lg:text-[56px] font-light text-obsidian leading-[1.1] tracking-[-0.03em] m-0 mb-4">
          Shipping Policy
        </h1>
        <p className="text-stone text-sm m-0 mb-16">
          Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
        </p>

        <div className="space-y-10">
          <Section label="Scope">
            <p className="text-stone text-base leading-relaxed m-0 mb-4">
              Shipping availability varies based on product category, destination, and handling
              requirements. Not all products are available for delivery to all regions.
            </p>
            <p className="text-stone text-base leading-relaxed m-0">
              Delivery timelines depend on logistics routing and the specific characteristics of the
              products ordered.
            </p>
          </Section>

          <Section label="Processing">
            <p className="text-stone text-base leading-relaxed m-0 mb-4">
              Orders are processed according to product availability and operational timelines. You
              will receive a confirmation when your order has been dispatched.
            </p>
            <p className="text-stone text-base leading-relaxed m-0">
              Bulk and B2B orders may require additional processing coordination. Our team will be
              in touch to confirm lead times for larger volume orders.
            </p>
          </Section>

          <Section label="Logistics">
            <p className="text-stone text-base leading-relaxed m-0 mb-4">
              Shipping methods are selected based on product handling requirements and destination.
              Temperature-controlled logistics are applied where the product category requires it.
            </p>
            <p className="text-stone text-base leading-relaxed m-0">
              We work with controlled logistics partners to maintain product integrity throughout
              transit.
            </p>
          </Section>

          <Section label="Delivery Variables">
            <p className="text-stone text-base leading-relaxed m-0 mb-4">
              Actual delivery times are influenced by:
            </p>
            <ul className="list-none m-0 p-0 space-y-3">
              {[
                'Destination region',
                'Order volume',
                'Product handling needs',
                'Customs processing timelines',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  <span className="text-stone text-base">{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Questions">
            <p className="text-stone text-base leading-relaxed m-0">
              For shipping queries relating to a specific order or region, please{' '}
              <a href="/contact" className="text-gold no-underline hover:underline">
                contact us
              </a>
              . Response timelines vary depending on inquiry category.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
