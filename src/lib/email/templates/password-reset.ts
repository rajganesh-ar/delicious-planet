import { renderEmail } from '../layout'

/**
 * The reset link deliberately points at the storefront, not at /admin.
 *
 * Payload's default reset URL lands in the admin panel, which every customer is
 * refused by Users.access.admin — so the stock link would take a locked-out
 * shopper to a page telling them they are not allowed in. `/reset-password`
 * exists for exactly this.
 */
export function passwordResetEmail(resetUrl: string, name?: string | null) {
  const { html, text } = renderEmail({
    preheader: 'Use the link inside to set a new password. It expires shortly.',
    heading: 'Reset your password',
    intro: name
      ? `${name}, we received a request to reset the password on your Delicious Planet account.`
      : 'We received a request to reset the password on your Delicious Planet account.',
    blocks: [
      { type: 'button', label: 'Set a new password', href: resetUrl },
      {
        type: 'paragraph',
        text: 'If the button does not work, copy this link into your browser:',
      },
      { type: 'lines', lines: [resetUrl] },
      {
        type: 'note',
        text: 'The link expires shortly and can only be used once. If you did not ask to reset your password you can ignore this email — nothing has changed, and your current password still works.',
      },
    ],
    footerNote: 'This email was sent because a password reset was requested for this address.',
  })

  return { subject: 'Reset your Delicious Planet password', html, text }
}
