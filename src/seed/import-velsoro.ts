import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { importImage } from './utils/import-image'
import { htmlToLexical, htmlToShortDescription } from './utils/to-lexical'

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

const CDN = 'https://cdn.shopify.com/s/files/1/0682/3067/6638/files/'

async function lookupId(
  payload: PayloadInstance,
  collection: 'categories' | 'suppliers' | 'brands',
  slug: string,
): Promise<number> {
  const result = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 })
  if (!result.docs.length)
    throw new Error(`${collection}/${slug} not found — run seed-base-data first`)
  return result.docs[0]!.id as number
}

async function upsertProduct(
  payload: PayloadInstance,
  slug: string,
  data: Record<string, unknown>,
): Promise<void> {
  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    if ((data.images as Array<unknown>)?.length) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0]!.id as number,
        data: { images: data.images } as never,
        overrideAccess: true,
      })
      console.log(`  [updated images] products/${slug}`)
    } else {
      console.log(`  [skip] products/${slug}`)
    }
    return
  }
  await payload.create({
    collection: 'products',
    data: { ...data, slug } as never,
    overrideAccess: true,
  })
  console.log(`  [created] products/${slug}`)
}

/* ─────────────────────────── product data ─────────────────────────────────
   body_html sourced from Velsoro Shopify products.json endpoint (all 33 items)
   ──────────────────────────────────────────────────────────────────────────*/

interface VelsoroProduct {
  slug: string
  title: string
  imageFiles: string[]
  bodyHtml: string
  prices: { currency: string; amount: number }[]
  sizeVariants?: { size: string; priceAED: number; variantSku: string; inStock: boolean }[]
  categorySlug: string
  barcode?: string
  inStock: boolean
  dietary?: Record<string, boolean>
  allergens?: string
  ingredients?: string
}

