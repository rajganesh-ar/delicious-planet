import type { Metadata } from 'next'
import { Container, Eyebrow, Heading, ProseText, Divider } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Shipping Policy — Delicious Planet',
  description:
    'Shipping scope, processing timelines, logistics handling, and delivery variables for Delicious Planet orders.',
}

function PolicySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Divider variant="hairline" tone="mist" className="mb-8 sm:mb-10" />
      <Eyebrow tone="forest" withLine={false} className="mb-4">
        {label}
      </Eyebrow>
      {children}
    </div>
  )
}

export default function ShippingPolicyPage() {
  return (
    <>
      <header className="relative bg-obsidian overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <Container size="lg" className="relative py-12 sm:py-16 md:py-20 lg:py-24">
          <Eyebrow tone="gold" className="mb-4">
            Policies
          </Eyebrow>
          <Heading as="h1" variant="display" className="text-cream m-0">
            Shipping Policy
          </Heading>
          <ProseText size="md" tone="cream" className="mt-4 mb-0 max-w-lg">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
          </ProseText>
        </Container>
      </header>

      <section className="bg-cream py-12 sm:py-16 md:py-20 lg:py-24">
        <Container size="md">
          <div className="space-y-10 sm:space-y-12">
            <PolicySection label="Scope">
              <ProseText size="md" className="m-0 mb-4">
                Shipping availability varies based on product category, destination, and handling
                requirements. Not all products are available for delivery to all regions.
              </ProseText>
              <ProseText size="md" className="m-0">
                Delivery timelines depend on logistics routing and the specific characteristics of the
                products ordered.
              </ProseText>
            </PolicySection>

            <PolicySection label="Processing">
              <ProseText size="md" className="m-0 mb-4">
                Orders are processed according to product availability and operational timelines. You
                will receive a confirmation when your order has been dispatched.
              </ProseText>
              <ProseText size="md" className="m-0">
                Bulk and B2B orders may require additional processing coordination. Our team will be
                in touch to confirm lead times for larger volume orders.
              </ProseText>
            </PolicySection>

            <PolicySection label="Logistics">
              <ProseText size="md" className="m-0 mb-4">
                Shipping methods are selected based on product handling requirements and destination.
                Temperature-controlled logistics are applied where the product category requires it.
              </ProseText>
              <ProseText size="md" className="m-0">
                We work with controlled logistics partners to maintain product integrity throughout
                transit.
              </ProseText>
            </PolicySection>

            <PolicySection label="Delivery Variables">
              <ProseText size="md" className="m-0 mb-4">
                Actual delivery times are influenced by:
              </ProseText>
              <ul className="list-none m-0 p-0 space-y-3">
                {[
                  'Destination region',
                  'Order volume',
                  'Product handling needs',
                  'Customs processing timelines',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-green mt-2 shrink-0" />
                    <ProseText as="span" size="md" tone="muted">
                      {item}
                    </ProseText>
                  </li>
                ))}
              </ul>
            </PolicySection>

            <PolicySection label="Questions">
              <ProseText size="md" className="m-0">
                For shipping queries relating to a specific order or region, please{' '}
                <a href="/contact" className="text-forest-green no-underline hover:underline">
                  contact us
                </a>
                . Response timelines vary depending on inquiry category.
              </ProseText>
            </PolicySection>
          </div>
        </Container>
      </section>
    </>
  )
}
