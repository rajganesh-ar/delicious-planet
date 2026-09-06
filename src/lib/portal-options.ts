/**
 * Option lists shared by the partner portal.
 *
 * The vendor questionnaire and the chef registration both exist twice: once as
 * Payload fields, once as a form on the storefront. Every list either side
 * offers has to be the same list, or a perfectly good answer is rejected by
 * enum validation after the applicant has spent twenty minutes on the form.
 * So both import from here.
 *
 * Shape matches what Payload's `options` expects, which is also what a plain
 * <select> wants, so nothing needs mapping at either end.
 */

export interface SelectOption {
  label: string
  value: string
}

/* ═══ Vendor questionnaire ═══════════════════════════════════════════ */

export const BUSINESS_TYPES: SelectOption[] = [
  { label: 'Agricultural producer / farm', value: 'producer' },
  { label: 'Farmer group or cooperative', value: 'cooperative' },
  { label: 'Fishery or aquaculture operator', value: 'marine' },
  { label: 'Food processor / manufacturer', value: 'processor' },
  { label: 'Brand owner', value: 'brand_owner' },
  { label: 'Aggregator or export house', value: 'exporter' },
  { label: 'Distributor / wholesaler', value: 'distributor' },
  { label: 'Logistics or cold chain operator', value: 'logistics' },
]

export const ANNUAL_TURNOVER: SelectOption[] = [
  { label: 'Under $250k', value: 'under_250k' },
  { label: '$250k – $1M', value: '250k_1m' },
  { label: '$1M – $5M', value: '1m_5m' },
  { label: '$5M – $20M', value: '5m_20m' },
  { label: 'Over $20M', value: 'over_20m' },
  { label: 'Prefer not to say', value: 'undisclosed' },
]

export const EMPLOYEE_BANDS: SelectOption[] = [
  { label: '1 – 10', value: '1_10' },
  { label: '11 – 50', value: '11_50' },
  { label: '51 – 200', value: '51_200' },
  { label: '201 – 1000', value: '201_1000' },
  { label: 'Over 1000', value: 'over_1000' },
]

/**
 * Certifications are a checkbox list rather than free text because the
 * evaluation stage filters on them. "Other" catches the long tail, and the
 * document array is where the evidence actually goes.
 */
export const CERTIFICATIONS: SelectOption[] = [
  { label: 'HACCP', value: 'haccp' },
  { label: 'ISO 22000', value: 'iso_22000' },
  { label: 'ISO 9001', value: 'iso_9001' },
  { label: 'BRCGS', value: 'brcgs' },
  { label: 'IFS Food', value: 'ifs' },
  { label: 'FSSC 22000', value: 'fssc_22000' },
  { label: 'GLOBALG.A.P.', value: 'globalgap' },
  { label: 'Halal', value: 'halal' },
  { label: 'Kosher', value: 'kosher' },
  { label: 'Organic (EU / USDA / equivalent)', value: 'organic' },
  { label: 'Fairtrade', value: 'fairtrade' },
  { label: 'Rainforest Alliance', value: 'rainforest_alliance' },
  { label: 'MSC / ASC (seafood)', value: 'msc_asc' },
  { label: 'Non-GMO Project', value: 'non_gmo' },
  { label: 'SEDEX / SMETA audit', value: 'sedex' },
  { label: 'Other', value: 'other' },
]

export const INCOTERMS: SelectOption[] = [
  { label: 'EXW — Ex Works', value: 'exw' },
  { label: 'FCA — Free Carrier', value: 'fca' },
  { label: 'FOB — Free on Board', value: 'fob' },
  { label: 'CFR — Cost and Freight', value: 'cfr' },
  { label: 'CIF — Cost, Insurance and Freight', value: 'cif' },
  { label: 'CPT — Carriage Paid To', value: 'cpt' },
  { label: 'CIP — Carriage and Insurance Paid To', value: 'cip' },
  { label: 'DAP — Delivered at Place', value: 'dap' },
  { label: 'DDP — Delivered Duty Paid', value: 'ddp' },
]

export const TEMPERATURE_REGIMES: SelectOption[] = [
  { label: 'Ambient / dry', value: 'ambient' },
  { label: 'Chilled (0–4 °C)', value: 'chilled' },
  { label: 'Frozen (−18 °C or below)', value: 'frozen' },
  { label: 'Controlled atmosphere', value: 'controlled_atmosphere' },
]

export const PAYMENT_TERMS: SelectOption[] = [
  { label: '100% advance', value: 'advance' },
  { label: 'Letter of credit', value: 'letter_of_credit' },
  { label: 'Documents against payment', value: 'dp' },
  { label: 'Net 30', value: 'net_30' },
  { label: 'Net 60', value: 'net_60' },
  { label: 'Net 90', value: 'net_90' },
  { label: 'Negotiable', value: 'negotiable' },
]

export const CURRENCIES: SelectOption[] = [
  { label: 'AED', value: 'AED' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'INR', value: 'INR' },
]

export const TRACEABILITY_LEVELS: SelectOption[] = [
  { label: 'Batch or lot level', value: 'batch' },
  { label: 'Farm or vessel level', value: 'farm' },
  { label: 'Full chain of custody', value: 'chain_of_custody' },
  { label: 'Not currently traceable', value: 'none' },
]

export const LEAD_TIME_BANDS: SelectOption[] = [
  { label: 'Under 2 weeks', value: 'under_2w' },
  { label: '2 – 4 weeks', value: '2_4w' },
  { label: '4 – 8 weeks', value: '4_8w' },
  { label: 'Over 8 weeks', value: 'over_8w' },
]

