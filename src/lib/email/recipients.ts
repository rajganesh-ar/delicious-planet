import type { Payload, PayloadRequest } from 'payload'
import { CONTACT } from '../contact'

/**
 * Where staff notifications go.
 *
 * Configured in the CMS (Site Settings → Notifications) so the address can be
 * changed without a redeploy, falling back to an environment variable and then
 * to the published company mailbox — a new order must never go unannounced just
 * because nobody filled the field in.
 *
 * Returns null when notifications are switched off, which callers treat as
 * "skip quietly" rather than as an error.
 */
export async function adminRecipient(
  payload: Payload,
  req?: PayloadRequest,
): Promise<string | null> {
  let configured: string | null = null

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
      ...(req ? { req } : {}),
    })

    if (settings?.notifications?.enabled === false) return null
    configured = settings?.notifications?.orderEmail?.trim() || null
  } catch (err) {
    // A global that has never been saved reads as missing. Falling through to
    // the env var is better than dropping the notification.
    payload.logger.warn({ err }, 'Could not read notification settings; using fallback address')
  }

  return configured || process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || CONTACT.email
}
