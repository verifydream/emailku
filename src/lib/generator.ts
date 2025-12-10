export function generateDotVariations(email: string): string[] {
  const [localPart, domain] = email.split('@')
  
  if (!localPart || !domain) {
    throw new Error('Invalid email format')
  }

  const cleanLocal = localPart.replace(/\./g, '')
  
  if (cleanLocal.length < 2) {
    return [`${cleanLocal}@${domain}`]
  }

  const variations: Set<string> = new Set()
  const positions = cleanLocal.length - 1
  const totalCombinations = Math.pow(2, positions)

  for (let i = 0; i < totalCombinations; i++) {
    let result = cleanLocal[0]
    
    for (let j = 0; j < positions; j++) {
      if ((i >> j) & 1) {
        result += '.'
      }
      result += cleanLocal[j + 1]
    }
    
    variations.add(`${result}@${domain}`)
  }

  // Remove the original email (no dots added) which corresponds to i=0
  variations.delete(`${cleanLocal}@${domain}`)

  return Array.from(variations).sort((a, b) => {
    const dotsA = (a.match(/\./g) || []).length
    const dotsB = (b.match(/\./g) || []).length
    
    if (dotsA !== dotsB) {
      return dotsA - dotsB
    }
    
    return a.localeCompare(b)
  })
}

export function isValidGmail(email: string): boolean {
  const gmailRegex = /^[a-zA-Z0-9]+@gmail\.com$/i
  const cleanEmail = email.replace(/\./g, '').replace('@gmailcom', '@gmail.com')
  return gmailRegex.test(cleanEmail)
}
