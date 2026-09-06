import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, isAdmin, isAdminField } from './access'
import { COUNTRY_OPTIONS } from '../lib/countries'
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
  VENDOR_STATUSES,
  VENDOR_TIERS,
} from '../lib/portal-options'
import { notifyVendorApplication } from './hooks/portalNotifications'
import { stampVendorReference } from './hooks/portalHooks'

/**
 * The vendor application — the long half of the partner portal.
 *
 * /vendors publishes four entry requirements and a four-stage onboarding
 * journey, but until now the only way to start it was an email. This is that
 * page's first stage as a form: everything the evaluation stage would have had
 * to ask for in a follow-up thread, asked once, up front.
 *
 * Two things about the shape here are deliberate.
 *
 * `create` is admin-only even though this is a public form. The storefront
 * posts to /api/portal/vendor instead, which rate-limits, drops anything not
 * on the questionnaire, and creates the row through the Local API. With sixty
 * writable fields — six of them deciding whether an applicant is approved — a
 * publicly creatable collection is a much larger surface to get right than one
 * route handler. The internal fields carry field-level locks as well, so the
 * two defences are independent.
 *
 * The tabs are unnamed, so the fields stay flat in the database and a report
 * can select `status, company_name, business_type` without walking into a
 * JSON column. They exist purely so the admin panel is navigable — sixty
 * fields in one column is not a form anybody reviews carefully.
 */
