'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { Cta, GUTTER } from '@/components/sections/editorial'
import {
  AddRowButton,
  Alert,
  areaClass,
  CheckboxRow,
  ChipSelect,
  Field,
  FieldGrid,
  FieldsetHead,
  fieldClass,
  GhostButton,
  PrimaryButton,
  RepeatableRow,
  SelectField,
} from './PortalForm'
import { PortalMasthead, PortalPanel, StepRail, type PortalStep } from './PortalShell'
import { COUNTRY_OPTIONS } from '@/lib/countries'
import {
  ANNUAL_TURNOVER,
  BUSINESS_TYPES,
  CERTIFICATIONS,
  CURRENCIES,
  EMPLOYEE_BANDS,
  HOW_HEARD,
  INCOTERMS,
  LEAD_TIME_BANDS,
  PAYMENT_TERMS,
  TEMPERATURE_REGIMES,
  TRACEABILITY_LEVELS,
} from '@/lib/portal-options'
import { cn } from '@/lib/cn'

/**
 * The vendor questionnaire.
 *
 * /vendors publishes four entry requirements and a four-stage onboarding
 * journey; this is the form that starts it. It is long on purpose — every
 * question here is one the evaluation stage would otherwise have to ask in a
 * follow-up email, and a supplier who cannot answer them is a supplier the
 * process would have turned away at stage two anyway.
 *
 * Length is managed rather than hidden. Seven steps, each a single screen, the
 * required questions first and the optional detail after; a step is validated
 * before it will advance, so nothing is discovered to be wrong at the end. The
 * rail keeps completed steps clickable, and the answers live in one state
 * object that no step resets — moving back and forth costs nothing.
 */

type Reference = {
  company: string
  contactName: string
  email: string
  phone: string
  relationship: string
}

const emptyReference = (): Reference => ({
  company: '',
  contactName: '',
  email: '',
  phone: '',
  relationship: '',
})

interface FormState {
  companyName: string
  tradingName: string
  businessType: string
  website: string
  yearEstablished: string
  registrationNumber: string
  taxId: string
  employeeBand: string
  annualTurnover: string
  companyProfile: string

  contactName: string
  contactRole: string
  email: string
  phone: string
  whatsapp: string
  preferredContact: string
  country: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  productionSites: string

  categories: string[]
  productSummary: string
  brandsOwned: string
  monthlyCapacity: string
  minimumOrder: string
  leadTime: string
  shelfLifeMonths: string
  temperatureRegimes: string[]
  packagingFormats: string
  seasonality: string
  privateLabelCapable: boolean
  samplesAvailable: boolean

  certifications: string[]
  traceability: string
  recallProcedure: boolean
  lastAuditBody: string
  foodSafetyNotes: string
  noForcedOrChildLabour: boolean
  safeWorkingConditions: boolean
  labourLawCompliance: boolean
  ethicsNotes: string
  productLiability: boolean
  insurer: string
  coverAmount: string
  sustainability: string

  exportsToday: boolean
  exportMarkets: string
  gccExperience: boolean
  uaeRegistered: boolean
  incoterms: string[]
  portsOfLoading: string
  coldChainCapable: boolean
  logisticsNotes: string

  currencies: string[]
  paymentTerms: string[]
  openToExclusivity: boolean
  marketingSupport: string
  references: Reference[]
  howHeard: string
  additionalNotes: string

  signatoryName: string
  signatoryRole: string
  declarationAccepted: boolean
  consentContact: boolean
}

const INITIAL: FormState = {
  companyName: '',
  tradingName: '',
  businessType: '',
  website: '',
  yearEstablished: '',
  registrationNumber: '',
  taxId: '',
  employeeBand: '',
  annualTurnover: '',
  companyProfile: '',
  contactName: '',
  contactRole: '',
  email: '',
  phone: '',
  whatsapp: '',
  preferredContact: 'email',
  country: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  productionSites: '',
  categories: [],
  productSummary: '',
  brandsOwned: '',
  monthlyCapacity: '',
  minimumOrder: '',
  leadTime: '',
  shelfLifeMonths: '',
  temperatureRegimes: [],
  packagingFormats: '',
  seasonality: '',
  privateLabelCapable: false,
  samplesAvailable: false,
  certifications: [],
  traceability: '',
  recallProcedure: false,
  lastAuditBody: '',
  foodSafetyNotes: '',
  noForcedOrChildLabour: false,
  safeWorkingConditions: false,
  labourLawCompliance: false,
  ethicsNotes: '',
  productLiability: false,
  insurer: '',
  coverAmount: '',
  sustainability: '',
  exportsToday: false,
  exportMarkets: '',
  gccExperience: false,
  uaeRegistered: false,
  incoterms: [],
  portsOfLoading: '',
  coldChainCapable: false,
  logisticsNotes: '',
  currencies: [],
  paymentTerms: [],
  openToExclusivity: false,
  marketingSupport: '',
  references: [emptyReference()],
  howHeard: '',
  additionalNotes: '',
  signatoryName: '',
  signatoryRole: '',
  declarationAccepted: false,
  consentContact: false,
}

