import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/db'
import { emails } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDb()
    const id = parseInt(params.id)
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if ('isUsed' in body) {
      updateData.isUsed = body.isUsed
      updateData.usedAt = body.isUsed ? new Date() : null
    }
    
    if ('note' in body) {
      updateData.note = body.note
    }

    await db.update(emails).set(updateData).where(eq(emails.id, id))

    return NextResponse.json({ message: 'Email updated' })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDb()
    const id = parseInt(params.id)
    await db.delete(emails).where(eq(emails.id, id))
    return NextResponse.json({ message: 'Email deleted' })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 })
  }
}
