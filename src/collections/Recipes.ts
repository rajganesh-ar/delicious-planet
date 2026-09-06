import type { CollectionConfig, Where } from 'payload'
import { adminOnlyInNav, hasRole, isAdminField } from './access'
import { CUISINES, RECIPE_COURSES, RECIPE_DIFFICULTY, RECIPE_STATUSES } from '../lib/portal-options'
import { UNIT_OPTIONS, unitTakesQuantity } from '../lib/units'
import { notifyRecipeSubmitted } from './hooks/portalNotifications'
import { deriveRecipeRollups, ensureRecipeSlug, pinRecipeOwnership } from './hooks/portalHooks'

/**
 * Recipes written by registered chefs.
 *
 * The rule the whole collection is built around: **an ingredient is a product
 * in our catalogue, a quantity and a unit.** There is no free-text ingredient
 * line, because a free-text line is what turns a recipe from a use case for
 * the catalogue into a page that sends the reader to a supermarket. A
 * `relationship` to `products` is what enforces it — the field cannot hold a
 * value that is not a catalogue row, in the admin panel or over the API — and
 * `filterOptions` narrows that further to products that are actually published.
 *
 * Quantities carry a unit from src/lib/units.ts rather than being typed in, so
 * "2 tbsp" and "2 tablespoons" cannot both exist, and a scaled or aggregated
 * quantity has something to convert through.
 *
 * Ownership and status are not the author's to set. `pinRecipeOwnership` binds
 * every non-admin write to the requester's own account and clamps the status
 * to draft or submitted, so a chef posting straight at /api/recipes with their
 * session cookie still cannot publish themselves or file under another byline.
 */