const products: VelsoroProduct[] = [
  // ── BOXES ────────────────────────────────────────────────────────────────
  {
    slug: 'velsoro-box-4-bonbons',
    title: 'Velsoro Box of 4 Bonbons',
    imageFiles: ['DSC02021.jpg', 'DSC02024.jpg', 'DSC01819.jpg'],
    bodyHtml:
      '<p>A petite selection of 4 hand-crafted Belgian bonbons presented in our signature gift box. Each piece is made with single-origin Callebaut chocolate and filled with our signature ganaches — caramel, pistachio, dark and milk. Perfect as a thoughtful gift or a personal indulgence.</p>',
    prices: [{ currency: 'AED', amount: 65 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten.',
    ingredients:
      'Dark chocolate (cocoa mass, sugar, cocoa butter, vanilla extract), milk chocolate (cocoa mass, sugar, cocoa butter, whole milk powder, vanilla extract), heavy cream, butter, pistachio paste, caramel.',
  },
  {
    slug: 'velsoro-box-12-bonbons',
    title: 'Velsoro Box of 12 Bonbons',
    imageFiles: ['DSC02025.jpg', 'DSC02027.jpg'],
    bodyHtml:
      '<p>Twelve meticulously crafted chocolate bonbons arranged in our elegant gift box. Discover a range of flavours — pistachio ganache, salted caramel, dark praline, milk velvet, and more — each enrobed in couverture chocolate with a distinctive finish.</p>',
    prices: [{ currency: 'AED', amount: 145 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (pistachio, hazelnut). May contain traces of gluten.',
    ingredients:
      'Dark chocolate (cocoa mass, sugar, cocoa butter, vanilla extract), milk chocolate, heavy cream, butter, pistachio paste, hazelnut paste, caramel, sea salt.',
  },
  {
    slug: 'velsoro-box-24-bonbons',
    title: 'Velsoro Box of 24 Bonbons',
    imageFiles: ['DSC01806_fd6eee7c-c845-4e45-93e4-894e51d28f09.jpg', 'DSC01808_e7ab38bb-112d-4d87-8280-4f2bdcfd7fd8.jpg', 'DSC01813.jpg', 'DSC01802.jpg'],
    bodyHtml:
      "<p>Our most popular gift: 24 hand-crafted bonbons in a luxurious presentation box. A showcase of Velsoro's signature flavours — ideal for corporate gifting, celebrations, and special occasions. Each bonbon is inspected by hand to ensure perfect finish.</p>",
    prices: [{ currency: 'AED', amount: 275 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio, hazelnut, almond). May contain traces of gluten.',
    ingredients:
      'Dark chocolate, milk chocolate, white chocolate, heavy cream, butter, pistachio paste, hazelnut paste, almond paste, caramel, sea salt, vanilla, natural flavours.',
  },
  {
    slug: 'velsoro-box-48-bonbons',
    title: 'Velsoro Box of 48 Bonbons',
    imageFiles: ['DSC02018_5d52f1df-8e89-4e02-a00b-27c90030b51b.jpg', 'DSC01810_06d28669-efea-4a0d-8f46-f39ebb169aae.jpg'],
    bodyHtml:
      '<p>48 hand-crafted Velsoro bonbons — the ultimate statement gift. Presented in our grand double-layer gift box, this collection includes our full flavour portfolio and makes an unforgettable impression at weddings, corporate events, and fine celebrations.</p>',
    prices: [{ currency: 'AED', amount: 520 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio, hazelnut, almond). May contain traces of gluten.',
    ingredients:
      'Dark chocolate, milk chocolate, white chocolate, heavy cream, butter, pistachio paste, hazelnut paste, almond paste, caramel, sea salt, vanilla, natural flavours.',
  },

  // ── BARS – 40 g ──────────────────────────────────────────────────────────
  {
    slug: 'velsoro-dark-70-bar-40g',
    title: 'Velsoro Dark 70% Bar 40g',
    imageFiles: ['D0F8FF23-1B42-4F23-B309-72A19C7DA974.jpg', '8A99FEEC-1B0D-4B5D-BD02-32FD98C00A80.jpg', 'DSC01932_7b109aec-2bd6-449a-8216-f6666e5bd552.jpg', 'DSC01933_c6c62723-448c-403e-8e47-26ddea23b318.jpg'],
    bodyHtml:
      '<p>Pure and intense — our 70% Single-Origin Dark Chocolate bar is crafted from carefully selected cacao beans. Expect deep cocoa flavour with fruity undertones and a clean, lingering finish. Vegan-friendly and free from added dairy.</p>',
    prices: [{ currency: 'AED', amount: 28 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true, isVegan: true, isGlutenFree: true, isLactoseFree: true },
    allergens: 'Contains soy. May contain traces of milk, tree nuts, gluten.',
    ingredients:
      'Cocoa mass, sugar, cocoa butter, vanilla extract, soy lecithin. Cocoa solids: 70% minimum.',
  },
  {
    slug: 'velsoro-dark-70-bar-56g',
    title: 'Velsoro Dark 70% Bar 56g',
    imageFiles: ['C8E8C267-EB47-498A-83EF-A8F6E1DA7B2B.jpg', '9E9B59E7-AF4D-4342-A5E0-BE37F641E213.jpg', 'DSC01921.jpg', 'DSC01923.jpg'],
    bodyHtml:
      '<p>Our 70% Single-Origin Dark Chocolate bar in the generous 56g sharing size. Intense cocoa aroma, rich and smooth texture — a go-to for pure dark chocolate love. Vegan-friendly and free from added dairy.</p>',
    prices: [{ currency: 'AED', amount: 38 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true, isVegan: true, isGlutenFree: true, isLactoseFree: true },
    allergens: 'Contains soy. May contain traces of milk, tree nuts, gluten.',
    ingredients:
      'Cocoa mass, sugar, cocoa butter, vanilla extract, soy lecithin. Cocoa solids: 70% minimum.',
  },
  {
    slug: 'velsoro-milk-almond-bar-40g',
    title: 'Velsoro Milk & Almonds Bar 40g',
    imageFiles: ['97C63DDA-D5D0-4646-94C9-E6B7CA58D3CF.jpg', '489D299E-C027-417F-B185-4D37FE9F3EBE.jpg', 'DSC01934_8ea17561-69db-45dc-95c1-86b0565a0719.jpg'],
    bodyHtml:
      '<p>Creamy milk chocolate meets the satisfying crunch of whole roasted almonds. Our Milk & Almonds bar combines smooth Callebaut milk couverture with premium whole almonds for a classic combination that never disappoints.</p>',
    prices: [{ currency: 'AED', amount: 28 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (almonds). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate (cocoa mass, sugar, cocoa butter, whole milk powder, vanilla extract, soy lecithin), whole roasted almonds. Cocoa solids: 38% minimum. Milk solids: 22% minimum.',
  },
  {
    slug: 'velsoro-milk-almond-bar-56g',
    title: 'Velsoro Milk & Almonds Bar 56g',
    imageFiles: ['8B3C472F-EC32-4039-93B3-0C66EF11D2A1.jpg', '0D6AE432-896D-4E8E-8393-25952CB4AE0E.jpg', 'DSC01919.jpg', 'DSC01920.jpg'],
    bodyHtml:
      '<p>The larger format of our beloved Milk & Almonds bar — perfect for sharing. 56g of creamy milk chocolate generously studded with whole roasted almonds. A timeless combination of sweet and nutty.</p>',
    prices: [{ currency: 'AED', amount: 38 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (almonds). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate (cocoa mass, sugar, cocoa butter, whole milk powder, vanilla extract, soy lecithin), whole roasted almonds. Cocoa solids: 38% minimum. Milk solids: 22% minimum.',
  },
  {
    slug: 'velsoro-caramel-pistachio-bar-40g',
    title: 'Velsoro Caramel & Pistachio Bar 40g',
    imageFiles: ['09E1160D-D9DE-410D-AAA9-066091C44EB3.jpg', '09808445-3961-4901-BF54-8DEF8E9BB70E.jpg', 'DSC01938.jpg', 'DSC01939_aee96309-dce7-447c-a518-e49144c2e156.jpg'],
    bodyHtml:
      '<p>A decadent pairing of silky caramel and vibrant pistachio layered within smooth milk chocolate. Each bite delivers a luxurious sweet-nutty contrast that has made this one of our bestselling bars.</p>',
    prices: [{ currency: 'AED', amount: 32 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate, caramel (sugar, glucose syrup, butter, cream, sea salt), pistachio paste, soy lecithin.',
  },
  {
    slug: 'velsoro-caramel-pistachio-bar-56g',
    title: 'Velsoro Caramel & Pistachio Bar 56g',
    imageFiles: ['2824EC41-ED7F-460B-892F-180C4BD63A92.jpg', '29C87156-125D-4AFE-9783-FBE6E09517AF.jpg', 'DSC01924.jpg', 'DSC01925.jpg'],
    bodyHtml:
      '<p>56g of indulgence: our award-winning Caramel & Pistachio bar in the sharing size. Silky caramel meets vibrant pistachio paste within luscious milk couverture. Treat yourself or someone special.</p>',
    prices: [{ currency: 'AED', amount: 42 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate, caramel (sugar, glucose syrup, butter, cream, sea salt), pistachio paste, soy lecithin.',
  },
  {
    slug: 'velsoro-ruby-pistachio-bar-40g',
    title: 'Velsoro Ruby & Pistachio Bar 40g',
    imageFiles: ['891FD7F5-6A41-420E-9C8C-EA870BD899AE.jpg', '13FE6840-36C2-4DA5-A683-B700F5D7CE29.jpg', 'DSC01940.jpg', 'DSC01941.jpg'],
    bodyHtml:
      "<p>A vibrant symphony of Ruby chocolate's natural berry notes and rich pistachio paste. Our Ruby & Pistachio bar is visually stunning and flavourfully complex — the perfect bar for those who crave something extraordinary.</p>",
    prices: [{ currency: 'AED', amount: 35 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Ruby chocolate (cocoa butter, sugar, skimmed milk powder, cocoa mass, natural flavour), pistachio paste, soy lecithin.',
  },
  {
    slug: 'velsoro-ruby-pistachio-bar-56g',
    title: 'Velsoro Ruby & Pistachio Bar 56g',
    imageFiles: ['C2FB25D4-6B5A-43EC-BEF2-0A2AA585BE90.jpg', '59FB4846-0930-4E54-894E-5F2C1BF76976.jpg', 'DSC01929.jpg', 'DSC01931.jpg'],
    bodyHtml:
      "<p>The 56g format of our showstopping Ruby & Pistachio bar. Ruby chocolate's fruity blush paired with vibrant green pistachio paste — a sensory experience in every square. Sustainably sourced cacao.</p>",
    prices: [{ currency: 'AED', amount: 45 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Ruby chocolate (cocoa butter, sugar, skimmed milk powder, cocoa mass, natural flavour), pistachio paste, soy lecithin.',
  },
  {
    slug: 'velsoro-sugar-free-dark-bar-56g',
    title: 'Velsoro Sugar-Free Dark Bar 56g',
    imageFiles: ['8856A03A-7458-4E6F-8DD4-DBC0C4D2174B.jpg', 'AE181D1A-D334-4AB9-88CE-1FB51557AE92.jpg', 'DSC01927.jpg', 'DSC01928.jpg'],
    bodyHtml:
      '<p>All the intensity of our 70% dark chocolate, now sweetened with maltitol for a sugar-free experience. Perfect for diabetics, low-carb, and keto lifestyles. Same bold cocoa flavour — zero added sugar.</p>',
    prices: [{ currency: 'AED', amount: 42 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true, isVegan: true, isGlutenFree: true, isLactoseFree: true },
    allergens: 'Contains soy. May contain traces of milk, tree nuts, gluten.',
    ingredients:
      'Cocoa mass, maltitol, cocoa butter, vanilla extract, soy lecithin. Cocoa solids: 70% minimum. Excessive consumption may have a laxative effect.',
  },
  {
    slug: 'velsoro-sugar-free-maltitol-bar-40g',
    title: 'Velsoro Sugar-Free Maltitol Bar 40g',
    imageFiles: ['535AA796-C328-4B14-BC2D-1FB93BEFBC7A.jpg', '9DD120F2-61B1-4AD1-8C8F-33EAB3FFB949.jpg', 'DSC01936.jpg', 'DSC01933.jpg'],
    bodyHtml:
      '<p>A smooth, reduced-sugar milk chocolate bar sweetened with maltitol. Indulge guilt-free with the same creamy texture you love — ideal for those monitoring sugar intake without sacrificing flavour.</p>',
    prices: [{ currency: 'AED', amount: 32 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true, isGlutenFree: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Cocoa mass, maltitol, cocoa butter, whole milk powder, vanilla extract, soy lecithin. Excessive consumption may have a laxative effect.',
  },
  {
    slug: 'velsoro-sugar-free-plain-bar',
    title: 'Velsoro Sugar-Free Plain Bar',
    imageFiles: ['266B7848-F413-4376-A777-8F1F206B1A73.jpg', 'A9DE1350-6FB1-466D-8C70-4E92EF886A5B.jpg'],
    bodyHtml:
      '<p>Our classic sugar-free plain dark chocolate bar: pure cocoa with no added sugar, no artificial flavours, and no compromise on taste. Clean-label, diabetic-suitable, and vegan-friendly.</p>',
    prices: [{ currency: 'AED', amount: 38 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true, isVegan: true, isGlutenFree: true, isLactoseFree: true },
    allergens: 'Contains soy. May contain traces of milk, tree nuts, gluten.',
    ingredients:
      'Cocoa mass, maltitol, cocoa butter, soy lecithin. Cocoa solids: 72% minimum. Excessive consumption may have a laxative effect.',
  },
  {
    slug: 'velsoro-caramel-pistachio-bar-100g',
    title: 'Velsoro Caramel & Pistachio Bar 100g',
    imageFiles: ['CFE5CFB0-E547-4496-9D04-A58B3A40C0B9.jpg', 'BA62EBC2-A88F-4540-BF2E-D9374102C9DE.jpg'],
    bodyHtml:
      '<p>Our bestselling Caramel & Pistachio flavour in a generous 100g format. A luscious slab of milk couverture layered with liquid caramel and pistachio paste — great for home indulgence and baking.</p>',
    prices: [{ currency: 'AED', amount: 58 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate, caramel (sugar, glucose syrup, butter, cream, sea salt), pistachio paste, soy lecithin.',
  },
  {
    slug: 'velsoro-ruby-pistachio-bar-100g',
    title: 'Velsoro Ruby & Pistachio Bar 100g',
    imageFiles: ['7D97131A-5B73-4369-985A-2046523FB005.jpg', '133818D5-691C-4235-97B4-BD06269B3B03.jpg'],
    bodyHtml:
      '<p>100g of our vibrant Ruby & Pistachio experience in one indulgent bar. The natural berry notes of Ruby chocolate fused with creamy pistachio paste — ideal for gifting or an afternoon treat.</p>',
    prices: [{ currency: 'AED', amount: 68 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Ruby chocolate (cocoa butter, sugar, skimmed milk powder, cocoa mass, natural flavour), pistachio paste, soy lecithin.',
  },
  {
    slug: 'velsoro-milk-almonds-bar-100g',
    title: 'Velsoro Milk & Almonds Bar 100g',
    imageFiles: ['3F715284-C0B4-4AA2-8E0F-37FE90E48C16.jpg', '7F0502A2-02F8-43C1-8956-847B83991DFD.jpg'],
    bodyHtml:
      '<p>100g of our classic Milk & Almonds bar — a generous slab of creamy milk chocolate generously studded with whole roasted almonds. Perfect for nut lovers and a popular everyday treat.</p>',
    prices: [{ currency: 'AED', amount: 58 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (almonds). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate (cocoa mass, sugar, cocoa butter, whole milk powder, vanilla extract, soy lecithin), whole roasted almonds. Cocoa solids: 38% minimum.',
  },
  {
    slug: 'velsoro-dark-70-hazelnuts-bar-100g',
    title: 'Velsoro Dark 70% & Hazelnuts Bar 100g',
    imageFiles: ['5C8C671C-4BF0-41DF-941D-9C78D93C6B7F.jpg', '3187D1F7-21BE-4E15-841A-6B0B7278D286.jpg'],
    bodyHtml:
      '<p>Intense 70% single-origin dark chocolate meets whole roasted hazelnuts in a 100g slab of pure indulgence. Bold cocoa notes and satisfying crunch in every bite. Naturally gluten-free and free from dairy.</p>',
    prices: [{ currency: 'AED', amount: 62 }],
    categorySlug: 'chocolate-bars',
    inStock: true,
    dietary: { isHalal: true, isVegan: true, isGlutenFree: true, isLactoseFree: true },
    allergens:
      'Contains soy, tree nuts (hazelnuts). May contain traces of milk, gluten, other nuts.',
    ingredients:
      'Cocoa mass, sugar, cocoa butter, whole roasted hazelnuts, vanilla extract, soy lecithin. Cocoa solids: 70% minimum.',
  },

  // ── BOX OF 5 BARS ────────────────────────────────────────────────────────
  {
    slug: 'velsoro-box-5-bars-40g',
    title: 'Velsoro Box of 5 Bars (40g each)',
    imageFiles: ['DSC01843.jpg', 'DSC01842.jpg'],
    bodyHtml:
      '<p>A curated selection of 5 of our 40g signature bars — one each of Dark 70%, Milk & Almonds, Caramel & Pistachio, Ruby & Pistachio, and Sugar-Free Dark. A beautiful introduction to the Velsoro bar range, elegantly gift-boxed.</p>',
    prices: [{ currency: 'AED', amount: 130 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (almonds, pistachio). May contain traces of gluten.',
    ingredients: 'Assorted: see individual bar labels.',
  },
  {
    slug: 'velsoro-box-5-bars-56g',
    title: 'Velsoro Box of 5 Bars (56g each)',
    imageFiles: ['DSC01841.jpg', 'DSC01827.jpg'],
    bodyHtml:
      '<p>Five 56g signature bars in a premium gift box — the perfect present for any chocolate lover. Includes Dark 70%, Milk & Almonds, Caramel & Pistachio, Ruby & Pistachio, and Sugar-Free Dark. Beautifully presented for gifting.</p>',
    prices: [{ currency: 'AED', amount: 175 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (almonds, pistachio). May contain traces of gluten.',
    ingredients: 'Assorted: see individual bar labels.',
  },
  {
    slug: 'velsoro-box-5-bars-100g',
    title: 'Velsoro Box of 5 Bars (100g each)',
    imageFiles: ['DSC01840.jpg', 'IMG-9271.jpg'],
    bodyHtml:
      '<p>Our grandest bar gift — five 100g Velsoro bars in an elegant presentation box. Includes Caramel & Pistachio, Ruby & Pistachio, Milk & Almonds, Dark 70% & Hazelnuts, and Sugar-Free Plain. A truly impressive gift.</p>',
    prices: [{ currency: 'AED', amount: 280 }],
    categorySlug: 'chocolate-boxes-bonbons',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (almonds, pistachio, hazelnuts). May contain traces of gluten.',
    ingredients: 'Assorted: see individual bar labels.',
  },

  // ── TRUFFLES (out of stock) ───────────────────────────────────────────────
  {
    slug: 'velsoro-classic-truffles',
    title: 'Velsoro Classic Dark Truffles',
    imageFiles: ['DSC01945.jpg', 'DSC01854.jpg'],
    bodyHtml:
      '<p>Hand-rolled dark chocolate truffles dusted in pure cocoa powder. Each truffle features a smooth, velvety ganache centre — made with 70% single-origin cocoa — and a delicate feather-light crust. Classically indulgent.</p>',
    prices: [{ currency: 'AED', amount: 95 }],
    categorySlug: 'chocolate-truffles',
    inStock: false,
    dietary: { isHalal: true, isGlutenFree: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Dark chocolate (cocoa mass, sugar, cocoa butter, vanilla), heavy cream, butter, cocoa powder. Cocoa solids: 70% minimum.',
  },
  {
    slug: 'velsoro-coffee-truffles',
    title: 'Velsoro Coffee Truffles',
    imageFiles: ['DSC01943.jpg', 'DSC01855.jpg'],
    bodyHtml:
      '<p>Dark chocolate truffles with a velvety espresso ganache centre, dusted in a blend of cocoa and fine ground coffee. For the coffee and chocolate devotee — a sophisticated, double-hit of intensity in every bite.</p>',
    prices: [{ currency: 'AED', amount: 95 }],
    categorySlug: 'chocolate-truffles',
    inStock: false,
    dietary: { isHalal: true, isGlutenFree: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Dark chocolate, heavy cream, butter, espresso extract, ground coffee, cocoa powder. Cocoa solids: 70% minimum.',
  },
  {
    slug: 'velsoro-orange-truffles',
    title: 'Velsoro Orange & Dark Truffles',
    imageFiles: ['DSC01944.jpg', 'DSC01853.jpg'],
    bodyHtml:
      '<p>Dark chocolate truffles infused with natural orange zest — a timeless flavour combination elevated with single-origin cocoa. Bright citrus aroma meets deep, complex chocolate in a hand-rolled, cocoa-dusted truffle.</p>',
    prices: [{ currency: 'AED', amount: 95 }],
    categorySlug: 'chocolate-truffles',
    inStock: false,
    dietary: { isHalal: true, isGlutenFree: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Dark chocolate, heavy cream, butter, natural orange oil, orange zest, cocoa powder. Cocoa solids: 70% minimum.',
  },

  // ── TEDDY BEARS ──────────────────────────────────────────────────────────
  {
    slug: 'velsoro-teddy-bear-red',
    title: 'Velsoro Chocolate Teddy Bear – Red',
    imageFiles: ['DSC01880_9a491eb7-9549-40ff-9371-6734bae9f430.jpg', 'DSC01893_3dc4e42e-4134-4a2b-ad5a-ef74bddeb303.jpg', 'B984FBC6-C597-4ADF-B3FC-B264348532C9.jpg'],
    bodyHtml:
      "<p>Our iconic chocolate teddy bear in a vibrant red finish — a showstopping gift for birthdays, Valentine's Day, and celebrations. Hand-crafted from smooth milk chocolate and hollow-cast for a generous presentation. Approximately 200g.</p>",
    prices: [{ currency: 'AED', amount: 120 }],
    categorySlug: 'teddy-bears',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Milk chocolate (cocoa butter, sugar, whole milk powder, cocoa mass, vanilla, soy lecithin).',
  },
  {
    slug: 'velsoro-teddy-bear-milky',
    title: 'Velsoro Chocolate Teddy Bear – Milky',
    imageFiles: ['DSC01881_22324c6c-d680-4c71-a5ab-888c369c072e.jpg', 'DSC01890_83986304-d223-4f66-bd0d-48ec407846be.jpg'],
    bodyHtml:
      '<p>A soft, creamy milk chocolate teddy bear in a classic milky finish — beloved by children and adults alike. Hollow-cast for a dramatic presentation, this bear makes an unforgettable gift for any occasion. Approximately 200g.</p>',
    prices: [{ currency: 'AED', amount: 120 }],
    categorySlug: 'teddy-bears',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Milk chocolate (cocoa butter, sugar, whole milk powder, cocoa mass, vanilla, soy lecithin).',
  },
  {
    slug: 'velsoro-teddy-bear-darkish',
    title: 'Velsoro Chocolate Teddy Bear – Darkish',
    imageFiles: ['DSC01882_bb49257b-bd49-4918-bbd2-bc3539dbec98.jpg', 'DSC01891_6a062c73-f268-43bf-997d-3fd232a7ec7d.jpg', 'DSC01887_1c8d5c25-fe67-4b8a-824f-687ac7ed7104.jpg'],
    bodyHtml:
      '<p>For those who love a hint of dark — our Darkish teddy bear features a deeper, less-sweet milk-dark blend that satisfies both milk and dark chocolate lovers. Hand-cast, hollow, and as adorable as ever. Approximately 200g.</p>',
    prices: [{ currency: 'AED', amount: 120 }],
    categorySlug: 'teddy-bears',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Chocolate blend (cocoa mass, sugar, cocoa butter, whole milk powder, vanilla, soy lecithin). Cocoa solids: 52% minimum.',
  },
  {
    slug: 'velsoro-teddy-bear-golden',
    title: 'Velsoro Chocolate Teddy Bear – Golden',
    imageFiles: ['DSC01879.jpg', 'DSC01894.jpg'],
    bodyHtml:
      '<p>Draped in shimmering gold — our Golden Teddy Bear is crafted from rich caramelised milk chocolate (Callebaut Gold) and hand-finished with an edible gold lustre. A luxurious keepsake gift for those special moments. Approximately 200g.</p>',
    prices: [{ currency: 'AED', amount: 145 }],
    categorySlug: 'teddy-bears',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Gold chocolate (cocoa butter, sugar, skimmed milk powder, butter milk powder, caramelised sugar, vanilla, soy lecithin), edible gold powder.',
  },
  {
    slug: 'velsoro-teddy-bear-pinky',
    title: 'Velsoro Chocolate Teddy Bear – Pinky',
    imageFiles: ['DSC01878.jpg', 'DSC01892_2a406f59-9f42-4f41-a695-edab3ca95bce.jpg', 'DSC01888.jpg', '8F490B6E-0F2B-4739-8808-C86C9EF06C4C.jpg'],
    bodyHtml:
      '<p>Naturally pink and irresistibly charming — our Pinky Teddy Bear is made from genuine Ruby chocolate, which achieves its rose hue without artificial colouring. A unique and elegant gift for any chocolate lover. Approximately 200g.</p>',
    prices: [{ currency: 'AED', amount: 145 }],
    categorySlug: 'teddy-bears',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy. May contain traces of tree nuts, gluten.',
    ingredients:
      'Ruby chocolate (cocoa butter, sugar, skimmed milk powder, cocoa mass, natural flavour, soy lecithin).',
  },

  // ── VELTERRA COLLECTION ──────────────────────────────────────────────────
  {
    slug: 'velterra-hazelnut-praline',
    title: 'Velterra Hazelnut Praline',
    imageFiles: ['IMG-3540.jpg', '054C59AB-7DC7-412A-924C-F8F50ED0F315.jpg'],
    bodyHtml:
      '<p>The Velterra Hazelnut Praline is a signature confection from our premium Velterra line — a smooth, velvety hazelnut praline encased in a thin dark chocolate shell, finished with a delicate crunch. An elevated expression of a timeless classic.</p>',
    prices: [{ currency: 'AED', amount: 185 }],
    categorySlug: 'velterra-collection',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, soy, tree nuts (hazelnuts). May contain traces of gluten.',
    ingredients:
      'Dark chocolate, hazelnut paste (roasted hazelnuts 45%), sugar, cocoa butter, cocoa mass, soy lecithin, vanilla.',
  },
  {
    slug: 'velterra-cheesecake-chocolate',
    title: 'Velterra Cheesecake Chocolate',
    imageFiles: ['1D5A8CA9-B1FA-407C-9C21-30D619941F5B.jpg', '054C59AB-7DC7-412A-924C-F8F50ED0F315.jpg'],
    bodyHtml:
      '<p>An indulgent fusion of white chocolate and cheesecake — the Velterra Cheesecake bar layers a rich cream cheese ganache between crispy biscuit crumble and smooth Velsoro white couverture. Decadent, creamy, and utterly unique.</p>',
    prices: [{ currency: 'AED', amount: 185 }],
    categorySlug: 'velterra-collection',
    inStock: true,
    dietary: { isHalal: true },
    allergens: 'Contains milk, wheat/gluten, soy. May contain traces of tree nuts, eggs.',
    ingredients:
      'White chocolate (cocoa butter, sugar, whole milk powder, vanilla, soy lecithin), cream cheese, biscuit crumble (wheat flour, sugar, butter), heavy cream.',
  },
  {
    slug: 'velterra-pistachio-chocolate',
    title: 'Velterra Pistachio Chocolate',
    imageFiles: ['4AD33AC1-9FF7-4C1A-B22D-F18154B75A65.jpg', '67E7AAE0-9B1F-4500-9AA1-B8DE9CDA0739.jpg', '054C59AB-7DC7-412A-924C-F8F50ED0F315.jpg'],
    bodyHtml:
      '<p>The Velterra Pistachio bar showcases an intensely green pistachio paste layer encased in smooth milk chocolate, topped with a feather-light crispy wafer and crushed pistachio nibs. Inspired by the finest Middle Eastern pistachio confections.</p>',
    prices: [{ currency: 'AED', amount: 185 }],
    categorySlug: 'velterra-collection',
    inStock: true,
    dietary: { isHalal: true },
    allergens:
      'Contains milk, soy, tree nuts (pistachio). May contain traces of gluten, other nuts.',
    ingredients:
      'Milk chocolate, pistachio paste (roasted pistachios 60%), cocoa butter, glucose syrup, crispy wafer (wheat flour, sugar, vegetable oil), crushed pistachios, soy lecithin.',
  },
]

export async function importVelsoro(payload?: PayloadInstance) {
  if (!payload) payload = await getPayload({ config })

  const brandId = await lookupId(payload, 'brands', 'velsoro')
  const supplierId = await lookupId(payload, 'suppliers', 'velsoro-chocolate')

  const categoryIdCache: Record<string, number> = {}
  async function getCatId(slug: string): Promise<number> {
    if (!categoryIdCache[slug]) {
      categoryIdCache[slug] = await lookupId(payload!, 'categories', slug)
    }
    return categoryIdCache[slug]!
  }

  console.log('\n=== Velsoro Products ===')

  for (const p of products) {
    const imageIds: number[] = []
    for (const file of p.imageFiles) {
      const id = await importImage(CDN + file, p.title, payload)
      if (id) imageIds.push(id)
    }
    const categoryId = await getCatId(p.categorySlug)

    await upsertProduct(payload, p.slug, {
      title: p.title,
      brand: brandId,
      supplier: supplierId,
      category: categoryId,
      countryOfOrigin: 'Belgium',
      images: imageIds.map((id) => ({ image: id })),
      shortDescription: htmlToShortDescription(p.bodyHtml),
      description: htmlToLexical(p.bodyHtml),
      inStock: p.inStock,
      prices: p.prices,
      sizeVariants: p.sizeVariants,
      ingredients: p.ingredients,
      allergens: p.allergens,
      dietary: p.dietary ?? {},
      _status: 'published',
    })
  }

  console.log('\n✅ Velsoro import complete.')
}

// Run directly: tsx src/seed/import-velsoro.ts
if (process.argv[1]?.endsWith('import-velsoro.ts')) {
  importVelsoro()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