const STEPS: PortalStep[] = [
  { key: 'company', label: 'Company' },
  { key: 'contact', label: 'Contact' },
  { key: 'supply', label: 'What you supply' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'export', label: 'Export readiness' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'declaration', label: 'Declaration' },
]

const PREFERRED_CONTACT = [
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'WhatsApp', value: 'whatsapp' },
]

interface CategoryOption {
  id: number
  title: string
  slug: string
}

/** Validation is per step, so an error is shown beside the step that caused it. */
function validateStep(step: number, form: FormState): string | null {
  switch (step) {
    case 0:
      if (!form.companyName.trim()) return 'Please enter the registered company name.'
      if (!form.businessType) return 'Please choose the kind of business this is.'
      if (form.companyProfile.trim().length < 40) {
        return 'Please describe the business in a little more detail — a couple of sentences is plenty.'
      }
      return null
    case 1:
      if (!form.contactName.trim()) return 'Please give us a name to write back to.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return 'Please enter a valid email address.'
      }
      if (!form.phone.trim()) return 'Please enter a phone number.'
      if (!form.country) return 'Please choose the country you operate from.'
      return null
    case 2:
      if (form.productSummary.trim().length < 20) {
        return 'Please tell us what you would supply, in a sentence or two.'
      }
      return null
    case 3:
      if (!form.traceability) return 'Please tell us what level your traceability reaches.'
      return null
    case 6:
      if (!form.signatoryName.trim()) return 'Please enter the name of the person declaring this.'
      if (!form.signatoryRole.trim()) return 'Please enter their position in the company.'
      if (!form.declarationAccepted) return 'Please confirm the declaration before submitting.'
      return null
    default:
      return null
  }
}

