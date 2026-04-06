import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const testimonials = [
  {
    name: 'Marco Bellini',
    role: 'Executive Chef',
    company: 'Ristorante Oro, Dubai',
    quote:
      'The quality of ingredients from Delicious Planet is unmatched. Their caviar selection and artisan oils have elevated our tasting menus to an entirely new level.',
    rating: 5,
  },
  {
    name: 'Sophia Laurent',
    role: 'Pastry Chef',
    company: 'Maison Douce',
    quote:
      'I have been sourcing Caputo flour and Velsoro chocolate through Delicious Planet for over a year. The consistency and freshness are remarkable — my pastries have never been better.',
    rating: 5,
  },
  {
    name: 'Ahmed Al-Rashid',
    role: 'Food & Beverage Director',
    company: 'The Royal Palm Hotel',
    quote:
      'Delicious Planet understands the demands of luxury hospitality. Their curated selection and reliable delivery make them our go-to partner for premium ingredients.',
    rating: 5,
  },
  {
    name: 'Elena Rossi',
    role: 'Home Cook & Food Blogger',
    company: 'La Cucina di Elena',
    quote:
      'As someone who cooks at home but refuses to compromise on quality, Delicious Planet has been a revelation. Every product feels like it was chosen with genuine care.',
    rating: 5,
  },
  {
    name: 'James Chen',
    role: 'Sommelier & Culinary Consultant',
    company: '',
    quote:
      'The traceability and provenance of every product gives me confidence when recommending ingredients to my clients. This is sourcing done right.',
    rating: 5,
  },
]

async function seedTestimonials() {
  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'testimonials', limit: 1 })
  if (existing.totalDocs > 0) {
    console.log('Testimonials already exist, skipping seed.')
    return
  }

  console.log('\n=== Seeding Testimonials ===')
  for (const t of testimonials) {
    await payload.create({
      collection: 'testimonials',
      data: t,
      overrideAccess: true,
    })
    console.log(`  [created] testimonial: ${t.name}`)
  }
  console.log('\n✅ Testimonials seeded successfully.')
}

seedTestimonials()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
