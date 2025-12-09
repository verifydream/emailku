import { NextRequest, NextResponse } from 'next/server'
import { db, initDb } from '@/db'
import { emails } from '@/db/schema'
import { generateDotVariations, isValidGmail } from '@/lib/generator'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    await initDb()
    const allEmails = await db.select().from(emails).orderBy(emails.id)
    return NextResponse.json(allEmails)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb()
    const { email } = await request.json()
    
    if (!email || !isValidGmail(email)) {
      return NextResponse.json({ error: 'Invalid Gmail address' }, { status: 400 })
    }

    const variations = generateDotVariations(email)
    const baseEmail = email.toLowerCase().replace(/\./g, '').replace('@gmailcom', '@gmail.com')
    
    let inserted = 0
    
    for (const generatedEmail of variations) {
      try {
        await db.insert(emails).values({
          baseEmail,
          generatedEmail,
          isUsed: false,
        }).onConflictDoNothing()
        inserted++
      } catch {
        // Skip duplicates
      }
    }

    return NextResponse.json({ 
      message: `Generated ${inserted} new email variations`,
      total: variations.length,
      inserted 
    })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to generate emails' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await initDb()
    await db.delete(emails)
    return NextResponse.json({ message: 'All emails deleted' })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 })
  }
}
