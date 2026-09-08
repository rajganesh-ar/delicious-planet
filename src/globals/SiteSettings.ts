import type { GlobalConfig } from 'payload'
import { adminOnlyInNav } from '../collections/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { hidden: adminOnlyInNav, group: 'Settings' },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Delicious Planet',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'announcementBar',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'message', type: 'text' },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text' },
        {
          name: 'backgroundColor',
          type: 'select',
          defaultValue: 'gold',
          options: ['gold', 'forest', 'obsidian'],
        },
      ],
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    {
      name: 'notifications',
      type: 'group',
      label: 'Notifications',
      admin: {
        description:
          'Where staff notifications are sent when an order is paid or an enquiry arrives.',
      },
      fields: [
        {
          name: 'orderEmail',
          type: 'email',
          admin: {
            description:
              'Leave blank to fall back to the ADMIN_NOTIFICATION_EMAIL environment variable, then to the published company mailbox.',
          },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Send staff notifications',
          admin: {
            description:
              'Unticking this stops staff alerts only. Customers still receive their own order confirmations.',
          },
        },
      ],
    },
    {
      name: 'defaultMeta',
      type: 'group',
      label: 'Default SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
