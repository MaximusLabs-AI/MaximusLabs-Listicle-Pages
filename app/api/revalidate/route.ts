import {revalidatePath} from 'next/cache'
import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

type RevalidationPayload = {
  _id?: string
  _type?: 'listiclePage' | 'agency' | 'listicleTemplate'
  operation?: 'create' | 'update' | 'delete'
  slug?: string
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({revalidated: false, message: 'Missing SANITY_REVALIDATE_SECRET'}, {status: 500})
  }

  try {
    const {body, isValidSignature} = await parseBody<RevalidationPayload>(request, secret)
    if (!isValidSignature) {
      return NextResponse.json({revalidated: false, message: 'Invalid webhook signature'}, {status: 401})
    }
    if (!body?._type) {
      return NextResponse.json({revalidated: false, message: 'Missing document type'}, {status: 400})
    }

    revalidatePath('/', 'page')
    revalidatePath('/listicles/[slug]', 'page')
    if (body._type === 'listiclePage' && body.slug) revalidatePath(`/listicles/${body.slug}`)

    return NextResponse.json({
      revalidated: true,
      documentId: body._id,
      documentType: body._type,
      operation: body.operation,
      slug: body.slug,
      now: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sanity webhook revalidation failed', error)
    return NextResponse.json({revalidated: false, message: 'Webhook processing failed'}, {status: 500})
  }
}
