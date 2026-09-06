import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, hasRole, isAdmin, isAdminField } from './access'
import { COUNTRY_OPTIONS } from '../lib/countries'
import {
  CHEF_ROLES,
  CHEF_STATUSES,
  CUISINES,
  EXPERIENCE_BANDS,
  KITCHEN_TYPES,
} from '../lib/portal-options'
import { notifyChefRegistration } from './hooks/portalNotifications'
import { ensureChefSlug } from './hooks/portalHooks'

/**
 * A chef's account on the portal.
 *
 * One row per person authoring recipes, hanging off a `users` record that
 * carries the `chef` role. The split is on purpose: `users` is the login and is
 * readable by its owner and admins only, while everything a byline needs —
 * name, kitchen, cuisines — lives here, where the review workflow can sit
 * beside it.
 *
 * This collection stays private. It holds an email, a phone number and an
 * employer, and a recipe page needs none of those: Recipes snapshots the
 * display name and title at save time, the same way an order snapshots a line
 * item's title. So publishing a recipe never widens who can read the profile
 * behind it.
 *
 * Rows are created by /api/portal/chef, which makes the user and the profile
 * together. `create` is therefore admin-only here, exactly as on vendor
 * applications, and for the same reason.
 */
export const ChefProfiles: CollectionConfig = {
  slug: 'chef-profiles',
  labels: { singular: 'Chef', plural: 'Chefs' },
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'establishment', 'country', 'status', 'createdAt'],
    listSearchableFields: ['displayName', 'email', 'establishment'],
    description:
      'Chefs registered at /portal/chef. Verifying one is a badge on their recipes; it is not what lets them publish — every recipe is reviewed on its own.',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, 'admin')) return true
      // A chef reads exactly one profile: their own.
      return { account: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, 'admin')) return true
      return { account: { equals: user.id } }
    },
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [ensureChefSlug],
    afterChange: [notifyChefRegistration],
  },
  fields: [
    /* ── Identity ─────────────────────────────────────────────────── */
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      unique: true,
      admin: {
        description: 'The login this profile belongs to. One profile per account.',
        readOnly: true,
      },
      // Without this a chef could repoint their own profile at somebody else's
      // account — `update` above lets them edit the row they own.
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
      index: true,
      label: 'Name as it should appear on a recipe',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Derived from the display name on save.' },
    },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'portrait', type: 'upload', relationTo: 'media' },

    /* ── Professional background ──────────────────────────────────── */
    {
      name: 'chefRole',
      type: 'select',
      required: true,
      options: CHEF_ROLES,
      label: 'Role',
    },
    { name: 'establishment', type: 'text', label: 'Restaurant, hotel or business' },
    { name: 'kitchenType', type: 'select', options: KITCHEN_TYPES, label: 'Kind of kitchen' },
    {
      name: 'experience',
      type: 'select',
      required: true,
      options: EXPERIENCE_BANDS,
      label: 'Years in professional kitchens',
    },
    {
      name: 'cuisines',
      type: 'select',
      hasMany: true,
      required: true,
      options: CUISINES,
      label: 'Cuisines',
    },
    { name: 'specialities', type: 'textarea', label: 'Specialities' },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
      label: 'Short biography',
      admin: { description: 'Two or three sentences. Runs under the byline on a published recipe.' },
    },
    { name: 'city', type: 'text' },
    { name: 'country', type: 'select', required: true, index: true, options: COUNTRY_OPTIONS },

    /* ── Presence ─────────────────────────────────────────────────── */
    {
      name: 'links',
      type: 'group',
      label: 'Where to find them',
      fields: [
        { name: 'website', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    { name: 'awards', type: 'textarea', label: 'Awards and recognition' },
    {
      name: 'qualifications',
      type: 'array',
      label: 'Culinary qualifications',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'institution', type: 'text' },
        { name: 'year', type: 'number', min: 1900, max: 2100 },
      ],
    },

    /* ── The application itself ───────────────────────────────────── */
    {
      name: 'familiarProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Products already cooked with',
      admin: { description: 'Optional. Helps us suggest a first recipe brief.' },
    },
    {
      name: 'motivation',
      type: 'textarea',
      label: 'Why they want to publish with us',
    },
    {
      name: 'consentPublish',
      type: 'checkbox',
      defaultValue: false,
      label: 'Consented to us publishing their name, portrait and recipes',
    },
    {
      name: 'consentTerms',
      type: 'checkbox',
      defaultValue: false,
      label: 'Accepted the contributor terms',
    },

    /* ── Internal ─────────────────────────────────────────────────── */
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: CHEF_STATUSES,
      admin: { position: 'sidebar' },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Surfaces the chef on /recipes.' },
      access: { create: isAdminField, update: isAdminField },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Never shown to the chef.' },
      // Readable only by admins — a chef can read this row, so without this
      // the notes would come back in their own /api/chef-profiles response.
      access: {
        create: isAdminField,
        update: isAdminField,
        read: isAdminField,
      },
    },
  ],
  timestamps: true,
}
