import { absoluteUrl } from '../../site-url'
import { renderEmail } from '../layout'

/** Confirms a signup and gives the subscriber somewhere to go next. */
export function newsletterWelcomeEmail() {
  const { html, text } = renderEmail({
    preheader: 'You are on the list. Here is what to expect.',
    heading: 'Welcome to Delicious Planet',
    intro: 'Thank you for subscribing. You are on the list.',
    blocks: [
      {
        type: 'paragraph',
        text: 'We write when there is something worth writing about: new arrivals from our producers, seasonal specials, and the occasional note from the people who grow and make what we sell.',
      },
      { type: 'button', label: 'Browse the range', href: absoluteUrl('/products') },
      {
        type: 'note',
        text: 'If you did not sign up for this, no action is needed — simply ignore this email and you will hear nothing further.',
      },
    ],
    footerNote: 'You are receiving this because this address was subscribed at deliciousplanet.co.',
  })

  return { subject: 'Welcome to Delicious Planet', html, text }
}
