export interface Email {
  id: number
  baseEmail: string
  generatedEmail: string
  isUsed: boolean
  usedAt: string | null
  createdAt: string
  note: string | null
  tags: string[]
}

const STORAGE_KEY = 'gmail-dot-generator-emails'

export function getEmails(): Email[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveEmails(emails: Email[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(emails))
}

export function addEmails(newEmails: Omit<Email, 'id'>[]): { inserted: number; total: number } {
  const existing = getEmails()
  const existingSet = new Set(existing.map(e => e.generatedEmail))

  let maxId = existing.reduce((max, e) => Math.max(max, e.id), 0)
  let inserted = 0

  const toAdd: Email[] = []
  for (const email of newEmails) {
    if (!existingSet.has(email.generatedEmail)) {
      maxId++
      toAdd.push({ ...email, id: maxId })
      existingSet.add(email.generatedEmail)
      inserted++
    }
  }

  saveEmails([...existing, ...toAdd])
  return { inserted, total: newEmails.length }
}

export function updateEmail(id: number, updates: Partial<Email>): void {
  const emails = getEmails()
  const index = emails.findIndex(e => e.id === id)
  if (index !== -1) {
    emails[index] = { ...emails[index], ...updates }
    saveEmails(emails)
  }
}

// Master Tags Storage
const TAGS_STORAGE_KEY = 'gmail-dot-generator-master-tags'
const DEFAULT_TAGS = ['google', 'netflix', 'facebook', 'twitter', 'amazon']

export function getMasterTags(): string[] {
  if (typeof window === 'undefined') return DEFAULT_TAGS
  const data = localStorage.getItem(TAGS_STORAGE_KEY)
  return data ? JSON.parse(data) : DEFAULT_TAGS
}

export function saveMasterTags(tags: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags))
}

export function addMasterTag(tag: string): void {
  const tags = getMasterTags()
  const normalized = tag.toLowerCase().trim()
  if (normalized && !tags.includes(normalized)) {
    saveMasterTags([...tags, normalized].sort((a, b) => a.localeCompare(b)))
  }
}

export function removeMasterTag(tag: string): void {
  const tags = getMasterTags()
  saveMasterTags(tags.filter(t => t !== tag))
}

export function deleteEmail(id: number): void {
  const emails = getEmails()
  saveEmails(emails.filter(e => e.id !== id))
}

export function deleteEmailsByBase(baseEmail: string): void {
  const emails = getEmails()
  saveEmails(emails.filter(e => e.baseEmail !== baseEmail))
}

export function deleteAllEmails(): void {
  saveEmails([])
}

export function exportData(): string {
  return JSON.stringify(getEmails(), null, 2)
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (Array.isArray(data)) {
      saveEmails(data)
      return true
    }
    return false
  } catch {
    return false
  }
}
