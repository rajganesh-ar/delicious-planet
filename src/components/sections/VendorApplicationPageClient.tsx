'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'

const categoryOptions = [
  { label: 'Honey & Hive-Derived Products', value: 'honey' },
  { label: 'Olive Oil & Botanical Oils', value: 'oils' },
  { label: 'Dried Fruits', value: 'dried_fruits' },
  { label: 'Plant Extracts', value: 'plant_extracts' },
  { label: 'Specialty Culinary Ingredients', value: 'specialty_culinary' },
  { label: 'Natural Sweeteners', value: 'natural_sweeteners' },
  { label: 'Functional Agricultural Products', value: 'functional_agricultural' },
  { label: 'Other', value: 'other' },
]

const partnershipOptions = [
  { label: 'Direct Supply', value: 'direct_supply' },
  { label: 'Private Label Production', value: 'private_label' },
  { label: 'Regional Distribution', value: 'regional_distribution' },
  { label: 'Category-Specific Agreement', value: 'category_specific' },
]

const exportOptions = [
  { label: 'Yes — currently exporting', value: 'active' },
  { label: 'Yes — previous export experience', value: 'previous' },
  { label: 'No — seeking first export partner', value: 'none' },
]

const evaluationSteps = [
  {
    step: '01',
    title: 'Capability Overview Submission',
    detail: 'Complete this application form with your organization and product details.',
  },
  {
    step: '02',
    title: 'Product Specification Review',
    detail: 'Our team reviews submitted product specifications against category requirements.',
  },
  {
    step: '03',
    title: 'Documentation Assessment',
    detail:
      'Certifications, traceability records, and technical sheets are evaluated for completeness.',
  },
  {
    step: '04',
    title: 'Sample Evaluation',
    detail: 'Product samples are assessed for quality, consistency, and specification compliance.',
  },
  {
    step: '05',
    title: 'Production Feasibility Confirmation',
    detail: 'Capacity and supply continuity are verified against projected demand requirements.',
  },
  {
    step: '06',
    title: 'Trial Order Execution',
    detail:
      'A structured trial shipment validates logistics, packaging integrity, and delivery timelines.',
  },
  {
    step: '07',
    title: 'Structured Supply Activation',
    detail:
      'Formal partnership agreements are established with defined terms and supply schedules.',
  },
]

const inputClasses =
  'w-full bg-white border border-stone/20 rounded-sm px-4 py-3 text-obsidian text-sm leading-relaxed placeholder:text-stone/40 focus:outline-none focus:border-obsidian focus:ring-1 focus:ring-obsidian/10 transition-colors'
const labelClasses = 'block text-obsidian text-sm font-medium mb-1.5'
const helperClasses = 'text-stone/60 text-xs mt-1'