export const HOW_HEARD: SelectOption[] = [
  { label: 'Trade show', value: 'trade_show' },
  { label: 'Referral from a partner', value: 'referral' },
  { label: 'Search engine', value: 'search' },
  { label: 'Social media', value: 'social' },
  { label: 'Approached by our team', value: 'outreach' },
  { label: 'Other', value: 'other' },
]

export const VENDOR_STATUSES: SelectOption[] = [
  { label: 'New', value: 'new' },
  { label: 'In review', value: 'in_review' },
  { label: 'Verification', value: 'verification' },
  { label: 'Approved', value: 'approved' },
  { label: 'On hold', value: 'on_hold' },
  { label: 'Rejected', value: 'rejected' },
]

/** Mirrors the three partnership tiers published on /vendors. */
export const VENDOR_TIERS: SelectOption[] = [
  { label: 'Tier 01 — Developmental', value: 'developmental' },
  { label: 'Tier 02 — Approved', value: 'approved' },
  { label: 'Tier 03 — Strategic', value: 'strategic' },
]

/* ═══ Chef registration ══════════════════════════════════════════════ */

export const CHEF_ROLES: SelectOption[] = [
  { label: 'Executive chef', value: 'executive_chef' },
  { label: 'Head chef', value: 'head_chef' },
  { label: 'Sous chef', value: 'sous_chef' },
  { label: 'Pastry chef', value: 'pastry_chef' },
  { label: 'Chef de partie', value: 'chef_de_partie' },
  { label: 'Private chef', value: 'private_chef' },
  { label: 'Consultant chef', value: 'consultant' },
  { label: 'Culinary instructor', value: 'instructor' },
  { label: 'Food writer or recipe developer', value: 'developer' },
  { label: 'Home cook', value: 'home_cook' },
]

export const KITCHEN_TYPES: SelectOption[] = [
  { label: 'Fine dining restaurant', value: 'fine_dining' },
  { label: 'Casual restaurant or bistro', value: 'casual' },
  { label: 'Hotel or resort', value: 'hotel' },
  { label: 'Bakery or patisserie', value: 'bakery' },
  { label: 'Café', value: 'cafe' },
  { label: 'Catering or events', value: 'catering' },
  { label: 'Cloud kitchen', value: 'cloud_kitchen' },
  { label: 'Culinary school', value: 'school' },
  { label: 'Private household', value: 'private' },
  { label: 'Independent / freelance', value: 'independent' },
]

export const EXPERIENCE_BANDS: SelectOption[] = [
  { label: 'Under 2 years', value: 'under_2' },
  { label: '2 – 5 years', value: '2_5' },
  { label: '5 – 10 years', value: '5_10' },
  { label: '10 – 20 years', value: '10_20' },
  { label: 'Over 20 years', value: 'over_20' },
]

export const CUISINES: SelectOption[] = [
  { label: 'Italian', value: 'italian' },
  { label: 'French', value: 'french' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'Mediterranean', value: 'mediterranean' },
  { label: 'Middle Eastern', value: 'middle_eastern' },
  { label: 'Levantine', value: 'levantine' },
  { label: 'North African', value: 'north_african' },
  { label: 'Indian', value: 'indian' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Thai', value: 'thai' },
  { label: 'Korean', value: 'korean' },
  { label: 'Latin American', value: 'latin_american' },
  { label: 'Nordic', value: 'nordic' },
  { label: 'Modern European', value: 'modern_european' },
  { label: 'Pastry & bakery', value: 'pastry' },
  { label: 'Plant-based', value: 'plant_based' },
]

export const CHEF_STATUSES: SelectOption[] = [
  { label: 'Pending review', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'On hold', value: 'on_hold' },
  { label: 'Declined', value: 'declined' },
]

/* ═══ Recipes ════════════════════════════════════════════════════════ */

export const RECIPE_COURSES: SelectOption[] = [
  { label: 'Starter', value: 'starter' },
  { label: 'Soup', value: 'soup' },
  { label: 'Salad', value: 'salad' },
  { label: 'Main course', value: 'main' },
  { label: 'Side dish', value: 'side' },
  { label: 'Pasta & rice', value: 'pasta_rice' },
  { label: 'Bread & bakery', value: 'bakery' },
  { label: 'Dessert', value: 'dessert' },
  { label: 'Sauce, dressing or condiment', value: 'sauce' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Drink', value: 'drink' },
]

export const RECIPE_DIFFICULTY: SelectOption[] = [
  { label: 'Easy', value: 'easy' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

/**
 * The chef moves a recipe between `draft` and `submitted`; everything past
 * that is ours. Keeping all five in one enum means the review queue is a
 * filter on one column rather than a join against a second table.
 */
export const RECIPE_STATUSES: SelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted for review', value: 'submitted' },
  { label: 'Published', value: 'published' },
  { label: 'Changes requested', value: 'changes_requested' },
  { label: 'Archived', value: 'archived' },
]

/** What a chef is allowed to set. Publication is an editorial decision. */
export const CHEF_SETTABLE_RECIPE_STATUSES = ['draft', 'submitted'] as const

/* ═══ Lookup helpers ═════════════════════════════════════════════════ */

/** Turns a stored value back into its label, for emails and the storefront. */
export function labelFor(list: readonly SelectOption[], value: string | null | undefined): string {
  if (!value) return ''
  return list.find((option) => option.value === value)?.label ?? value
}

export function labelsFor(
  list: readonly SelectOption[],
  values: (string | null)[] | null | undefined,
): string[] {
  if (!values?.length) return []
  return values.filter(Boolean).map((value) => labelFor(list, value as string))
}
