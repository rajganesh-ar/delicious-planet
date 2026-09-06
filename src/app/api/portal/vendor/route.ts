import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
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
import {
  bool,
  compact,
  email as parseEmail,
  num,
  pick,
  pickMany,
  relationIds,
  rows,
  str,
} from '@/lib/portal-input'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

const PREFERRED_CONTACT = [
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'WhatsApp', value: 'whatsapp' },
]

/**
 * A vendor application is a considered act, not a repeated one — an applicant
 * submits once and, at worst, once more after realising they left something
 * out. Three an hour is generous for that and useless for anyone filling the
 * review queue with noise.
 */
const VENDOR_RATE_LIMIT = { limit: 3, windowMs: 60 * 60_000 }

/**
 * The public end of the vendor questionnaire.
 *
 * The collection itself is admin-only to create; this route is the single door
 * a browser gets, which is what makes the surface reviewable. Every field is
 * coerced through src/lib/portal-input before the write, so the six fields
 * that decide an applicant's fate — status, tier, reviewer, the supplier link,
 * the internal notes and the reference — are simply not reachable from a
 * request body, no matter what it contains.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`portal-vendor:${clientKey(req)}`, VENDOR_RATE_LIMIT)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many applications from this connection. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return bad('Malformed request.')
  }

  const address = (body.address ?? {}) as Record<string, unknown>
  const ethics = (body.ethics ?? {}) as Record<string, unknown>
  const insurance = (body.insurance ?? {}) as Record<string, unknown>

  const data = compact({
    /* Company */
    companyName: str(body.companyName, 200),
    tradingName: str(body.tradingName, 200),
    businessType: pick(BUSINESS_TYPES, body.businessType),
    website: str(body.website, 300),
    yearEstablished: num(body.yearEstablished, 1800, new Date().getFullYear()),
    registrationNumber: str(body.registrationNumber, 100),
    taxId: str(body.taxId, 100),
    employeeBand: pick(EMPLOYEE_BANDS, body.employeeBand),
    annualTurnover: pick(ANNUAL_TURNOVER, body.annualTurnover),
    companyProfile: str(body.companyProfile, 4000),

    /* Contact */
    contactName: str(body.contactName, 160),
    contactRole: str(body.contactRole, 160),
    email: parseEmail(body.email),
    phone: str(body.phone, 60),
    whatsapp: str(body.whatsapp, 60),
    preferredContact: pick(PREFERRED_CONTACT, body.preferredContact),
    country: pick(COUNTRY_OPTIONS, body.country),
    address: compact({
      line1: str(address.line1, 200),
      line2: str(address.line2, 200),
      city: str(address.city, 120),
      state: str(address.state, 120),
      postalCode: str(address.postalCode, 40),
    }),
    productionSites: str(body.productionSites, 2000),

    /* Supply */
    categories: relationIds(body.categories, 20),
    productSummary: str(body.productSummary, 4000),
    brandsOwned: str(body.brandsOwned, 400),
    monthlyCapacity: str(body.monthlyCapacity, 200),
    minimumOrder: str(body.minimumOrder, 200),
    leadTime: pick(LEAD_TIME_BANDS, body.leadTime),
    shelfLifeMonths: num(body.shelfLifeMonths, 0, 600),
    temperatureRegimes: pickMany(TEMPERATURE_REGIMES, body.temperatureRegimes),
    packagingFormats: str(body.packagingFormats, 2000),
    seasonality: str(body.seasonality, 2000),
    privateLabelCapable: bool(body.privateLabelCapable),
    samplesAvailable: bool(body.samplesAvailable),

    /* Compliance */
    certifications: pickMany(CERTIFICATIONS, body.certifications),
    traceability: pick(TRACEABILITY_LEVELS, body.traceability),
    recallProcedure: bool(body.recallProcedure),
    lastAuditBody: str(body.lastAuditBody, 200),
    foodSafetyNotes: str(body.foodSafetyNotes, 4000),
    ethics: {
      noForcedOrChildLabour: bool(ethics.noForcedOrChildLabour),
      safeWorkingConditions: bool(ethics.safeWorkingConditions),
      labourLawCompliance: bool(ethics.labourLawCompliance),
      notes: str(ethics.notes, 2000),
    },
    insurance: compact({
      productLiability: bool(insurance.productLiability),
      insurer: str(insurance.insurer, 200),
      coverAmount: str(insurance.coverAmount, 100),
    }),
    sustainability: str(body.sustainability, 3000),

    /* Export */
    exportsToday: bool(body.exportsToday),
    exportMarkets: str(body.exportMarkets, 2000),
    gccExperience: bool(body.gccExperience),
    uaeRegistered: bool(body.uaeRegistered),
    incoterms: pickMany(INCOTERMS, body.incoterms),
    portsOfLoading: str(body.portsOfLoading, 300),
    coldChainCapable: bool(body.coldChainCapable),
    logisticsNotes: str(body.logisticsNotes, 2000),

    /* Commercial */
    currencies: pickMany(CURRENCIES, body.currencies),
    paymentTerms: pickMany(PAYMENT_TERMS, body.paymentTerms),
    openToExclusivity: bool(body.openToExclusivity),
    marketingSupport: str(body.marketingSupport, 2000),
    references: rows(body.references, 5, (entry) => {
      const company = str(entry.company, 200)
      if (!company) return undefined
      return compact({
        company,
        contactName: str(entry.contactName, 160),
        email: parseEmail(entry.email),
        phone: str(entry.phone, 60),
        relationship: str(entry.relationship, 200),
      })
    }),
    howHeard: pick(HOW_HEARD, body.howHeard),
    additionalNotes: str(body.additionalNotes, 4000),

    /* Declaration */
    signatoryName: str(body.signatoryName, 160),
    signatoryRole: str(body.signatoryRole, 160),
    declarationAccepted: bool(body.declarationAccepted),
    consentContact: bool(body.consentContact),
  })

  // Checked here rather than left to Payload so the applicant gets one clear
  // sentence instead of a validation object keyed by field path.
  const missing: string[] = []
  if (!data.companyName) missing.push('company name')
  if (!data.businessType) missing.push('type of business')
  if (!data.companyProfile) missing.push('company profile')
  if (!data.contactName) missing.push('contact name')
  if (!data.email) missing.push('a valid email address')
  if (!data.phone) missing.push('phone number')
  if (!data.country) missing.push('country')
  if (!data.productSummary) missing.push('products offered')
  if (!data.traceability) missing.push('traceability level')
  if (!data.signatoryName) missing.push('name of the signatory')
  if (!data.signatoryRole) missing.push('position held by the signatory')

  if (missing.length > 0) {
    return bad(`Please complete: ${missing.join(', ')}.`)
  }

  if (!data.declarationAccepted) {
    return bad('Please confirm the declaration before submitting.')
  }

  const payload = await getPayload({ config: await config })

  try {
    const created = await payload.create({
      collection: 'vendor-applications',
      data: { ...data, status: 'new' } as never,
      // Admin privileges, on data that has just been rebuilt field by field
      // from a whitelist. Nothing from the body reaches this call untouched.
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, reference: created.reference })
  } catch (err) {
    payload.logger.error({ err }, 'Vendor application could not be saved')
    return bad('We could not record that application. Please try again.', 500)
  }
}