export const VendorApplications: CollectionConfig = {
  slug: 'vendor-applications',
  labels: {
    singular: 'Vendor application',
    plural: 'Vendor applications',
  },
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'businessType', 'country', 'status', 'createdAt'],
    listSearchableFields: ['companyName', 'tradingName', 'email', 'reference'],
    description:
      'Applications from the /portal/vendor questionnaire. Move one through New → In review → Verification → Approved as the onboarding journey on /vendors describes.',
  },
  access: {
    // Public submissions arrive through /api/portal/vendor, not through here.
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [stampVendorReference],
    afterChange: [notifyVendorApplication],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        /* ── 1 · The company ──────────────────────────────────────── */
        {
          label: 'Company',
          description: 'Who is applying, and what kind of operation it is.',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              required: true,
              index: true,
              label: 'Registered company name',
            },
            {
              name: 'tradingName',
              type: 'text',
              label: 'Trading name',
              admin: { description: 'If it differs from the registered name.' },
            },
            {
              name: 'businessType',
              type: 'select',
              required: true,
              index: true,
              options: BUSINESS_TYPES,
              admin: { description: 'The five partner types on /vendors, plus the adjacent ones.' },
            },
            { name: 'website', type: 'text' },
            {
              name: 'yearEstablished',
              type: 'number',
              min: 1800,
              max: 2100,
              admin: { description: 'Four digits.' },
            },
            {
              name: 'registrationNumber',
              type: 'text',
              label: 'Company registration number',
            },
            { name: 'taxId', type: 'text', label: 'VAT / tax identification number' },
            { name: 'employeeBand', type: 'select', label: 'Employees', options: EMPLOYEE_BANDS },
            {
              name: 'annualTurnover',
              type: 'select',
              options: ANNUAL_TURNOVER,
              admin: { description: 'Indicative only, and optional to disclose.' },
            },
            {
              name: 'companyProfile',
              type: 'textarea',
              required: true,
              label: 'Company profile',
              admin: {
                description: 'What the business does, how long it has done it, and at what scale.',
              },
            },
          ],
        },

        /* ── 2 · Contact and location ─────────────────────────────── */
        {
          label: 'Contact',
          description: 'Who we speak to, and where the operation sits.',
          fields: [
            { name: 'contactName', type: 'text', required: true, label: 'Primary contact' },
            { name: 'contactRole', type: 'text', label: 'Role or job title' },
            { name: 'email', type: 'email', required: true, index: true },
            { name: 'phone', type: 'text', required: true },
            { name: 'whatsapp', type: 'text', label: 'WhatsApp (if different)' },
            {
              name: 'preferredContact',
              type: 'select',
              defaultValue: 'email',
              options: [
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
                { label: 'WhatsApp', value: 'whatsapp' },
              ],
            },
            {
              name: 'country',
              type: 'select',
              required: true,
              index: true,
              options: COUNTRY_OPTIONS,
              label: 'Country of operation',
            },
            {
              name: 'address',
              type: 'group',
              label: 'Registered address',
              fields: [
                { name: 'line1', type: 'text' },
                { name: 'line2', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'state', type: 'text', label: 'State / emirate / province' },
                { name: 'postalCode', type: 'text' },
              ],
            },
            {
              name: 'productionSites',
              type: 'textarea',
              label: 'Production or processing sites',
              admin: { description: 'Where the product is actually made, if not the address above.' },
            },
          ],
        },

        /* ── 3 · What they supply ─────────────────────────────────── */
        {
          label: 'Supply',
          description: 'The product, the volume behind it, and how it is packed.',
          fields: [
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: 'Categories offered',
              admin: { description: 'Where the range would sit in our catalogue.' },
            },
            {
              name: 'productSummary',
              type: 'textarea',
              required: true,
              label: 'Products offered',
              admin: { description: 'The range, in the applicant’s own words.' },
            },
            { name: 'brandsOwned', type: 'text', label: 'Brands owned' },
            {
              name: 'monthlyCapacity',
              type: 'text',
              label: 'Production capacity',
              admin: { description: 'e.g. "20 tonnes / month", "40,000 units / month".' },
            },
            {
              name: 'minimumOrder',
              type: 'text',
              label: 'Minimum order quantity',
            },
            { name: 'leadTime', type: 'select', options: LEAD_TIME_BANDS, label: 'Typical lead time' },
            {
              name: 'shelfLifeMonths',
              type: 'number',
              min: 0,
              label: 'Shelf life (months)',
            },
            {
              name: 'temperatureRegimes',
              type: 'select',
              hasMany: true,
              options: TEMPERATURE_REGIMES,
              label: 'Storage regime',
            },
            { name: 'packagingFormats', type: 'textarea', label: 'Packaging formats available' },
            {
              name: 'seasonality',
              type: 'textarea',
              label: 'Seasonality',
              admin: { description: 'Harvest windows, or months when supply is constrained.' },
            },
            {
              name: 'privateLabelCapable',
              type: 'checkbox',
              defaultValue: false,
              label: 'Can produce under private label',
            },
            {
              name: 'samplesAvailable',
              type: 'checkbox',
              defaultValue: false,
              label: 'Samples available on request',
            },
          ],
        },

        /* ── 4 · Compliance, ethics and safety ────────────────────── */
        {
          label: 'Compliance',
          description: 'The four entry gates published on /vendors, evidenced.',
          fields: [
            {
              name: 'certifications',
              type: 'select',
              hasMany: true,
              options: CERTIFICATIONS,
              label: 'Certifications held',
            },
            {
              name: 'certificationDocs',
              type: 'array',
              label: 'Certification documents',
              admin: { description: 'Upload the certificate itself where the applicant has it.' },
              fields: [
                { name: 'name', type: 'text', required: true, label: 'Certificate' },
                { name: 'issuingBody', type: 'text' },
                { name: 'reference', type: 'text', label: 'Certificate number' },
                { name: 'expiresAt', type: 'date', label: 'Expiry' },
                { name: 'file', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              name: 'traceability',
              type: 'select',
              required: true,
              options: TRACEABILITY_LEVELS,
              label: 'Traceability maintained at',
            },
            {
              name: 'recallProcedure',
              type: 'checkbox',
              defaultValue: false,
              label: 'A documented product recall procedure is in place',
            },
            { name: 'lastAuditBody', type: 'text', label: 'Most recent audit — by whom' },
            { name: 'lastAuditDate', type: 'date', label: 'Most recent audit — when' },
            {
              name: 'foodSafetyNotes',
              type: 'textarea',
              label: 'Food safety systems',
              admin: { description: 'HACCP plan, testing regime, in-house laboratory, and so on.' },
            },
            {
              name: 'ethics',
              type: 'group',
              label: 'Ethical and labour practices',
              admin: {
                description:
                  'All three are non-negotiable on /vendors. An application that cannot affirm them is not one we can take forward.',
              },
              fields: [
                {
                  name: 'noForcedOrChildLabour',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'No forced or child labour is used, anywhere in the operation',
                },
                {
                  name: 'safeWorkingConditions',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Working conditions are safe and compliant',
                },
                {
                  name: 'labourLawCompliance',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Applicable labour laws are adhered to',
                },
                { name: 'notes', type: 'textarea', label: 'Anything we should know' },
              ],
            },
            {
              name: 'insurance',
              type: 'group',
              fields: [
                {
                  name: 'productLiability',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Product liability insurance is held',
                },
                { name: 'insurer', type: 'text' },
                { name: 'coverAmount', type: 'text', label: 'Cover amount' },
              ],
            },
            {
              name: 'sustainability',
              type: 'textarea',
              label: 'Sustainability practices',
              admin: {
                description:
                  'Water, waste, energy, packaging recyclability, or certification roadmaps.',
              },
            },
          ],
        },

        /* ── 5 · Export readiness ─────────────────────────────────── */
        {
          label: 'Export',
          description: 'Whether the operation can already reach us, and on what terms.',
          fields: [
            {
              name: 'exportsToday',
              type: 'checkbox',
              defaultValue: false,
              label: 'Already exporting internationally',
            },
            {
              name: 'exportMarkets',
              type: 'textarea',
              label: 'Markets currently supplied',
              admin: { condition: (data) => Boolean(data?.exportsToday) },
            },
            {
              name: 'gccExperience',
              type: 'checkbox',
              defaultValue: false,
              label: 'Has previously shipped to the GCC',
            },
            {
              name: 'uaeRegistered',
              type: 'checkbox',
              defaultValue: false,
              label: 'Products already registered with UAE food authorities',
            },
            {
              name: 'incoterms',
              type: 'select',
              hasMany: true,
              options: INCOTERMS,
              label: 'Incoterms offered',
            },
            { name: 'portsOfLoading', type: 'text', label: 'Port(s) of loading' },
            {
              name: 'coldChainCapable',
              type: 'checkbox',
              defaultValue: false,
              label: 'Can maintain an unbroken cold chain to port',
            },
            { name: 'logisticsNotes', type: 'textarea', label: 'Logistics notes' },
          ],
        },

        /* ── 6 · Commercial ───────────────────────────────────────── */
        {
          label: 'Commercial',
          fields: [
            {
              name: 'currencies',
              type: 'select',
              hasMany: true,
              options: CURRENCIES,
              label: 'Currencies invoiced in',
            },
            {
              name: 'paymentTerms',
              type: 'select',
              hasMany: true,
              options: PAYMENT_TERMS,
              label: 'Payment terms offered',
            },
            { name: 'priceList', type: 'upload', relationTo: 'media', label: 'Price list' },
            { name: 'catalogue', type: 'upload', relationTo: 'media', label: 'Product catalogue' },
            {
              name: 'openToExclusivity',
              type: 'checkbox',
              defaultValue: false,
              label: 'Open to regional distribution exclusivity',
            },
            {
              name: 'marketingSupport',
              type: 'textarea',
              label: 'Marketing or listing support offered',
            },
            {
              name: 'references',
              type: 'array',
              label: 'Trade references',
              admin: { description: 'Existing customers we may contact during verification.' },
              fields: [
                { name: 'company', type: 'text', required: true },
                { name: 'contactName', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'phone', type: 'text' },
                { name: 'relationship', type: 'text', admin: { description: 'e.g. "Distributor, 3 years".' } },
              ],
            },
            { name: 'howHeard', type: 'select', options: HOW_HEARD, label: 'How they found us' },
            { name: 'additionalNotes', type: 'textarea', label: 'Anything else' },
          ],
        },

        /* ── 7 · Declaration ──────────────────────────────────────── */
        {
          label: 'Declaration',
          fields: [
            { name: 'signatoryName', type: 'text', required: true, label: 'Signed by' },
            { name: 'signatoryRole', type: 'text', required: true, label: 'Position held' },
            {
              name: 'declarationAccepted',
              type: 'checkbox',
              defaultValue: false,
              label: 'Declared the information true and complete',
            },
            {
              name: 'consentContact',
              type: 'checkbox',
              defaultValue: false,
              label: 'Consented to be contacted about this application',
            },
            {
              name: 'reference',
              type: 'text',
              unique: true,
              index: true,
              label: 'Reference',
              admin: {
                readOnly: true,
                description:
                  'Quoted back to the applicant on submission, and what they use to check progress at /portal/vendor/status. Stamped on create.',
              },
              access: { create: isAdminField, update: isAdminField },
            },
            {
              name: 'submittedAt',
              type: 'date',
              admin: { readOnly: true },
              access: { create: isAdminField, update: isAdminField },
            },
          ],
        },
      ],
    },

    /* ── Internal — sidebar, admin-only in both directions ───────── */
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: VENDOR_STATUSES,
      admin: { position: 'sidebar' },
      // Field-level locks as well as the collection's admin-only create: the
      // route handler is trusted, but nothing else that reaches this row is.
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'tier',
      type: 'select',
      options: VENDOR_TIERS,
      admin: {
        position: 'sidebar',
        description: 'Set on approval. Earned by performance, not agreed at signing.',
      },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'linkedSupplier',
      type: 'relationship',
      relationTo: 'suppliers',
      admin: {
        position: 'sidebar',
        description: 'The supplier record created once this application is approved.',
      },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Never shown to the applicant.' },
      access: { create: isAdminField, update: isAdminField },
    },
  ],
  timestamps: true,
}