export function VendorApplicationPageClient() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState('submitting')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)

    const data = {
      company: formData.get('company') as string,
      contactName: formData.get('contactName') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      country: formData.get('country') as string,
      category: selectedCategories,
      partnershipType: formData.get('partnershipType') as string,
      annualCapacity: (formData.get('annualCapacity') as string) || undefined,
      certifications: (formData.get('certifications') as string) || undefined,
      exportExperience: (formData.get('exportExperience') as string) || undefined,
      productDescription: formData.get('productDescription') as string,
      additionalInformation: (formData.get('additionalInformation') as string) || undefined,
    }

    try {
      const res = await fetch('/api/vendor-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.errors?.[0]?.message || 'Submission failed. Please try again.')
      }

      setFormState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center bg-white">
          <div className="max-w-lg mx-auto px-6 text-center">
            <FadeIn>
              <div className="w-16 h-16 rounded-full bg-obsidian flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-7 h-7 text-cream"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-heading text-2xl font-semibold text-obsidian m-0 mb-4">
                Application Received
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base leading-relaxed m-0 mb-3">
                Thank you for submitting your vendor application. Our procurement team will review
                your submission and respond according to category demand and documentation
                completeness.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone/60 text-sm leading-relaxed m-0 mb-8">
                You will receive a confirmation at the email address provided. If additional
                documentation is required, our team will reach out directly.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Link
                href="/vendors"
                className="inline-block bg-obsidian text-cream text-sm font-medium uppercase tracking-widest px-8 py-3.5 rounded-sm no-underline hover:bg-charcoal transition-colors"
              >
                Return to Vendors &amp; Partnerships
              </Link>
            </FadeIn>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <section className="bg-obsidian pt-32 pb-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <motion.p
              className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Vendor Application
            </motion.p>
            <motion.h1
              className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-semibold text-cream leading-[1.15] tracking-tight m-0 mb-5"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Submit Capability Documentation
            </motion.h1>
            <motion.p
              className="text-cream/60 text-base lg:text-lg leading-relaxed m-0 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Complete this form to begin the vendor evaluation process. All fields marked with an
              asterisk are required. Applications are reviewed based on category demand and
              documentation completeness.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Evaluation Process Overview */}
      <section className="bg-neutral-50 py-(--spacing-section) border-b border-stone/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-6 h-px bg-obsidian" />
              <p className="text-xs uppercase tracking-[0.3em] text-obsidian font-semibold m-0">
                Evaluation Pathway
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {evaluationSteps.map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.05}>
                <div className="bg-white p-5 rounded-sm border border-stone/10 h-full">
                  <span className="text-obsidian text-xs font-bold tracking-wider mb-2 block">
                    {item.step}
                  </span>
                  <h3 className="font-heading text-xs font-semibold text-obsidian m-0 mb-1.5 uppercase tracking-wide leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-stone text-xs leading-relaxed m-0">{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-white py-(--spacing-section-lg)">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            {/* Sidebar */}
            <div className="lg:w-80 shrink-0">
              <FadeIn>
                <div className="lg:sticky lg:top-32">
                  <p className="text-xs uppercase tracking-[0.3em] text-obsidian font-semibold mb-3">
                    Application Guidelines
                  </p>
                  <div className="w-6 h-px bg-obsidian mb-6" />

                  <div className="space-y-5 text-sm text-stone leading-relaxed">
                    <p className="m-0">
                      Provide accurate organizational and production details. Incomplete
                      applications may delay the review process.
                    </p>
                    <p className="m-0">
                      If you operate across multiple product categories, select all that apply.
                      Category-specific questions may follow during the review stage.
                    </p>
                    <p className="m-0">
                      Documentation such as certifications, laboratory reports, and technical sheets
                      may be requested after initial review.
                    </p>
                  </div>

                  <div className="mt-8 p-5 bg-neutral-50 rounded-sm border border-stone/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-obsidian font-semibold m-0 mb-3">
                      Required Documents
                    </p>
                    <p className="text-stone text-xs leading-relaxed m-0 mb-3">
                      The following may be requested during evaluation:
                    </p>
                    <ul className="space-y-2 list-none m-0 p-0">
                      {[
                        'Product specification sheets',
                        'Certifications (ISO, HACCP, organic, etc.)',
                        'Laboratory analysis reports',
                        'Traceability documentation',
                        'Export compliance records',
                        'Production capacity overview',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-stone text-xs">
                          <span className="w-1 h-1 rounded-full bg-obsidian mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/vendors"
                      className="text-sm text-stone hover:text-obsidian underline transition-colors"
                    >
                      &larr; Back to Vendors &amp; Partnerships
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Form */}
            <div className="flex-1">
              <FadeIn delay={0.1}>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Organization Information */}
                  <fieldset className="m-0 p-0 border-0">
                    <legend className="text-xs uppercase tracking-[0.2em] text-obsidian font-semibold mb-6 pb-3 border-b border-stone/10 w-full block">
                      Organization Information
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="company" className={labelClasses}>
                          Company Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          required
                          className={inputClasses}
                          placeholder="Organization legal name"
                        />
                      </div>
                      <div>
                        <label htmlFor="contactName" className={labelClasses}>
                          Contact Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          id="contactName"
                          name="contactName"
                          required
                          className={inputClasses}
                          placeholder="Full name of primary contact"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className={labelClasses}>
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className={inputClasses}
                          placeholder="business@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className={labelClasses}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className={inputClasses}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div>
                        <label htmlFor="website" className={labelClasses}>
                          Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          className={inputClasses}
                          placeholder="https://www.example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className={labelClasses}>
                          Country of Operation <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          required
                          className={inputClasses}
                          placeholder="Country where primary production is based"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Supply Details */}
                  <fieldset className="m-0 p-0 border-0">
                    <legend className="text-xs uppercase tracking-[0.2em] text-obsidian font-semibold mb-6 pb-3 border-b border-stone/10 w-full block">
                      Supply Details
                    </legend>

                    <div className="space-y-5">
                      <div>
                        <p className={labelClasses}>
                          Product Categories <span className="text-red-600">*</span>
                        </p>
                        <p className={helperClasses + ' mb-3'}>
                          Select all product categories relevant to your supply capability.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {categoryOptions.map((opt) => (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                                selectedCategories.includes(opt.value)
                                  ? 'border-obsidian bg-obsidian/5'
                                  : 'border-stone/15 hover:border-stone/30'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(opt.value)}
                                onChange={() => toggleCategory(opt.value)}
                                className="w-4 h-4 accent-obsidian"
                              />
                              <span className="text-sm text-obsidian">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="partnershipType" className={labelClasses}>
                            Partnership Type <span className="text-red-600">*</span>
                          </label>
                          <select
                            id="partnershipType"
                            name="partnershipType"
                            required
                            className={inputClasses}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select partnership structure
                            </option>
                            {partnershipOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="exportExperience" className={labelClasses}>
                            Export Experience
                          </label>
                          <select
                            id="exportExperience"
                            name="exportExperience"
                            className={inputClasses}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select export status
                            </option>
                            {exportOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="annualCapacity" className={labelClasses}>
                          Estimated Annual Capacity
                        </label>
                        <input
                          type="text"
                          id="annualCapacity"
                          name="annualCapacity"
                          className={inputClasses}
                          placeholder="e.g., 50,000 kg / year or 10,000 units / month"
                        />
                        <p className={helperClasses}>
                          Approximate production capacity relevant to the proposed supply.
                        </p>
                      </div>
                    </div>
                  </fieldset>

                  {/* Product & Capability Information */}
                  <fieldset className="m-0 p-0 border-0">
                    <legend className="text-xs uppercase tracking-[0.2em] text-obsidian font-semibold mb-6 pb-3 border-b border-stone/10 w-full block">
                      Product &amp; Capability Information
                    </legend>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="productDescription" className={labelClasses}>
                          Product Description <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id="productDescription"
                          name="productDescription"
                          required
                          rows={5}
                          className={inputClasses}
                          placeholder="Describe your primary products proposed for supply, including specifications, packaging formats, and any relevant quality indicators."
                        />
                        <p className={helperClasses}>
                          Include details on product specifications, grades, and available packaging
                          formats.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="certifications" className={labelClasses}>
                          Certifications &amp; Compliance
                        </label>
                        <textarea
                          id="certifications"
                          name="certifications"
                          rows={3}
                          className={inputClasses}
                          placeholder="e.g., ISO 22000, HACCP, EU Organic, USDA Organic, Fair Trade, BRC, IFS..."
                        />
                        <p className={helperClasses}>
                          List all relevant food safety, quality, and agricultural certifications.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="additionalInformation" className={labelClasses}>
                          Additional Information
                        </label>
                        <textarea
                          id="additionalInformation"
                          name="additionalInformation"
                          rows={4}
                          className={inputClasses}
                          placeholder="Distribution history, target markets, existing export relationships, or any other relevant context for this application."
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Error display */}
                  {formState === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
                      <p className="text-red-700 text-sm m-0">{errorMessage}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-4 border-t border-stone/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <p className="text-stone/60 text-xs m-0 max-w-sm">
                        By submitting this application, you confirm that the information provided is
                        accurate and consent to its review by the Delicious Planet procurement team.
                      </p>
                      <button
                        type="submit"
                        disabled={formState === 'submitting' || selectedCategories.length === 0}
                        className="inline-flex items-center bg-obsidian text-cream text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {formState === 'submitting' ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-cream"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Image section */}
      <section className="bg-neutral-50 py-(--spacing-section) border-t border-stone/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Production Facility',
                src: '/images/vendor/vendor-processing.avif',
                alt: 'Vendor production facility',
              },
              {
                label: 'Quality Control',
                src: '/images/vendor/vendor-female.avif',
                alt: 'Quality control and inspection',
              },
              {
                label: 'Global Supply',
                src: '/images/vendor/vendor-farm-road.avif',
                alt: 'Global supply chain and distribution',
              },
            ].map((item) => (
              <FadeIn key={item.label}>
                <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 to-transparent" />
                  <p className="absolute bottom-4 left-4 text-xs font-semibold text-cream uppercase tracking-wider m-0">
                    {item.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="bg-white py-12 border-t border-stone/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <p className="text-stone/60 text-sm leading-relaxed m-0">
                For general inquiries or questions about the vendor evaluation process, contact us
                through our{' '}
                <Link href="/contact" className="text-obsidian hover:text-charcoal underline">
                  contact page
                </Link>
                . Review timelines vary based on application volume and category complexity.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  )
}
