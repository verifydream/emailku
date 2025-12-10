export type GenerationMode = 'dot' | 'plus' | 'mixed'

export function generateVariations(email: string, mode: GenerationMode = 'dot', tag: string = ''): string[] {
  const [localPart, domain] = email.split('@')
  
  if (!localPart || !domain) {
    throw new Error('Invalid email format')
  }

  const cleanLocal = localPart.replace(/\./g, '')
  
  // Base logic for dots
  const generateDots = () => {
    if (cleanLocal.length < 2) return [`${cleanLocal}@${domain}`]

    const variations: Set<string> = new Set()
    const positions = cleanLocal.length - 1
    const totalCombinations = Math.pow(2, positions)

    for (let i = 0; i < totalCombinations; i++) {
      let result = cleanLocal[0]
      for (let j = 0; j < positions; j++) {
        if ((i >> j) & 1) result += '.'
        result += cleanLocal[j + 1]
      }
      variations.add(`${result}@${domain}`)
    }
    
    // Remove original no-dot version if generating dots (except if it's the only one possible)
    if (variations.size > 1) {
       variations.delete(`${cleanLocal}@${domain}`)
    }
    
    return Array.from(variations)
  }

  let results: string[] = []

  if (mode === 'plus') {
     // Plus only: cleanLocal + tag + @domain
     // e.g., user+work@gmail.com
     if (!tag) throw new Error('Tag is required for Plus mode')
     results = [`${cleanLocal}+${tag}@${domain}`]
  } else if (mode === 'mixed') {
     // Mixed: All dot variations + tag
     // e.g., u.ser+work@gmail.com
     if (!tag) throw new Error('Tag is required for Mixed mode')
     const dots = generateDots()
     results = dots.map(d => {
       const [l, dom] = d.split('@')
       return `${l}+${tag}@${dom}`
     })
  } else {
     // Dot only (default)
     results = generateDots()
  }

  return results.sort((a, b) => {
    const dotsA = (a.match(/\./g) || []).length
    const dotsB = (b.match(/\./g) || []).length
    
    if (dotsA !== dotsB) {
      return dotsA - dotsB
    }
    
    return a.localeCompare(b)
  })
}

export function generateDotVariations(email: string): string[] {
  return generateVariations(email, 'dot')
}

export function isValidGmail(email: string): boolean {
  const gmailRegex = /^[a-zA-Z0-9]+@gmail\.com$/i
  const cleanEmail = email.replace(/\./g, '').replace('@gmailcom', '@gmail.com')
  return gmailRegex.test(cleanEmail)
}