export function VendorApplicationForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [step, setStep] = useState(0)
  const [furthest, setFurthest] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /**
   * The catalogue's own categories, so "what would you supply" maps onto where
   * it would actually sit rather than onto a hand-kept list that drifts.
   * A failure here is silent by design: the field is optional, and an
   * application must not be blocked by a listing request.
   */
  useEffect(() => {
    let cancelled = false
    fetch('/api/categories?limit=200&depth=0&sort=title')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.docs) return
        setCategories(
          (data.docs as CategoryOption[]).filter((doc) => doc?.title).map((doc) => ({
            id: doc.id,
            title: doc.title,
            slug: doc.slug,
          })),
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.title, value: String(category.id) })),
    [categories],
  )

  const goTo = (next: number) => {
    setError(null)
    setStep(next)
    setFurthest((prev) => Math.max(prev, next))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const advance = () => {
    const problem = validateStep(step, form)
    if (problem) {
      setError(problem)
      return
    }
    goTo(Math.min(step + 1, STEPS.length - 1))
  }

  async function submit() {
    const problem = validateStep(6, form)
    if (problem) {
      setError(problem)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/portal/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          tradingName: form.tradingName,
          businessType: form.businessType,
          website: form.website,
          yearEstablished: form.yearEstablished,
          registrationNumber: form.registrationNumber,
          taxId: form.taxId,
          employeeBand: form.employeeBand,
          annualTurnover: form.annualTurnover,
          companyProfile: form.companyProfile,
          contactName: form.contactName,
          contactRole: form.contactRole,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          preferredContact: form.preferredContact,
          country: form.country,
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
          },
          productionSites: form.productionSites,
          categories: form.categories.map(Number),
          productSummary: form.productSummary,
          brandsOwned: form.brandsOwned,
          monthlyCapacity: form.monthlyCapacity,
          minimumOrder: form.minimumOrder,
          leadTime: form.leadTime,
          shelfLifeMonths: form.shelfLifeMonths,
          temperatureRegimes: form.temperatureRegimes,
          packagingFormats: form.packagingFormats,
          seasonality: form.seasonality,
          privateLabelCapable: form.privateLabelCapable,
          samplesAvailable: form.samplesAvailable,
          certifications: form.certifications,
          traceability: form.traceability,
          recallProcedure: form.recallProcedure,
          lastAuditBody: form.lastAuditBody,
          foodSafetyNotes: form.foodSafetyNotes,
          ethics: {
            noForcedOrChildLabour: form.noForcedOrChildLabour,
            safeWorkingConditions: form.safeWorkingConditions,
            labourLawCompliance: form.labourLawCompliance,
            notes: form.ethicsNotes,
          },
          insurance: {
            productLiability: form.productLiability,
            insurer: form.insurer,
            coverAmount: form.coverAmount,
          },
          sustainability: form.sustainability,
          exportsToday: form.exportsToday,
          exportMarkets: form.exportMarkets,
          gccExperience: form.gccExperience,
          uaeRegistered: form.uaeRegistered,
          incoterms: form.incoterms,
          portsOfLoading: form.portsOfLoading,
          coldChainCapable: form.coldChainCapable,
          logisticsNotes: form.logisticsNotes,
          currencies: form.currencies,
          paymentTerms: form.paymentTerms,
          openToExclusivity: form.openToExclusivity,
          marketingSupport: form.marketingSupport,
          references: form.references.filter((entry) => entry.company.trim()),
          howHeard: form.howHeard,
          additionalNotes: form.additionalNotes,
          signatoryName: form.signatoryName,
          signatoryRole: form.signatoryRole,
          declarationAccepted: form.declarationAccepted,
          consentContact: form.consentContact,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'We could not submit that. Please try again.')
        return
      }

      setReference(data.reference ?? '')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Something went wrong on the way to us. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (reference !== null) {
    return <SubmittedPanel reference={reference} company={form.companyName} />
  }

  return (
    <div className="bg-cream min-h-[70vh]">
      <PortalMasthead
        eyebrow="Vendor registration"
        title={
          <>
            Apply to supply <span className="text-gold">Delicious Planet</span>
          </>
        }
        lede="Seven steps, about fifteen minutes. Everything here is what our evaluation stage would otherwise ask you for by email — answering it once, up front, is what lets us give you a real answer rather than a holding one."
        back={{ href: '/portal', label: 'Partner portal' }}
      />

      <div className={cn(GUTTER, 'py-7 md:py-10')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          <div className="lg:col-span-3">
            <StepRail steps={STEPS} current={step} furthest={furthest} onSelect={goTo} />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-4">
            {error ? <Alert>{error}</Alert> : null}

            {step === 0 ? (
              <PortalPanel
                title="The company"
                blurb="Who is applying, and what kind of operation sits behind it."
              >
                <FieldGrid>
                  <Field label="Registered company name" htmlFor="v-company" required>
                    <input
                      id="v-company"
                      className={fieldClass}
                      value={form.companyName}
                      onChange={(e) => set('companyName', e.target.value)}
                      autoComplete="organization"
                    />
                  </Field>
                  <Field label="Trading name" htmlFor="v-trading" hint="If it differs from the above.">
                    <input
                      id="v-trading"
                      className={fieldClass}
                      value={form.tradingName}
                      onChange={(e) => set('tradingName', e.target.value)}
                    />
                  </Field>
                  <Field label="Kind of business" htmlFor="v-type" required>
                    <SelectField
                      id="v-type"
                      value={form.businessType}
                      onChange={(value) => set('businessType', value)}
                      options={BUSINESS_TYPES}
                    />
                  </Field>
                  <Field label="Website" htmlFor="v-website">
                    <input
                      id="v-website"
                      className={fieldClass}
                      value={form.website}
                      onChange={(e) => set('website', e.target.value)}
                      placeholder="https://"
                      inputMode="url"
                    />
                  </Field>
                  <Field label="Year established" htmlFor="v-year">
                    <input
                      id="v-year"
                      className={fieldClass}
                      value={form.yearEstablished}
                      onChange={(e) => set('yearEstablished', e.target.value)}
                      inputMode="numeric"
                      placeholder="1998"
                    />
                  </Field>
                  <Field label="Company registration number" htmlFor="v-reg">
                    <input
                      id="v-reg"
                      className={fieldClass}
                      value={form.registrationNumber}
                      onChange={(e) => set('registrationNumber', e.target.value)}
                    />
                  </Field>
                  <Field label="VAT / tax identification" htmlFor="v-tax">
                    <input
                      id="v-tax"
                      className={fieldClass}
                      value={form.taxId}
                      onChange={(e) => set('taxId', e.target.value)}
                    />
                  </Field>
                  <Field label="Employees" htmlFor="v-employees">
                    <SelectField
                      id="v-employees"
                      value={form.employeeBand}
                      onChange={(value) => set('employeeBand', value)}
                      options={EMPLOYEE_BANDS}
                    />
                  </Field>
                  <Field
                    label="Annual turnover"
                    htmlFor="v-turnover"
                    hint="Indicative, and optional — we ask because it tells us what scale of order is realistic."
                  >
                    <SelectField
                      id="v-turnover"
                      value={form.annualTurnover}
                      onChange={(value) => set('annualTurnover', value)}
                      options={ANNUAL_TURNOVER}
                    />
                  </Field>
                  <Field
                    label="Company profile"
                    htmlFor="v-profile"
                    required
                    span="full"
                    hint="What you make, how long you have made it, and at what scale."
                  >
                    <textarea
                      id="v-profile"
                      className={areaClass}
                      value={form.companyProfile}
                      onChange={(e) => set('companyProfile', e.target.value)}
                      rows={5}
                    />
                  </Field>
                </FieldGrid>
              </PortalPanel>
            ) : null}

            {step === 1 ? (
              <PortalPanel
                title="Who we speak to"
                blurb="One person we can write back to, and where the operation actually sits."
              >
                <FieldGrid>
                  <Field label="Primary contact" htmlFor="v-contact" required>
                    <input
                      id="v-contact"
                      className={fieldClass}
                      value={form.contactName}
                      onChange={(e) => set('contactName', e.target.value)}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Role or job title" htmlFor="v-role">
                    <input
                      id="v-role"
                      className={fieldClass}
                      value={form.contactRole}
                      onChange={(e) => set('contactRole', e.target.value)}
                      autoComplete="organization-title"
                    />
                  </Field>
                  <Field label="Email" htmlFor="v-email" required>
                    <input
                      id="v-email"
                      type="email"
                      className={fieldClass}
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Phone" htmlFor="v-phone" required>
                    <input
                      id="v-phone"
                      type="tel"
                      className={fieldClass}
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="WhatsApp" htmlFor="v-whatsapp" hint="If different from the above.">
                    <input
                      id="v-whatsapp"
                      className={fieldClass}
                      value={form.whatsapp}
                      onChange={(e) => set('whatsapp', e.target.value)}
                    />
                  </Field>
                  <Field label="Preferred way to reach you" htmlFor="v-preferred">
                    <SelectField
                      id="v-preferred"
                      value={form.preferredContact}
                      onChange={(value) => set('preferredContact', value)}
                      options={PREFERRED_CONTACT}
                      placeholder="Email"
                    />
                  </Field>
                  <Field label="Country of operation" htmlFor="v-country" required>
                    <SelectField
                      id="v-country"
                      value={form.country}
                      onChange={(value) => set('country', value)}
                      options={COUNTRY_OPTIONS}
                    />
                  </Field>
                </FieldGrid>

                <FieldsetHead title="Registered address" />
                <FieldGrid>
                  <Field label="Address line 1" htmlFor="v-line1">
                    <input
                      id="v-line1"
                      className={fieldClass}
                      value={form.line1}
                      onChange={(e) => set('line1', e.target.value)}
                      autoComplete="address-line1"
                    />
                  </Field>
                  <Field label="Address line 2" htmlFor="v-line2">
                    <input
                      id="v-line2"
                      className={fieldClass}
                      value={form.line2}
                      onChange={(e) => set('line2', e.target.value)}
                      autoComplete="address-line2"
                    />
                  </Field>
                  <Field label="City" htmlFor="v-city">
                    <input
                      id="v-city"
                      className={fieldClass}
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      autoComplete="address-level2"
                    />
                  </Field>
                  <Field label="State / province" htmlFor="v-state">
                    <input
                      id="v-state"
                      className={fieldClass}
                      value={form.state}
                      onChange={(e) => set('state', e.target.value)}
                      autoComplete="address-level1"
                    />
                  </Field>
                  <Field label="Postal code" htmlFor="v-postal">
                    <input
                      id="v-postal"
                      className={fieldClass}
                      value={form.postalCode}
                      onChange={(e) => set('postalCode', e.target.value)}
                      autoComplete="postal-code"
                    />
                  </Field>
                  <Field
                    label="Production or processing sites"
                    htmlFor="v-sites"
                    span="full"
                    hint="Where the product is actually made, if that is not the address above."
                  >
                    <textarea
                      id="v-sites"
                      className={areaClass}
                      value={form.productionSites}
                      onChange={(e) => set('productionSites', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>
              </PortalPanel>
            ) : null}

            {step === 2 ? (
              <PortalPanel
                title="What you would supply"
                blurb="The range, the volume behind it, and how it is packed and held."
              >
                <Field
                  label="Products offered"
                  htmlFor="v-products"
                  required
                  hint="In your own words. Specific beats comprehensive."
                >
                  <textarea
                    id="v-products"
                    className={areaClass}
                    value={form.productSummary}
                    onChange={(e) => set('productSummary', e.target.value)}
                    rows={4}
                  />
                </Field>

                {categoryOptions.length > 0 ? (
                  <Field
                    label="Where this would sit in our catalogue"
                    hint="Optional. Pick as many as apply."
                  >
                    <ChipSelect
                      options={categoryOptions}
                      values={form.categories}
                      onChange={(values) => set('categories', values)}
                      columns={3}
                    />
                  </Field>
                ) : null}

                <FieldGrid>
                  <Field label="Brands owned" htmlFor="v-brands">
                    <input
                      id="v-brands"
                      className={fieldClass}
                      value={form.brandsOwned}
                      onChange={(e) => set('brandsOwned', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Production capacity"
                    htmlFor="v-capacity"
                    hint='e.g. "20 tonnes a month".'
                  >
                    <input
                      id="v-capacity"
                      className={fieldClass}
                      value={form.monthlyCapacity}
                      onChange={(e) => set('monthlyCapacity', e.target.value)}
                    />
                  </Field>
                  <Field label="Minimum order quantity" htmlFor="v-moq">
                    <input
                      id="v-moq"
                      className={fieldClass}
                      value={form.minimumOrder}
                      onChange={(e) => set('minimumOrder', e.target.value)}
                    />
                  </Field>
                  <Field label="Typical lead time" htmlFor="v-lead">
                    <SelectField
                      id="v-lead"
                      value={form.leadTime}
                      onChange={(value) => set('leadTime', value)}
                      options={LEAD_TIME_BANDS}
                    />
                  </Field>
                  <Field label="Shelf life (months)" htmlFor="v-shelf">
                    <input
                      id="v-shelf"
                      className={fieldClass}
                      value={form.shelfLifeMonths}
                      onChange={(e) => set('shelfLifeMonths', e.target.value)}
                      inputMode="numeric"
                    />
                  </Field>
                </FieldGrid>

                <Field label="Storage regime">
                  <ChipSelect
                    options={TEMPERATURE_REGIMES}
                    values={form.temperatureRegimes}
                    onChange={(values) => set('temperatureRegimes', values)}
                  />
                </Field>

                <FieldGrid>
                  <Field label="Packaging formats available" htmlFor="v-packaging" span="full">
                    <textarea
                      id="v-packaging"
                      className={areaClass}
                      value={form.packagingFormats}
                      onChange={(e) => set('packagingFormats', e.target.value)}
                      rows={3}
                    />
                  </Field>
                  <Field
                    label="Seasonality"
                    htmlFor="v-seasonality"
                    span="full"
                    hint="Harvest windows, or months when supply is constrained."
                  >
                    <textarea
                      id="v-seasonality"
                      className={areaClass}
                      value={form.seasonality}
                      onChange={(e) => set('seasonality', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>

                <div className="flex flex-col gap-3 pt-1">
                  <CheckboxRow
                    id="v-private-label"
                    checked={form.privateLabelCapable}
                    onChange={(checked) => set('privateLabelCapable', checked)}
                    label="We can produce under a private label"
                  />
                  <CheckboxRow
                    id="v-samples"
                    checked={form.samplesAvailable}
                    onChange={(checked) => set('samplesAvailable', checked)}
                    label="Samples are available on request"
                  />
                </div>
              </PortalPanel>
            ) : null}

            {step === 3 ? (
              <PortalPanel
                title="Compliance, safety and ethics"
                blurb="The four gates published on /vendors. All of them evidenced, none of them optional."
              >
                <Field
                  label="Certifications held"
                  hint="Tick everything current. We will ask for the certificates themselves during verification, not now."
                >
                  <ChipSelect
                    options={CERTIFICATIONS}
                    values={form.certifications}
                    onChange={(values) => set('certifications', values)}
                    columns={3}
                  />
                </Field>

                <FieldGrid>
                  <Field label="Traceability reaches" htmlFor="v-trace" required>
                    <SelectField
                      id="v-trace"
                      value={form.traceability}
                      onChange={(value) => set('traceability', value)}
                      options={TRACEABILITY_LEVELS}
                    />
                  </Field>
                  <Field label="Most recent audit — by whom" htmlFor="v-audit">
                    <input
                      id="v-audit"
                      className={fieldClass}
                      value={form.lastAuditBody}
                      onChange={(e) => set('lastAuditBody', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Food safety systems"
                    htmlFor="v-safety"
                    span="full"
                    hint="HACCP plan, testing regime, in-house laboratory, and so on."
                  >
                    <textarea
                      id="v-safety"
                      className={areaClass}
                      value={form.foodSafetyNotes}
                      onChange={(e) => set('foodSafetyNotes', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>

                <div className="pt-1">
                  <CheckboxRow
                    id="v-recall"
                    checked={form.recallProcedure}
                    onChange={(checked) => set('recallProcedure', checked)}
                    label="A documented product recall procedure is in place"
                  />
                </div>

                <FieldsetHead
                  title="Ethical and labour practices"
                  blurb="These three are non-negotiable. We would rather you left one unticked and told us why than ticked it and we found out later."
                />
                <div className="flex flex-col gap-3">
                  <CheckboxRow
                    id="v-labour-1"
                    checked={form.noForcedOrChildLabour}
                    onChange={(checked) => set('noForcedOrChildLabour', checked)}
                    label="No forced or child labour is used, anywhere in our operation"
                  />
                  <CheckboxRow
                    id="v-labour-2"
                    checked={form.safeWorkingConditions}
                    onChange={(checked) => set('safeWorkingConditions', checked)}
                    label="Working conditions are safe and compliant"
                  />
                  <CheckboxRow
                    id="v-labour-3"
                    checked={form.labourLawCompliance}
                    onChange={(checked) => set('labourLawCompliance', checked)}
                    label="We adhere to all applicable labour laws"
                  />
                </div>
                <Field label="Anything we should know" htmlFor="v-ethics-notes">
                  <textarea
                    id="v-ethics-notes"
                    className={areaClass}
                    value={form.ethicsNotes}
                    onChange={(e) => set('ethicsNotes', e.target.value)}
                    rows={3}
                  />
                </Field>

                <FieldsetHead title="Insurance and sustainability" />
                <div className="pb-1">
                  <CheckboxRow
                    id="v-liability"
                    checked={form.productLiability}
                    onChange={(checked) => set('productLiability', checked)}
                    label="We hold product liability insurance"
                  />
                </div>
                <FieldGrid>
                  <Field label="Insurer" htmlFor="v-insurer">
                    <input
                      id="v-insurer"
                      className={fieldClass}
                      value={form.insurer}
                      onChange={(e) => set('insurer', e.target.value)}
                    />
                  </Field>
                  <Field label="Cover amount" htmlFor="v-cover">
                    <input
                      id="v-cover"
                      className={fieldClass}
                      value={form.coverAmount}
                      onChange={(e) => set('coverAmount', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Sustainability practices"
                    htmlFor="v-sustainability"
                    span="full"
                    hint="Water, waste, energy, packaging recyclability, or a certification roadmap."
                  >
                    <textarea
                      id="v-sustainability"
                      className={areaClass}
                      value={form.sustainability}
                      onChange={(e) => set('sustainability', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>
              </PortalPanel>
            ) : null}

            {step === 4 ? (
              <PortalPanel
                title="Export readiness"
                blurb="Whether you can already reach us, and on what terms."
              >
                <div className="flex flex-col gap-3">
                  <CheckboxRow
                    id="v-exports"
                    checked={form.exportsToday}
                    onChange={(checked) => set('exportsToday', checked)}
                    label="We already export internationally"
                  />
                  <CheckboxRow
                    id="v-gcc"
                    checked={form.gccExperience}
                    onChange={(checked) => set('gccExperience', checked)}
                    label="We have shipped to the GCC before"
                  />
                  <CheckboxRow
                    id="v-uae"
                    checked={form.uaeRegistered}
                    onChange={(checked) => set('uaeRegistered', checked)}
                    label="Our products are already registered with UAE food authorities"
                    hint="Not a requirement — we can guide you through registration if not."
                  />
                  <CheckboxRow
                    id="v-cold"
                    checked={form.coldChainCapable}
                    onChange={(checked) => set('coldChainCapable', checked)}
                    label="We can maintain an unbroken cold chain to port"
                  />
                </div>

                {form.exportsToday ? (
                  <Field label="Markets currently supplied" htmlFor="v-markets">
                    <textarea
                      id="v-markets"
                      className={areaClass}
                      value={form.exportMarkets}
                      onChange={(e) => set('exportMarkets', e.target.value)}
                      rows={3}
                    />
                  </Field>
                ) : null}

                <Field label="Incoterms you can offer">
                  <ChipSelect
                    options={INCOTERMS}
                    values={form.incoterms}
                    onChange={(values) => set('incoterms', values)}
                    columns={3}
                  />
                </Field>

                <FieldGrid>
                  <Field label="Port(s) of loading" htmlFor="v-ports">
                    <input
                      id="v-ports"
                      className={fieldClass}
                      value={form.portsOfLoading}
                      onChange={(e) => set('portsOfLoading', e.target.value)}
                    />
                  </Field>
                  <Field label="Logistics notes" htmlFor="v-logistics" span="full">
                    <textarea
                      id="v-logistics"
                      className={areaClass}
                      value={form.logisticsNotes}
                      onChange={(e) => set('logisticsNotes', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>
              </PortalPanel>
            ) : null}

            {step === 5 ? (
              <PortalPanel
                title="Commercial terms"
                blurb="How you invoice, how you get paid, and who can vouch for you."
              >
                <Field label="Currencies you invoice in">
                  <ChipSelect
                    options={CURRENCIES}
                    values={form.currencies}
                    onChange={(values) => set('currencies', values)}
                    columns={3}
                  />
                </Field>
                <Field label="Payment terms you can offer">
                  <ChipSelect
                    options={PAYMENT_TERMS}
                    values={form.paymentTerms}
                    onChange={(values) => set('paymentTerms', values)}
                  />
                </Field>

                <div className="pt-1">
                  <CheckboxRow
                    id="v-exclusivity"
                    checked={form.openToExclusivity}
                    onChange={(checked) => set('openToExclusivity', checked)}
                    label="We are open to regional distribution exclusivity"
                  />
                </div>

                <Field label="Marketing or listing support you can offer" htmlFor="v-marketing">
                  <textarea
                    id="v-marketing"
                    className={areaClass}
                    value={form.marketingSupport}
                    onChange={(e) => set('marketingSupport', e.target.value)}
                    rows={3}
                  />
                </Field>

                <FieldsetHead
                  title="Trade references"
                  blurb="Existing customers we may contact during verification. Optional, but they shorten it considerably."
                />
                <div className="flex flex-col gap-3">
                  {form.references.map((reference, index) => (
                    <RepeatableRow
                      key={index}
                      index={index}
                      label="Reference"
                      removable={form.references.length > 1}
                      onRemove={() =>
                        set(
                          'references',
                          form.references.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <FieldGrid>
                        <Field label="Company" htmlFor={`v-ref-company-${index}`}>
                          <input
                            id={`v-ref-company-${index}`}
                            className={fieldClass}
                            value={reference.company}
                            onChange={(e) =>
                              set(
                                'references',
                                form.references.map((entry, i) =>
                                  i === index ? { ...entry, company: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="Contact name" htmlFor={`v-ref-name-${index}`}>
                          <input
                            id={`v-ref-name-${index}`}
                            className={fieldClass}
                            value={reference.contactName}
                            onChange={(e) =>
                              set(
                                'references',
                                form.references.map((entry, i) =>
                                  i === index ? { ...entry, contactName: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="Email" htmlFor={`v-ref-email-${index}`}>
                          <input
                            id={`v-ref-email-${index}`}
                            type="email"
                            className={fieldClass}
                            value={reference.email}
                            onChange={(e) =>
                              set(
                                'references',
                                form.references.map((entry, i) =>
                                  i === index ? { ...entry, email: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field
                          label="Relationship"
                          htmlFor={`v-ref-rel-${index}`}
                          hint='e.g. "Distributor, three years".'
                        >
                          <input
                            id={`v-ref-rel-${index}`}
                            className={fieldClass}
                            value={reference.relationship}
                            onChange={(e) =>
                              set(
                                'references',
                                form.references.map((entry, i) =>
                                  i === index ? { ...entry, relationship: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </Field>
                      </FieldGrid>
                    </RepeatableRow>
                  ))}
                  {form.references.length < 5 ? (
                    <AddRowButton
                      onClick={() => set('references', [...form.references, emptyReference()])}
                    >
                      Add another reference
                    </AddRowButton>
                  ) : null}
                </div>

                <FieldGrid>
                  <Field label="How you found us" htmlFor="v-heard">
                    <SelectField
                      id="v-heard"
                      value={form.howHeard}
                      onChange={(value) => set('howHeard', value)}
                      options={HOW_HEARD}
                    />
                  </Field>
                  <Field label="Anything else" htmlFor="v-notes" span="full">
                    <textarea
                      id="v-notes"
                      className={areaClass}
                      value={form.additionalNotes}
                      onChange={(e) => set('additionalNotes', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>
              </PortalPanel>
            ) : null}

            {step === 6 ? (
              <PortalPanel
                title="Declaration"
                blurb="One last thing: who is standing behind these answers."
              >
                <FieldGrid>
                  <Field label="Declared by" htmlFor="v-signatory" required>
                    <input
                      id="v-signatory"
                      className={fieldClass}
                      value={form.signatoryName}
                      onChange={(e) => set('signatoryName', e.target.value)}
                    />
                  </Field>
                  <Field label="Position held" htmlFor="v-signatory-role" required>
                    <input
                      id="v-signatory-role"
                      className={fieldClass}
                      value={form.signatoryRole}
                      onChange={(e) => set('signatoryRole', e.target.value)}
                    />
                  </Field>
                </FieldGrid>

                <div className="flex flex-col gap-3 pt-1">
                  <CheckboxRow
                    id="v-declaration"
                    checked={form.declarationAccepted}
                    onChange={(checked) => set('declarationAccepted', checked)}
                    label="I declare that the information given here is true and complete."
                    hint="Misrepresentation of product or origin ends a supplier relationship immediately — it is one of the three things on our zero-tolerance list."
                  />
                  <CheckboxRow
                    id="v-consent"
                    checked={form.consentContact}
                    onChange={(checked) => set('consentContact', checked)}
                    label="You may contact me about this application."
                  />
                </div>

                <div className="rounded-sm bg-parchment border border-stone/15 px-4 py-3.5">
                  <p className="m-0! font-sans text-[12.5px] text-stone leading-relaxed">
                    On submission we will email you a reference. Keep it — with your email address
                    it is how you check progress at{' '}
                    <Link href="/portal/vendor/status" className="no-underline">
                      <span className="text-forest-green hover:underline underline-offset-2">
                        /portal/vendor/status
                      </span>
                    </Link>
                    , and it is what we quote in every reply.
                  </p>
                </div>
              </PortalPanel>
            ) : null}

            {/* ── Step navigation ─────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="font-sans text-[11.5px] text-stone">
                Step {step + 1} of {STEPS.length} · {STEPS[step]?.label}
              </span>
              <div className="flex flex-wrap gap-3">
                {step > 0 ? <GhostButton onClick={() => goTo(step - 1)}>Back</GhostButton> : null}
                {step < STEPS.length - 1 ? (
                  <PrimaryButton onClick={advance}>Continue</PrimaryButton>
                ) : (
                  <PrimaryButton onClick={submit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit application'}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** What replaces the form once it has gone. */
function SubmittedPanel({ reference, company }: { reference: string; company: string }) {
  return (
    <div className="bg-cream min-h-[70vh]">
      <PortalMasthead
        eyebrow="Vendor registration"
        title="Application received"
        lede={`Thank you — the questionnaire for ${company || 'your company'} reached us in full.`}
      />
      <div className={cn(GUTTER, 'py-8 md:py-12')}>
        <FadeIn>
          <div className="max-w-2xl flex flex-col gap-5">
            {reference ? (
              <div className="rounded-sm border border-forest-green/25 bg-forest-green/8 px-5 py-5">
                <span className="block font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-forest-green">
                  Your reference
                </span>
                <span className="block font-luxury text-2xl md:text-3xl font-semibold text-obsidian mt-2 tracking-tight">
                  {reference}
                </span>
                <p className="m-0! mt-2.5! font-sans text-[12.5px] text-stone leading-relaxed">
                  We have emailed this to you as well. With your email address it is how you check
                  progress, and it is what we quote in every reply.
                </p>
              </div>
            ) : null}

            <div>
              <span className="block font-luxury text-lg font-semibold text-obsidian leading-tight">
                What happens next
              </span>
              <ol className="list-none m-0 p-0 mt-3 flex flex-col">
                {[
                  ['Initial assessment', 'We read what you have sent and check it is complete.'],
                  [
                    'Evaluation',
                    'Your compliance, quality systems and supply capacity are reviewed against our standards.',
                  ],
                  [
                    'Verification',
                    'Where it applies: documentation checks, audit records, or a site visit.',
                  ],
                  [
                    'Approval and integration',
                    'Specifications agreed, and a place in the supplier network.',
                  ],
                ].map(([title, body], index) => (
                  <li key={title} className="border-t border-stone/15 py-3 flex gap-3.5">
                    <span className="font-luxury text-[15px] text-forest-green/70 leading-none pt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-sans text-[13px] font-medium text-obsidian">
                        {title}
                      </span>
                      <span className="block font-sans text-[12.5px] text-stone leading-relaxed mt-0.5">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="m-0! font-sans text-[12.5px] text-stone leading-relaxed">
              We review deliberately rather than quickly, and we write at each stage. Nothing
              further is needed from you in the meantime.
            </p>

            {/* Anchors, not the button primitives above — a <button> inside an
                <a> is invalid, and these navigate rather than act. */}
            <div className="flex flex-wrap gap-3">
              <Cta href="/portal/vendor/status">Check your status</Cta>
              <Cta href="/vendors" variant="dark-outline">
                Read our standards
              </Cta>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