export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'chefName', 'course', 'status', 'updatedAt'],
    listSearchableFields: ['title', 'chefName'],
    description:
      'Submitted from /portal/chef. A recipe is only visible on the storefront once its status is Published.',
  },
  access: {
    create: ({ req: { user } }) => hasRole(user, 'admin') || hasRole(user, 'chef'),
    read: ({ req: { user } }) => {
      if (hasRole(user, 'admin')) return true
      // A chef sees their own drafts alongside everything already published;
      // everyone else sees only what has been published.
      if (hasRole(user, 'chef') && user) {
        const ownOrPublished: Where = {
          or: [{ status: { equals: 'published' } }, { author: { equals: user.id } }],
        }
        return ownOrPublished
      }
      return { status: { equals: 'published' } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, 'admin')) return true
      if (!hasRole(user, 'chef')) return false
      // Once a recipe is live it is editorial content, and an edit to it would
      // change the published page with nobody reviewing the change. The chef
      // asks for an amendment instead; an admin moves it back to draft.
      const ownAndUnpublished: Where = {
        and: [{ author: { equals: user.id } }, { status: { not_in: ['published', 'archived'] } }],
      }
      return ownAndUnpublished
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, 'admin')) return true
      if (!hasRole(user, 'chef')) return false
      const ownDrafts: Where = {
        and: [{ author: { equals: user.id } }, { status: { equals: 'draft' } }],
      }
      return ownDrafts
    },
  },
  hooks: {
    beforeValidate: [pinRecipeOwnership, ensureRecipeSlug],
    beforeChange: [deriveRecipeRollups],
    afterChange: [notifyRecipeSubmitted],
  },
  fields: [
    /* ── The dish ─────────────────────────────────────────────────── */
    { name: 'title', type: 'text', required: true, index: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Derived from the title on save.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two sentences. Used on the recipe card and in search results.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      label: 'Further photographs',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },

    /* ── Classification ───────────────────────────────────────────── */
    { name: 'course', type: 'select', required: true, index: true, options: RECIPE_COURSES },
    { name: 'cuisine', type: 'select', index: true, options: CUISINES },
    { name: 'difficulty', type: 'select', defaultValue: 'intermediate', options: RECIPE_DIFFICULTY },
    {
      name: 'servings',
      type: 'number',
      required: true,
      min: 1,
      max: 200,
      defaultValue: 4,
      admin: { description: 'What the quantities below make. The portion scaler works off this.' },
    },
    { name: 'prepMinutes', type: 'number', min: 0, max: 6000, label: 'Preparation (minutes)' },
    { name: 'cookMinutes', type: 'number', min: 0, max: 6000, label: 'Cooking (minutes)' },
    {
      name: 'totalMinutes',
      type: 'number',
      index: true,
      admin: { readOnly: true, description: 'Preparation plus cooking. Derived on save.' },
      access: { create: isAdminField, update: isAdminField },
    },

    /* ── Ingredients — catalogue products only ────────────────────── */
    {
      name: 'ingredients',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 40,
      labels: { singular: 'Ingredient', plural: 'Ingredients' },
      admin: {
        description:
          'Every ingredient is a product from our catalogue, with a quantity and a unit. There is no free-text line by design.',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          index: true,
          // Enforced on the server as well as in the picker: a draft or
          // retired product cannot be cited by a recipe that readers can buy
          // the ingredients for.
          filterOptions: () => ({ _status: { equals: 'published' } }),
        },
        {
          name: 'variantSku',
          type: 'text',
          label: 'Pack size (SKU)',
          admin: {
            description: 'Optional. The exact variant used, when the size matters to the result.',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          min: 0,
          max: 100000,
          validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
            const unit = (siblingData as { unit?: string } | undefined)?.unit
            // "To taste" is the one unit that carries no number; everything
            // else without one is an ingredient nobody can actually measure.
            if (!unitTakesQuantity(unit)) return true
            if (value == null || value === '') return 'Required.'
            if (typeof value === 'number' && value <= 0) return 'Must be greater than zero.'
            return true
          },
        },
        {
          name: 'unit',
          type: 'select',
          required: true,
          defaultValue: 'g',
          options: UNIT_OPTIONS,
        },
        {
          name: 'preparation',
          type: 'text',
          admin: { description: 'e.g. "finely chopped", "at room temperature".' },
        },
        {
          name: 'section',
          type: 'text',
          admin: { description: 'Groups the line under a heading, e.g. "For the sauce".' },
        },
        { name: 'optional', type: 'checkbox', defaultValue: false },
      ],
    },

    /* ── Method ───────────────────────────────────────────────────── */
    {
      name: 'method',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 40,
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        { name: 'instruction', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'timerMinutes',
          type: 'number',
          min: 0,
          max: 6000,
          admin: { description: 'Shows a timer beside the step.' },
        },
      ],
    },
    { name: 'chefTips', type: 'textarea', label: 'Chef’s notes' },
    { name: 'pairing', type: 'textarea', label: 'Serving and pairing' },
    {
      name: 'allergens',
      type: 'textarea',
      admin: { description: 'Anything present beyond what the products themselves declare.' },
    },

    /* ── Byline snapshots ─────────────────────────────────────────── */
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'The account that wrote it. Pinned from the session — this is what scopes a chef to their own work.',
      },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'chef',
      type: 'relationship',
      relationTo: 'chef-profiles',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'The profile behind the byline. Resolved from the author on save.',
      },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'chefName',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'Byline, snapshotted at save. Kept here so a public recipe page never has to read the private chef profile.',
      },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'chefTitle',
      type: 'text',
      admin: { readOnly: true, description: 'Role and kitchen, snapshotted alongside the name.' },
      access: { create: isAdminField, update: isAdminField },
    },

    /* ── Workflow ─────────────────────────────────────────────────── */
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: RECIPE_STATUSES,
      admin: {
        position: 'sidebar',
        description: 'A chef may only choose Draft or Submitted; the rest is an editorial decision.',
      },
    },
    {
      name: 'reviewFeedback',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Shown to the chef in their portal. Say what needs changing.',
      },
      // Writable by admins only, but deliberately readable by the author —
      // "changes requested" with no message attached is not a review.
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Never shown to the chef.' },
      access: { create: isAdminField, update: isAdminField, read: isAdminField },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar' },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
      access: { create: isAdminField, update: isAdminField },
    },
  ],
  timestamps: true,
}
