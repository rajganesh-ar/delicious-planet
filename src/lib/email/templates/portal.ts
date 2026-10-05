import type { ChefProfile, Recipe, VendorApplication } from '../../../payload-types'
import {
  BUSINESS_TYPES,
  CERTIFICATIONS,
  CHEF_ROLES,
  CUISINES,
  EXPERIENCE_BANDS,
  RECIPE_COURSES,
  labelFor,
  labelsFor,
} from '../../portal-options'
import { countryName } from '../../countries'
import { absoluteUrl } from '../../site-url'
import { renderEmail, type Block } from '../layout'

/**
 * Every message the partner portal sends.
 *
 * Two audiences with opposite needs, so nothing is shared between the pairs
 * below. The staff alert is a summary dense enough to triage from a phone —
 * what was applied for, from where, and a link straight into the record. The
 * applicant's copy is an acknowledgement: what we have, what happens next, and
 * the one string they need to keep.
 *
 * The vendor acknowledgement is the only one of these that carries something
 * irreplaceable — the reference is how an applicant checks progress without an
 * account — so it is stated twice and never buried under a button.
 */

/* ═══ Vendor applications ════════════════════════════════════════════ */

export function vendorApplicationAdminAlertEmail(application: VendorApplication) {
  const certifications = labelsFor(CERTIFICATIONS, application.certifications)

  const rows = [
    { label: 'Company', value: application.companyName },
    { label: 'Type', value: labelFor(BUSINESS_TYPES, application.businessType) },
    { label: 'Country', value: countryName(application.country) ?? application.country ?? '—' },
    { label: 'Contact', value: application.contactName },
    { label: 'Email', value: application.email },
    { label: 'Phone', value: application.phone },
    { label: 'Reference', value: application.reference ?? '—' },
    {
      label: 'Certifications',
      value: certifications.length ? certifications.join(', ') : 'None declared',
    },
  ]

  const blocks: Block[] = [
    { type: 'facts', title: 'Applicant', rows },
    {
      type: 'lines',
      title: 'Products offered',
      lines: (application.productSummary ?? '').split(/\r?\n/),
    },
    {
      type: 'note',
      // The three ethics declarations are the ones that end an application
      // rather than merely weaken it, so they are called out here rather than
      // left to be discovered on the Compliance tab.
      text: application.ethics?.noForcedOrChildLabour
        ? 'Labour declarations affirmed on submission.'
        : 'Labour declarations NOT affirmed — check the Compliance tab before proceeding.',
    },
    {
      type: 'button',
      label: 'Open the application',
      href: absoluteUrl(`/admin/collections/vendor-applications/${application.id}`),
    },
  ]

  const { html, text } = renderEmail({
    preheader: `${application.companyName} — ${labelFor(BUSINESS_TYPES, application.businessType)}`,
    heading: 'New vendor application',
    intro: 'Someone has completed the supplier questionnaire on the portal.',
    blocks,
    footerNote: 'Sent to the notification address in Site Settings.',
  })

  return { subject: `Vendor application — ${application.companyName}`, html, text }
}

export function vendorApplicationAcknowledgementEmail(application: VendorApplication) {
  const reference = application.reference ?? ''

  const { html, text } = renderEmail({
    preheader: `We have your application. Your reference is ${reference}.`,
    heading: 'Your application has been received',
    intro: `${application.contactName}, thank you — the questionnaire for ${application.companyName} reached us in full.`,
    blocks: [
      {
        type: 'facts',
        title: 'Keep this',
        rows: [
          { label: 'Reference', value: reference },
          { label: 'Company', value: application.companyName },
        ],
      },
      {
        type: 'paragraph',
        text: 'Applications go through four stages: an initial assessment of what you have sent, an evaluation against our quality and compliance standards, verification — which may mean documentation checks or a site visit — and then formal onboarding.',
      },
      {
        type: 'paragraph',
        text: 'We review deliberately rather than quickly, and we will write to you at each stage. Nothing further is needed from you in the meantime.',
      },
      {
        type: 'button',
        label: 'Check your application status',
        href: absoluteUrl('/portal/vendor/status'),
      },
      {
        type: 'note',
        text: `Your reference is ${reference}. You will need it, with this email address, to look up progress.`,
      },
    ],
    footerNote: 'You are receiving this because a vendor application was submitted at deliciousplanet.co.',
  })

  return { subject: `Vendor application received — ${reference}`, html, text }
}

/* ═══ Chef registration ══════════════════════════════════════════════ */

