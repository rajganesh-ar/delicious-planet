import type { CollectionAfterChangeHook } from 'payload'
import type { ChefProfile, Recipe, VendorApplication } from '../../payload-types'
import { adminRecipient } from '../../lib/email/recipients'
import { sendEmail } from '../../lib/email/send'
import {
  chefRegistrationAdminAlertEmail,
  chefWelcomeEmail,
  recipeDecisionEmail,
  recipeSubmittedAdminAlertEmail,
  vendorApplicationAcknowledgementEmail,
  vendorApplicationAdminAlertEmail,
} from '../../lib/email/templates/portal'

/**
 * Notifications for the partner portal.
 *
 * Same posture as notificationHooks: every one of these runs inside the
 * request's transaction, so an uncaught throw would roll the row back and hand
 * the applicant an error for a submission that was otherwise fine. Losing the
 * email is bad; losing a sixty-question application is worse. So each hook
 * swallows and logs.
 */

export const notifyVendorApplication: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const application = doc as VendorApplication

  try {
    const staff = await adminRecipient(payload, req)
    const sends: Promise<boolean>[] = []

    if (staff) {
      sends.push(
        sendEmail(payload, { to: staff, ...vendorApplicationAdminAlertEmail(application) }),
      )
    }
    if (application.email) {
      sends.push(
        sendEmail(payload, {
          to: application.email,
          ...vendorApplicationAcknowledgementEmail(application),
        }),
      )
    }

    await Promise.allSettled(sends)
  } catch (err) {
    payload.logger.error({ err, id: application.id }, 'Vendor application notification failed')
  }

  return doc
}

export const notifyChefRegistration: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const profile = doc as ChefProfile

  try {
    const staff = await adminRecipient(payload, req)
    const sends: Promise<boolean>[] = []

    if (staff) {
      sends.push(sendEmail(payload, { to: staff, ...chefRegistrationAdminAlertEmail(profile) }))
    }
    if (profile.email) {
      sends.push(sendEmail(payload, { to: profile.email, ...chefWelcomeEmail(profile) }))
    }

    await Promise.allSettled(sends)
  } catch (err) {
    payload.logger.error({ err, id: profile.id }, 'Chef registration notification failed')
  }

  return doc
}

/**
 * Fires on both directions of the review: to us when a chef submits, and back
 * to the chef when an editor publishes or asks for a change.
 *
 * Keyed on the status having actually moved. Without that check, saving a
 * published recipe to fix a typo would email the chef that it has just been
 * published, every time.
 */
export const notifyRecipeSubmitted: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req
  const recipe = doc as Recipe
  const previousStatus = (previousDoc as Recipe | undefined)?.status
  if (operation !== 'create' && recipe.status === previousStatus) return doc

  try {
    if (recipe.status === 'submitted') {
      const staff = await adminRecipient(payload, req)
      if (staff) {
        await sendEmail(payload, { to: staff, ...recipeSubmittedAdminAlertEmail(recipe) })
      }
      return doc
    }

    if (recipe.status === 'published' || recipe.status === 'changes_requested') {
      // The author's address is on their profile, not on the recipe — the
      // byline snapshot deliberately carries no contact details.
      const chefId =
        typeof recipe.chef === 'object' && recipe.chef !== null ? recipe.chef.id : recipe.chef
      if (chefId == null) return doc

      const profile = await payload.findByID({
        collection: 'chef-profiles',
        id: chefId,
        depth: 0,
        overrideAccess: true,
        req,
      })

      if (profile?.email) {
        await sendEmail(payload, {
          to: profile.email,
          ...recipeDecisionEmail(recipe, profile.displayName ?? 'Chef'),
        })
      }
    }
  } catch (err) {
    payload.logger.error({ err, id: recipe.id }, 'Recipe notification failed')
  }

  return doc
}
