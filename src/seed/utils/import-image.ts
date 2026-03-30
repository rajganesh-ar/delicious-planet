import type { Payload } from 'payload'

export async function importImage(
  url: string,
  alt: string,
  payload: Payload,
): Promise<number | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const arrayBuffer = await res.arrayBuffer()
    const data = Buffer.from(arrayBuffer)

    const rawFilename = url.split('/').pop() ?? 'image.jpg'
    const filename = rawFilename.split('?')[0]!

    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
    const mimetype = ext === 'png' ? 'image/png' : ext === 'avif' ? 'image/avif' : 'image/jpeg'

    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data,
        mimetype,
        name: filename,
        size: data.length,
      },
    })

    return doc.id as number
  } catch {
    return null
  }
}