export function chefRegistrationAdminAlertEmail(profile: ChefProfile) {
  const cuisines = labelsFor(CUISINES, profile.cuisines)

  const { html, text } = renderEmail({
    preheader: `${profile.displayName} — ${labelFor(CHEF_ROLES, profile.chefRole)}`,
    heading: 'A chef has registered',
    intro: 'A new contributor account has been created on the portal.',
    blocks: [
      {
        type: 'facts',
        title: 'Chef',
        rows: [
          { label: 'Name', value: profile.displayName },
          { label: 'Role', value: labelFor(CHEF_ROLES, profile.chefRole) },
          { label: 'Kitchen', value: profile.establishment || '—' },
          { label: 'Experience', value: labelFor(EXPERIENCE_BANDS, profile.experience) },
          { label: 'Cuisines', value: cuisines.length ? cuisines.join(', ') : '—' },
          { label: 'Country', value: countryName(profile.country) ?? profile.country ?? '—' },
          { label: 'Email', value: profile.email },
        ],
      },
      {
        type: 'note',
        text: 'Registration does not publish anything. Every recipe they write is reviewed on its own before it goes live.',
      },
      {
        type: 'button',
        label: 'Open the profile',
        href: absoluteUrl(`/admin/collections/chef-profiles/${profile.id}`),
      },
    ],
    footerNote: 'Sent to the notification address in Site Settings.',
  })

  return { subject: `Chef registration — ${profile.displayName}`, html, text }
}

export function chefWelcomeEmail(profile: ChefProfile) {
  const { html, text } = renderEmail({
    preheader: 'Your contributor account is ready — you can start writing recipes now.',
    heading: 'Welcome to the kitchen',
    intro: `${profile.displayName}, your chef account is active. You can sign in and start writing straight away.`,
    blocks: [
      {
        type: 'paragraph',
        text: 'Recipes here are built from our catalogue: you pick each ingredient from the products we actually stock, give it a quantity and a unit, and the page that results lets a reader buy exactly what you cooked with.',
      },
      {
        type: 'paragraph',
        text: 'Write as many drafts as you like — nothing is visible to anyone until you submit it and we have reviewed it. We usually come back within a few working days, and if something needs changing you will see a note against the recipe in your portal.',
      },
      { type: 'button', label: 'Open your portal', href: absoluteUrl('/portal/chef') },
    ],
    footerNote: 'You are receiving this because a chef account was created at deliciousplanet.co.',
  })

  return { subject: 'Your chef account is ready', html, text }
}

/* ═══ Recipes ════════════════════════════════════════════════════════ */

export function recipeSubmittedAdminAlertEmail(recipe: Recipe) {
  const ingredientCount = recipe.ingredients?.length ?? 0

  const { html, text } = renderEmail({
    preheader: `${recipe.title} by ${recipe.chefName ?? 'a chef'}`,
    heading: 'A recipe is ready for review',
    intro: 'A chef has submitted a recipe from the portal.',
    blocks: [
      {
        type: 'facts',
        title: 'Recipe',
        rows: [
          { label: 'Title', value: recipe.title },
          { label: 'Chef', value: recipe.chefName ?? '—' },
          { label: 'Course', value: labelFor(RECIPE_COURSES, recipe.course) },
          { label: 'Serves', value: String(recipe.servings ?? '—') },
          {
            label: 'Ingredients',
            value: `${ingredientCount} catalogue product${ingredientCount === 1 ? '' : 's'}`,
          },
          { label: 'Steps', value: String(recipe.method?.length ?? 0) },
        ],
      },
      {
        type: 'button',
        label: 'Review the recipe',
        href: absoluteUrl(`/admin/collections/recipes/${recipe.id}`),
      },
    ],
    footerNote: 'Sent to the notification address in Site Settings.',
  })

  return { subject: `Recipe for review — ${recipe.title}`, html, text }
}

/** Sent to the chef when an editor publishes their recipe or asks for changes. */
export function recipeDecisionEmail(recipe: Recipe, chefName: string) {
  const published = recipe.status === 'published'

  const blocks: Block[] = published
    ? [
        // No link to the recipe itself: the storefront has no recipe page yet,
        // and this button used to open a 404 under the words "it is live".
        {
          type: 'paragraph',
          text: 'An editor has approved and published it, with your byline on it and every ingredient linked to the product a reader can order.',
        },
        { type: 'button', label: 'Open your portal', href: absoluteUrl('/portal/chef') },
      ]
    : [
        {
          type: 'lines',
          title: 'What needs changing',
          lines: (recipe.reviewFeedback ?? 'No specific notes were left.').split(/\r?\n/),
        },
        {
          type: 'paragraph',
          text: 'Open it in your portal, make the changes, and submit it again — nothing is lost, and there is no limit on revisions.',
        },
        { type: 'button', label: 'Open the recipe', href: absoluteUrl('/portal/chef') },
      ]

  const { html, text } = renderEmail({
    preheader: published
      ? `${recipe.title} is now published.`
      : `${recipe.title} needs a small change before it can go live.`,
    heading: published ? 'Your recipe is published' : 'A change is needed',
    intro: published
      ? `${chefName}, ${recipe.title} has been published.`
      : `${chefName}, we have read ${recipe.title} and there is one thing to sort out first.`,
    blocks,
    footerNote: 'You are receiving this because you contribute recipes at deliciousplanet.co.',
  })

  return {
    subject: published ? `Published: ${recipe.title}` : `Changes requested: ${recipe.title}`,
    html,
    text,
  }
}
