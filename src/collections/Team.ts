import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'

/**
 * The people shown in "Our people" on /about.
 *
 * One row per person, founder included — the founder is not a separate concept,
 * just the row with `isFounder` checked, which the page pulls out and renders as
 * the wide quote card beside the grid. Keeping them in one collection means an
 * editor changes a job title in one place and never wonders which of two lists
 * owns a person.
 *
 * `role` is required and `name` is not, because the About grid already renders
 * a nameless row as "Open role" — a vacancy is a real thing to publish, and it
 * needs a title but not a person. That is also why `useAsTitle` is `role`: a
 * vacancy would otherwise show as "Untitled" in the admin list.
 *
 * With no rows the section hides entirely, the same way /about hides its office
 * section when `office-locations` is empty.
 */
export const Team: CollectionConfig = {
  slug: 'team',
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'role',
    defaultColumns: ['role', 'name', 'isFounder', 'active', 'sortOrder'],
    group: 'Content',
    description:
      'The "Our people" section on the About page. Leave a row\'s name blank to advertise it as an open role.',
  },
  access: catalogueAccess,
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { description: 'Job title, e.g. "Head of Sourcing". Shown under the name.' },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description:
          'Leave blank for a vacancy — the card then reads "Open role" and keeps the job title.',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Square portrait, 800 × 800 or larger. Without one the card shows a placeholder.',
      },
    },
    {
      name: 'isFounder',
      label: 'Show as founder',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Renders this person as the wide card beside the grid, with their quote. Check it on one row only — if several are checked the first by priority wins.',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      admin: {
        description:
          'Only used by the founder card. Quotation marks are added by the page — do not type them.',
        condition: (data) => Boolean(data?.isFounder),
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide someone without deleting the row.' },
    },
    {
      // `sortOrder` everywhere in this codebase — see the same note on Regions.
      name: 'sortOrder',
      label: 'Priority',
      type: 'number',
      admin: {
        description:
          'Lower shows first. Decimals and negatives are allowed, so someone can be slotted between two others (2.5) without renumbering the rest. Left blank, they fall behind everyone who has a number.',
      },
    },
  ],
}
